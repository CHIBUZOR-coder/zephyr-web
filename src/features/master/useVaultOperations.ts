// zephyr-web/src/features/master/useVaultOperations.ts
import { useState, useCallback } from 'react';
// Buffer polyfill for browser/webpack
import { Buffer } from 'buffer';
import { useProgram } from '../../core/solana/useProgram';
import { endpoint, isMockNetwork } from '../../core/config/solanaWallet';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, SendTransactionError } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { authFetch } from '../../core/query/authClient';
import type { TierState } from './useMasterTier';

type ApiInstruction = {
  programId: string;
  accounts: ApiAccount[];
  data: string; // base64
};

type ApiAccount = {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
};

type JupiterQuote = {
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  marketInfos: Array<{ id: string; label: string; inputMint: string; outputMint: string }>;
  routePlan: Array<{ swapInfo: { ammLabel: string; tokenFees: Array<{ mint: string; amount: string }> }; percent: number }>;
  slippageBps: number;
  _raw?: Record<string, unknown>;
};

type SwapInstructions = {
  tokenLedgerInstruction: ApiInstruction | null;
  computeBudgetInstructions: ApiInstruction[];
  setupInstructions: ApiInstruction[];
  swapInstruction: ApiInstruction;
  cleanupInstruction: ApiInstruction | null;
  addressLookupTableAddresses: string[];
  error?: string;
};


function parseSolanaError(err: unknown): string {
  const error = err as Error & { logs?: string[] };
  
  if (error instanceof SendTransactionError) {
    try {
      const logs = error.logs;
      if (logs) {
        const logsStr = logs.join(' ');
        
        // Check for rent-related failures (usually a copier account issue)
        if (logsStr.includes('insufficient funds for rent')) {
          return 'One or more copier accounts lack sufficient SOL for rent. This is a copier-side issue, not a master vault issue. Individual copier trades may fail silently—this is expected behavior.';
        }
        
        if (logsStr.includes('insufficient lamports') || logsStr.includes('insufficient funds') || logsStr.includes('0x1787')) {
          const match = logsStr.match(/insufficient lamports (\d+), need (\d+)/);
          if (match) {
            const have = parseInt(match[1]) / LAMPORTS_PER_SOL;
            const need = parseInt(match[2]) / LAMPORTS_PER_SOL;
            return `Insufficient SOL balance. You have ${have.toFixed(4)} SOL but need ${need.toFixed(4)} SOL to complete this trade. Please add more SOL to your vault.`;
          }
          return 'Insufficient SOL balance for this transaction. Please add more SOL to your vault.';
        }
        
        if (logsStr.includes('custom program error: 0x1')) {
          return 'Transaction failed due to an on-chain error. Please try again.';
        }
        
        if (logsStr.includes('depositBelowMinimum') || logsStr.includes('Minimum deposit')) {
          return 'Deposit amount is below the minimum required. Please deposit at least 0.1 SOL.';
        }
        
        if (logsStr.includes('Invalid account owner')) {
          return 'Invalid vault account. The vault may have been closed or does not exist.';
        }
        
        if (logsStr.includes('Signature verification failed')) {
          return 'Transaction signature verification failed. Please try again.';
        }
        
        if (logsStr.includes('already processed') || logsStr.includes('Blockhash not found')) {
          return 'Transaction is too old or already processed. Please try again.';
        }
        
        if (logsStr.includes('would exceed max compute budget')) {
          return 'Transaction requires too much compute. Please try again later.';
        }
      }
    } catch {
      // Fall through to default
    }
  }
  
  const message = error?.message || String(err);
  
  // Check message for rent issues
  if (message.includes('insufficient funds for rent')) {
    return 'One or more copier accounts lack sufficient SOL for rent. This is a copier-side issue, not a master vault issue. Individual copier trades may fail silently—this is expected behavior.';
  }
  
  if (message.includes('already processed') || message.includes('already been processed')) {
    return 'Transaction confirmed successfully. Your transaction has landed on-chain.';
  }
  
  if (message.includes('User rejected') || message.includes('user rejected')) {
    return 'Transaction was rejected in your wallet. No action was taken.';
  }
  
  if (message.includes('Failed to fetch') || message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (message.includes('Wallet not connected') || message.includes('not connected')) {
    return 'Wallet not connected. Please connect your wallet and try again.';
  }
  
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Transaction timed out. The transaction might still succeed on-chain. Please check your dashboard in a moment.';
  }

  // Avoid adding "Transaction failed: " prefix if the message already has it
  if (message.toLowerCase().includes('transaction failed')) {
    return message;
  }
  
  return message ? `Transaction failed: ${message}` : 'Transaction failed. Please try again.';
}


export const useVaultOperations = () => {
  const { program } = useProgram();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositToCopierVault = useCallback(async (vaultPda: string, amountSol: number) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      const amountLamports = new BN(Math.round(amountSol * LAMPORTS_PER_SOL));
      const vaultPubkey = new PublicKey(vaultPda);

      // Derivations for instruction accounts
      const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], program.programId);
      const [riskConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('risk_config')], program.programId);

      console.log(`Depositing ${amountSol} SOL to vault ${vaultPda}...`);

      let tx: string | null = null;
      try {
        tx = await (program.methods
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .deposit(amountLamports) as any)
          .accounts({
            copier: publicKey,
            vault: vaultPubkey,
            config: configPda,
            riskConfig: riskConfigPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } catch (txErr: unknown) {
        if (txErr instanceof Error) {
          const msg = txErr?.message || String(txErr);
          if (msg.includes('already processed') || msg.includes('already been processed')) {
            console.log('Deposit transaction was already processed. Treating as success.');
          } else {
            throw txErr;
          }
        }
      }

      console.log('Deposit successful:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('Deposit failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  // For Master Vault, since there's no 'deposit' instruction, we can do a simple transfer
  // if the user wants to fund the PDA, but the program currently doesn't track it as 'total_deposits'
  const transferToVault = useCallback(async (vaultPda: string, amountSol: number) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      const transaction = new (await import('@solana/web3.js')).Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(vaultPda),
          lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
        })
      );

      const signature = await program.provider.sendAndConfirm!(transaction);
      console.log('Transfer successful:', signature);
      return signature;
    } catch (err: unknown) {
      console.error('Transfer failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const withdrawFromCopierVault = useCallback(async (vaultPda: string, amountSol: number) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      const amountLamports = new BN(Math.round(amountSol * LAMPORTS_PER_SOL));
      const vaultPubkey = new PublicKey(vaultPda);

      console.log(`Withdrawing ${amountSol} SOL from copier vault ${vaultPda}...`);

      const tx = await (program.methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withdraw(amountLamports) as any)
        .accounts({
          copier: publicKey,
          vault: vaultPubkey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Withdrawal successful:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('Withdrawal failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const depositToMasterVault = useCallback(async (amountSol: number) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      const amountLamports = new BN(Math.round(amountSol * LAMPORTS_PER_SOL));
      
      const [masterVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('master_vault'), publicKey.toBuffer()],
        program.programId
      );

      console.log(`Depositing ${amountSol} SOL into master vault ${masterVaultPda.toBase58()}...`);

      const tx = await (program.methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .depositMaster(amountLamports) as any)
        .accounts({
          master: publicKey,
          masterVault: masterVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Master deposit successful:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('Master deposit failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const withdrawFromMasterVault = useCallback(async (amountSol: number) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      const amountLamports = new BN(Math.round(amountSol * LAMPORTS_PER_SOL));
      
      const [masterVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('master_vault'), publicKey.toBuffer()],
        program.programId
      );

      console.log(`Withdrawing ${amountSol} SOL from master vault capital ${masterVaultPda.toBase58()}...`);

      const tx = await (program.methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withdrawMaster(amountLamports) as any)
        .accounts({
          master: publicKey,
          masterVault: masterVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Master withdrawal successful:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('Master withdrawal failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const claimPerformanceFees = useCallback(async (amountSol: number) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      const amountLamports = new BN(Math.round(amountSol * LAMPORTS_PER_SOL));
      
      const [masterVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('master_vault'), publicKey.toBuffer()],
        program.programId
      );

      console.log(`Claiming ${amountSol} SOL in fees from master vault ${masterVaultPda.toBase58()}...`);

      const tx = await (program.methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .claimFees(amountLamports) as any)
        .accounts({
          master: publicKey,
          masterVault: masterVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Fee claim successful:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('Fee claim failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  // Utility to fetch both total and spendable SOL for the master vault
  const getMasterVaultBalances = useCallback(async () => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    const [masterVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('master_vault'), publicKey.toBuffer()],
      program.programId
    );
    
    const connection = program.provider.connection;
    const vaultLamports = await connection.getBalance(masterVaultPda);
    const vaultAccountInfo = await connection.getAccountInfo(masterVaultPda);
    
    const rentExemptMin = vaultAccountInfo
      ? await connection.getMinimumBalanceForRentExemption(vaultAccountInfo.data.length)
      : 0;
      
    const spendableLamports = Math.max(0, vaultLamports - rentExemptMin);
    
    console.log(`[BalanceCheck] PDA: ${masterVaultPda.toBase58()}`);
    console.log(`[BalanceCheck] Total: ${vaultLamports / LAMPORTS_PER_SOL} SOL, Rent: ${rentExemptMin / LAMPORTS_PER_SOL} SOL, Spendable: ${spendableLamports / LAMPORTS_PER_SOL} SOL`);
    
    return {
      totalLamports: vaultLamports,
      rentExemptMin,
      spendableLamports,
    };
  }, [program, publicKey]);

  const callTrade = useCallback(
    async (params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: number;
      minAmountOut: number;
      oraclePrice: number;
      tradeType: "Buy" | "Sell" | "PartialSell";
    }) => {
      if (!program || !publicKey)
        throw new Error("Program or wallet not initialized");

      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Tier Metrics from backend
        console.log("Fetching tier metrics for trade...");
        const tierRes = await authFetch<{ success: boolean; data: TierState }>(
          `/api/tier/masters/${publicKey.toBase58()}/tier`,
        );

        if (!tierRes.success) throw new Error("Failed to fetch tier metrics");
        const metrics = tierRes.data.metrics;

        // 2. Derive PDAs
        const [masterVaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("master_vault"), publicKey.toBuffer()],
          program.programId,
        );

        const WSOL_MINT = "So11111111111111111111111111111111111111112";
        const [vaultWsolAta] = PublicKey.findProgramAddressSync(
          [
            masterVaultPda.toBuffer(),
            new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
            new PublicKey(WSOL_MINT).toBuffer(),
          ],
          new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
        );

        const [configPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("config")],
          program.programId,
        );

        const [masterTradePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("master_trade"), masterVaultPda.toBuffer()],
          program.programId,
        );

        const [tierConfigPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("tier_config")],
          program.programId,
        );

        // Get fee wallet from config
        const configAccount = await program.account.config.fetch(configPda);
        const platformFeeWallet = configAccount.feeWallet;
        const atomicThreshold = Number(configAccount.atomicThreshold) || 0;

        // Fetch master vault to get on-chain activeCopierCount
        const masterVaultAccount =
          await program.account.masterExecutionVault.fetch(masterVaultPda);
        const onChainActiveCopierCount =
          Number(masterVaultAccount.activeCopierCount) || 0;

        const connection = program.provider.connection;

        // Decide execution path based on on-chain state
        let remainingAccounts: {
          pubkey: PublicKey;
          isWritable: boolean;
          isSigner: boolean;
        }[] = [];

        if (
          onChainActiveCopierCount > 0 &&
          onChainActiveCopierCount <= atomicThreshold
        ) {
          console.log(
            `Fetching ${onChainActiveCopierCount} copiers for atomic fan-out via RPC...`,
          );

          // Fetch directly from on-chain to ensure perfect synchronisation
          const allCopiers = await program.account.copierVault.all([
            {
              memcmp: {
                offset: 40, // 8 byte discriminator + 32 byte copier pubkey
                bytes: masterVaultPda.toBase58(),
              },
            },
          ]);

          // Filter out paused copiers exactly as the smart contract does
          const activeCopiers = allCopiers.filter((c) => !c.account.isPaused);

          remainingAccounts = activeCopiers.map((c) => ({
            pubkey: c.publicKey,
            isWritable: true,
            isSigner: false,
          }));

          console.log(
            `Prepared ${remainingAccounts.length} copier accounts for atomic fan-out (Found ${allCopiers.length} total)`,
          );
        } else {
          console.log(
            `Slot-based execution: ${onChainActiveCopierCount} copiers > threshold (${atomicThreshold}) or no copiers`,
          );
        }
        // In callTrade(), after deriving masterVaultPda and before fetching the quote:
        const vaultLamports = await connection.getBalance(masterVaultPda);
        const vaultAccountInfo = await connection.getAccountInfo(masterVaultPda);
        const rentExemptMin = vaultAccountInfo
          ? await connection.getMinimumBalanceForRentExemption(vaultAccountInfo.data.length)
          : 0;
        const spendableLamports = vaultLamports - rentExemptMin;

        if (spendableLamports < params.amountIn) {
          const spendableSol = (spendableLamports / LAMPORTS_PER_SOL).toFixed(6);
          const neededSol   = (params.amountIn   / LAMPORTS_PER_SOL).toFixed(6);
          throw new Error(
            `Vault has insufficient funds. ` +
            `Available: ${spendableSol} SOL — Required: ${neededSol} SOL. ` +
            `Use the Deposit button to fund your vault PDA before trading.`
          );
        }

        // ── Jupiter integration ────────────────────────────────────────────
        //
        // Jupiter v6 requires versioned transactions + address lookup tables (ALTs)
        // to fit the large number of accounts into a single transaction.
        // Anchor's .rpc() builds legacy (non-versioned) transactions, so we build
        // the VersionedTransaction manually.
        //
        // Network detection:
        //   devnet / testnet → mock mode (no real swap, empty jupiterInstructionData)
        //   mainnet-beta / localnet fork → real Jupiter swap

        console.log(
          `🌐 Network Check: RPC=${endpoint}, MockMode=${isMockNetwork}`,
        );

        // Correct mint addresses for Jupiter:
        //   Native SOL uses the wSOL mint (Jupiter wraps/unwraps automatically)
        const resolvedTokenIn =
          params.tokenIn === "11111111111111111111111111111111"
            ? WSOL_MINT
            : params.tokenIn;
        const resolvedTokenOut =
          params.tokenOut === "11111111111111111111111111111111"
            ? WSOL_MINT
            : params.tokenOut;

        let quoteInAmount = params.amountIn.toString();
        let quoteOutAmount = Math.floor(params.amountIn * 0.99).toString();
        let jupiterSwapAccounts: {
          pubkey: PublicKey;
          isWritable: boolean;
          isSigner: boolean;
        }[] = [];
        let jupiterInstructionData: Buffer = Buffer.alloc(0);
        const setupInstructions: import("@solana/web3.js").TransactionInstruction[] =
          [];
        let lookupTableAccounts: import("@solana/web3.js").AddressLookupTableAccount[] =
          [];

        if (isMockNetwork) {
          console.log(
            "MOCK MODE: devnet/testnet detected — skipping real Jupiter swap",
          );
        } else {
          console.log("Fetching Jupiter quote via Backend Proxy...");

          // Use our backend proxy to avoid CORS and DNS issues
          const quoteUrl =
            `/api/market/jupiter/quote` +
            `?inputMint=${resolvedTokenIn}` +
            `&outputMint=${resolvedTokenOut}` +
            `&amount=${params.amountIn}` +
            `&slippageBps=100`;

          const quoteRes = await authFetch<{ success: boolean; data: JupiterQuote; error?: string }>(quoteUrl);
          
          if (!quoteRes.success || !quoteRes.data) {
            throw new Error(`Jupiter quote failed: ${quoteRes.error || 'Unknown error'}`);
          }
          
          const quote = quoteRes.data;
          if (!quote?.outAmount)
            throw new Error("Jupiter quote returned no outAmount");

          quoteInAmount = quote.inAmount;
          quoteOutAmount = quote.outAmount;

          console.log("Fetching Jupiter swap instructions via Backend Proxy...");

          const swapRes = await authFetch<{ success: boolean; data: SwapInstructions; error?: string }>(
            "/api/market/jupiter/swap-instructions",
            {
              method: "POST",
              body: JSON.stringify({
                quoteResponse: quote._raw || quote, // Try to find the raw quote object
                userPublicKey: masterVaultPda.toBase58(),
                wrapAndUnwrapSol: true,
              }),
            },
          );

          if (!swapRes.success || !swapRes.data) {
            throw new Error(`Jupiter swap-instructions failed: ${swapRes.error || 'Unknown error'}`);
          }
          
          const swapIxResponse = swapRes.data;
          if (swapIxResponse.error)
            throw new Error(`Jupiter error: ${swapIxResponse.error}`);

          const { TransactionInstruction: JupTxIx } =
            await import("@solana/web3.js");

          // Helper: deserialise one Jupiter instruction object → TransactionInstruction
          // IMPORTANT: We ONLY replace the vault with the user wallet if it's a SIGNER (Payer).
          // This ensures the user pays for rent while the vault remains the owner for ATA derivation.
          const deserializeJupiterIx = (ix: ApiInstruction) =>
            new JupTxIx({
              programId: new PublicKey(ix.programId),
              keys: ix.accounts.map((a: ApiAccount) => {
                const isVault = a.pubkey === masterVaultPda.toBase58();
                return {
                  pubkey:
                    isVault && a.isSigner ? publicKey! : new PublicKey(a.pubkey),
                  isSigner: a.isSigner,
                  isWritable: a.isWritable,
                };
              }),
              data: Buffer.from(ix.data, "base64"),
            });

          // Setup instructions (create ATAs, etc.) run BEFORE call_trade
          if (swapIxResponse.setupInstructions?.length) {
            for (const ix of swapIxResponse.setupInstructions) {
              // SKIP any SystemProgram.transfer instructions.
              // These are for wrapping SOL, which we now handle on-chain in the Zephyr program.
              // Letting the frontend do this exhausts the user's personal wallet instead of the vault.
              if (ix.programId === SystemProgram.programId.toBase58()) {
                console.log(
                  "Skipping Jupiter setup transfer (now handled on-chain by Zephyr)",
                );
                continue;
              }
              setupInstructions.push(deserializeJupiterIx(ix));
            }
          }

          // Swap instruction accounts go into remaining_accounts on the Zephyr program
          // Here we keep the vault PDA address but mark isSigner: false so the outer tx 
          // verification passes. The program will provide the PDA signature via invoke_signed.
          const swapIx = swapIxResponse.swapInstruction;
          jupiterSwapAccounts = swapIx.accounts.map((a: ApiAccount) => ({
            pubkey: new PublicKey(a.pubkey),
            isWritable: a.isWritable,
            isSigner: a.pubkey === masterVaultPda.toBase58() ? false : a.isSigner,
          }));
          jupiterInstructionData = Buffer.from(swapIx.data, "base64");

          // Fetch address lookup tables so the versioned tx can compress account indices
          if (swapIxResponse.addressLookupTableAddresses?.length) {
            const connection = program.provider.connection;
            const results = await Promise.all(
              swapIxResponse.addressLookupTableAddresses.map((addr: string) =>
                connection.getAddressLookupTable(new PublicKey(addr)),
              ),
            );
            lookupTableAccounts = results
              .map((r) => r.value)
              .filter(
                (v): v is import("@solana/web3.js").AddressLookupTableAccount =>
                  v !== null,
              );

            // Use lookupTableAccounts here
            for (const account of lookupTableAccounts) {
              console.log(account);
            }
          }
        }

        // ── Build call_trade instruction
        console.log("Building call_trade instruction...");

        const tradeTypeEnum = {
          Buy: "buy",
          Sell: "sell",
          PartialSell: "partialSell",
        } as const;

        const rollingAumUsd = metrics.rollingAumUsd
          ? parseFloat(metrics.rollingAumUsd)
          : 0;

        const tradeParams = {
          tokenIn: new PublicKey(resolvedTokenIn),
          tokenOut: new PublicKey(resolvedTokenOut),
          amountIn: new BN(quoteInAmount),
          minAmountOut: new BN(quoteOutAmount),
          oraclePrice: new BN(params.oraclePrice),
          tradeType: { [tradeTypeEnum[params.tradeType]]: {} },
          jupiterInstructionData: jupiterInstructionData, // new field
          daysActive: metrics.daysActive || 0,
          winRateBps: metrics.winRateBps || 0,
          maxDrawdownBps: metrics.maxDrawdownBps || 0,
          rollingAumUsd: new BN(Math.floor(rollingAumUsd)),
          copierRetentionBps: metrics.copierRetentionBps || 0,
        };

        // All remaining accounts: copier vaults (atomic path) first, then Jupiter swap accounts
        const allRemainingAccounts = [
          ...remainingAccounts,
          ...jupiterSwapAccounts,
        ];

        // Build the Anchor instruction object (don't .rpc() — we need VersionedTransaction)
        const callTradeIx = await (
          program.methods
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .callTrade(tradeParams) as any
        )
          .accounts({
            master: publicKey,
            config: configPda,
            masterVault: masterVaultPda,
            masterTrade: masterTradePda,
            platformFeeWallet: platformFeeWallet,
            tierConfig: tierConfigPda,
            systemProgram: SystemProgram.programId,
            tokenProgram: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            ),
            jupiterProgram: new PublicKey(
              "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            ),
            vaultWsolAta: vaultWsolAta,
          })
          .remainingAccounts(allRemainingAccounts)
          .instruction();

        console.log("callTradeIx built:", !!callTradeIx);

        // ── Build and send VersionedTransaction ────────────────────
        const {
          TransactionMessage,
          VersionedTransaction,
        } = await import("@solana/web3.js");

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");

        const allInstructions = [
          ...setupInstructions,
          ...(callTradeIx ? [callTradeIx] : []),
        ];

        if (allInstructions.length === 0) {
          throw new Error(
            "No instructions - setupInstructions empty, callTradeIx may be undefined",
          );
        }

        const message = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions: allInstructions,
        }).compileToV0Message(lookupTableAccounts);

        const transaction = new VersionedTransaction(message);

        const signedTx = await signTransaction!(transaction);

        const rawTx = signedTx.serialize();
        const signature = await connection.sendRawTransaction(rawTx, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        );

        console.log("Trade execution successful:", signature);
        return signature;
      } catch (err: unknown) {
        console.error("Trade failed:", err);
        const friendlyError = parseSolanaError(err);

        // If the error indicates success (transaction confirmed on chain), treat it as success
        if (friendlyError.includes("Transaction confirmed successfully")) {
          console.log(
            "Trade simulation error handled as success:",
            friendlyError,
          );
          return;
        }

        setError(friendlyError);
        throw new Error(friendlyError);
      } finally {
        setLoading(false);
      }
    },
    [program, publicKey, signTransaction],
  );

  const initializeTierConfig = useCallback(async () => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    setLoading(true);
    setError(null);
    try {
      const [tierConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('tier_config')], program.programId);
      const tx = await (program.methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .initializeTierConfig(publicKey) as any)
        .accounts({
          authority: publicKey,
          tierConfig: tierConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log('TierConfig initialized:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('TierConfig init failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const initializeRiskConfig = useCallback(async () => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    setLoading(true);
    setError(null);
    try {
      const [riskConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('risk_config')], program.programId);
      const tx = await (program.methods
        .initializeRiskConfig(
          80, // max_drawdown_cap_pct (80%)
          50, // max_trade_size_cap_pct (50%)
          5000, // max_daily_loss_bps_cap (50%)
          5000, // max_stop_loss_bps_cap (50%)
          1, // min_stop_loss_pct (1%)
          new BN(0.001 * LAMPORTS_PER_SOL), // min_vault_deposit_lamports
          publicKey // admin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any)
        .accounts({
          authority: publicKey,
          riskConfig: riskConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log('RiskConfig initialized with permissive caps:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('RiskConfig init failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const updateRiskConfig = useCallback(async () => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    setLoading(true);
    setError(null);
    try {
      const [riskConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('risk_config')], program.programId);
      const tx = await (program.methods
        .updateRiskConfig(
          80, // max_drawdown_cap_pct
          50, // max_trade_size_cap_pct
          5000, // max_daily_loss_bps_cap
          5000, // max_stop_loss_bps_cap
          1, // min_stop_loss_pct
          new BN(0.001 * LAMPORTS_PER_SOL), // min_vault_deposit_lamports
          publicKey // new admin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any)
        .accounts({
          authority: publicKey,
          riskConfig: riskConfigPda,
        })
        .rpc();
      console.log('RiskConfig updated with permissive caps:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('RiskConfig update failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const updateCopierRiskParams = useCallback(async (masterVaultAddress: string, newParams: { maxLossPct: number; maxTradeSizePct: number; maxDrawdownPct: number }) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    setLoading(true);
    setError(null);
    try {
      const masterVault = new PublicKey(masterVaultAddress);
      const [copierVaultPda] = PublicKey.findProgramAddressSync([
        Buffer.from('vault'),
        publicKey.toBuffer(),
        masterVault.toBuffer(),
      ], program.programId);

      const [riskConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('risk_config')], program.programId);

      // Check if copier vault account exists on-chain
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let copierVaultAccount: any = null;
      try {
        copierVaultAccount = await program.account.copierVault.fetch(copierVaultPda);
      } catch (err) {
        console.log('Error fetching copier vault (may not exist):', err);
        copierVaultAccount = null;
      }

      // Auto-initialize if account doesn't exist (stale copy - DB has record but on-chain account missing)
      if (!copierVaultAccount) {
        console.log('Copier vault not initialized on-chain, attempting auto-initialization...');

        // Get config PDA
        const [configPda] = PublicKey.findProgramAddressSync([
          Buffer.from('config'),
        ], program.programId);

        // Try to get master wallet from master vault
        let masterWallet = publicKey;
        let isOldProgram = false;
        
        try {
          const masterVaultAccount = await program.account.masterExecutionVault.fetch(masterVault);
          if (masterVaultAccount) {
            masterWallet = masterVaultAccount.masterWallet;
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('discriminator')) {
            console.log('Master vault was created with old program version - need to reinitialize');
            isOldProgram = true;
          }
        }

        // Try to initialize the copier vault
        try {
          await (program.methods
            .initializeCopierVault(
              {
                maxLossPct: newParams.maxLossPct || 10,
                maxTradeSizePct: newParams.maxTradeSizePct || 100,
                maxDrawdownPct: newParams.maxDrawdownPct || 20,
              },
              null,
              null,
              null
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any)
            .accounts({
              copier: publicKey,
              masterWallet: masterWallet,
              vault: copierVaultPda,
              config: configPda,
              masterVault: masterVault,
              riskConfig: riskConfigPda,
              systemProgram: SystemProgram.programId,
            })
            .rpc();

          console.log('Copier vault initialized successfully');
        } catch (initErr: unknown) {
          const initErrMsg = initErr instanceof Error ? initErr.message : String(initErr);
          console.log('Init error:', initErrMsg);
          
          // If initialized or already exists, continue to update
          if (initErrMsg.includes('already been used') || initErrMsg.includes('0x0')) {
            console.log('Copier vault already initialized, continuing to update');
          } else if (isOldProgram || initErrMsg.includes('discriminator') || initErrMsg.includes('AccountNotInitialized')) {
            // Only throw if both fetch AND init fail with program mismatch
            throw new Error(
              'This copier relationship was created with an old version of the Zephyr program. ' +
              'Please re-copy this master vault to create a fresh relationship with the current program.'
            );
          } else {
            // Other error - rethrow
            throw initErr;
          }
        }
      }

      const tx = await (program.methods
        .updateRiskParams(
          { maxLossPct: newParams.maxLossPct, maxTradeSizePct: newParams.maxTradeSizePct, maxDrawdownPct: newParams.maxDrawdownPct },
          null, // newStopLossTriggerBps
          null, // newStopLossSellBps
          null, // newDailyLossLimitBps
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any)
        .accounts({
          copier: publicKey,
          copierVault: copierVaultPda,
          riskConfig: riskConfigPda,
        })
        .rpc();
      console.log('Copier risk params updated:', tx);

      try {
        await authFetch(`/api/vaults/copier/${copierVaultPda.toBase58()}/risk-params`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newParams),
        });
        console.log('Copier risk params updated in database');
      } catch (dbErr) {
        console.warn('Failed to update risk params in database (on-chain update succeeded):', dbErr);
      }

      return tx;
    } catch (err: unknown) {
      console.error('Update risk params failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      
      // Provide helpful error message
      let friendlyError = parseSolanaError(err);
      if (errMsg.includes('discriminator')) {
        friendlyError = 'This copier relationship was created with an old version of the program. Please re-copy the master vault.';
      }
      
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const closeMasterVault = useCallback(async () => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    setLoading(true);
    setError(null);
    try {
      console.log('Closing Master Execution Vault...');
      const tx = await program.methods
        .closeMasterVault()
        .accounts({
          master: publicKey,
        })
        .rpc();
      
      console.log('Master vault closed successfully:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('Close master vault failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const clearError = useCallback(() => setError(null), []);


  return {
    depositToCopierVault,
    transferToVault,
    depositToMasterVault,
    withdrawFromCopierVault,
    withdrawFromMasterVault,
    claimPerformanceFees,
    callTrade,
    initializeTierConfig,
    initializeRiskConfig,
    updateRiskConfig,
    updateCopierRiskParams,
    closeMasterVault,
    getMasterVaultBalances,
    loading,
    error,
    clearError,
  };
}
