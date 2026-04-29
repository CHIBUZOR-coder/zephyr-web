// zephyr-web/src/features/master/useVaultOperations.ts
import { useState, useCallback } from 'react';
import { useProgram } from '../../core/solana/useProgram';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, SendTransactionError } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { authFetch } from '../../core/query/authClient';
import type { TierState } from './useMasterTier';

type ApiAccount = {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
};

type ApiInstruction = {
  programId: string;
  accounts: ApiAccount[];
  data: string; // base64
};


function parseSolanaError(err: unknown): string {
  const error = err as Error & { logs?: string[] };
  
  if (error instanceof SendTransactionError) {
    try {
      const logs = error.logs;
      if (logs) {
        const logsStr = logs.join(' ');
        
        if (logsStr.includes('insufficient lamports') || logsStr.includes('insufficient funds')) {
          const match = logsStr.match(/insufficient lamports (\d+), need (\d+)/);
          if (match) {
            const have = parseInt(match[1]) / LAMPORTS_PER_SOL;
            const need = parseInt(match[2]) / LAMPORTS_PER_SOL;
            return `Insufficient balance. You have ${have.toFixed(4)} SOL but need ${need.toFixed(4)} SOL.`;
          }
          return 'Insufficient SOL balance for this transaction. Please check your wallet balance.';
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

        // const rpcUrl = program.provider.connection.rpcEndpoint;
        const rpcUrl =
          import.meta.env.VITE_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com";

        const isMockNetwork =
          rpcUrl.includes("devnet") ||
          rpcUrl.includes("testnet") ||
          rpcUrl.includes("localhost") ||
          rpcUrl.includes("127.0.0.1") ||
          rpcUrl.includes("api.devnet.solana.com");

        // Note: Real Jupiter swaps require mainnet-only (not fork) due to program cloning limitations

        console.log(
          `🌐 Network Check: RPC=${rpcUrl}, MockMode=${isMockNetwork}`,
        );

        // Correct mint addresses for Jupiter:
        //   Native SOL uses the wSOL mint (Jupiter wraps/unwraps automatically)
        const WSOL_MINT = "So11111111111111111111111111111111111111112";
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
        let jupiterInstructionData: Buffer = Buffer.alloc(0); // empty = mock mode
        const setupInstructions: import("@solana/web3.js").TransactionInstruction[] =
          [];
        let cleanupInstruction:
          | import("@solana/web3.js").TransactionInstruction
          | null = null;
        let lookupTableAccounts: import("@solana/web3.js").AddressLookupTableAccount[] =
          [];

        const JUPITER_API_KEY = import.meta.env.VITE_JUPITER_API_KEY || "";

        if (isMockNetwork) {
          console.log(
            "MOCK MODE: devnet/testnet detected — skipping real Jupiter swap",
          );
        } else {
          console.log("Fetching Jupiter quote...");

          const quoteUrl =
            `https://api.jup.ag/swap/v1/quote` +
            `?inputMint=${resolvedTokenIn}` +
            `&outputMint=${resolvedTokenOut}` +
            `&amount=${params.amountIn}` +
            `&slippageBps=100`;

          const quoteRes = await fetch(quoteUrl, {
            headers: JUPITER_API_KEY ? { "x-api-key": JUPITER_API_KEY } : {},
          });
          if (!quoteRes.ok)
            throw new Error(`Jupiter quote failed: ${quoteRes.status}`);
          const quote = await quoteRes.json();
          if (!quote?.inAmount)
            throw new Error("Jupiter quote returned no inAmount");

          quoteInAmount = quote.inAmount;
          quoteOutAmount = quote.outAmount;

          console.log("Fetching Jupiter swap instructions...");

          const swapRes = await fetch(
            "https://api.jup.ag/swap/v1/swap-instructions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(JUPITER_API_KEY ? { "x-api-key": JUPITER_API_KEY } : {}),
              },
              body: JSON.stringify({
                quoteResponse: quote,
                userPublicKey: publicKey.toBase58(),
                wrapAndUnwrapSol: true,
                // computeUnitPriceMicroLamports: 'auto', // optional priority fee
              }),
            },
          );
          if (!swapRes.ok)
            throw new Error(
              `Jupiter swap-instructions failed: ${swapRes.status}`,
            );
          const swapIxResponse = await swapRes.json();
          if (swapIxResponse.error)
            throw new Error(`Jupiter error: ${swapIxResponse.error}`);

          const { TransactionInstruction: JupTxIx } =
            await import("@solana/web3.js");

          // Helper: deserialise one Jupiter instruction object → TransactionInstruction
          const deserializeJupiterIx = (ix: ApiInstruction) =>
            new JupTxIx({
              programId: new PublicKey(ix.programId),
              keys: ix.accounts.map((a: ApiAccount) => ({
                pubkey: new PublicKey(a.pubkey),
                isSigner: a.isSigner,
                isWritable: a.isWritable,
              })),
              data: Buffer.from(ix.data, "base64"),
            });

          // Setup instructions (create ATAs, etc.) run BEFORE call_trade
          if (swapIxResponse.setupInstructions?.length) {
            for (const ix of swapIxResponse.setupInstructions) {
              setupInstructions.push(deserializeJupiterIx(ix));
            }
          }

          // Cleanup instruction (close wSOL ATA) runs AFTER call_trade
          if (swapIxResponse.cleanupInstruction) {
            cleanupInstruction = deserializeJupiterIx(
              swapIxResponse.cleanupInstruction,
            );
          }

          // Swap instruction accounts go into remaining_accounts on the Zephyr program
          const swapIx = swapIxResponse.swapInstruction;
          jupiterSwapAccounts = swapIx.accounts.map((a: ApiAccount) => ({
            pubkey: new PublicKey(a.pubkey),
            isWritable: a.isWritable,
            isSigner: a.isSigner,
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
            jupiterProgram: new PublicKey(
              "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            ),
          })
          .remainingAccounts(allRemainingAccounts)
          .instruction();

        console.log("callTradeIx built:", !!callTradeIx);

        // ── Build and send Transaction ────────────────────────────
        const { Transaction } = await import("@solana/web3.js");

        const connection = program.provider.connection;
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");

        // Use legacy transaction (works with all wallets)
        const transaction = new Transaction({
          feePayer: publicKey,
          recentBlockhash: blockhash,
        });

        if (setupInstructions.length > 0) {
          transaction.add(...setupInstructions);
        }
        if (callTradeIx) {
          transaction.add(callTradeIx);
        }
        if (cleanupInstruction) {
          transaction.add(cleanupInstruction);
        }

        console.log(
          "Transaction instructions count:",
          transaction.instructions.length,
        );

        if (transaction.instructions.length === 0) {
          throw new Error(
            "No instructions - setupInstructions empty, callTradeIx may be undefined",
          );
        }

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

  return { depositToCopierVault, transferToVault, depositToMasterVault, withdrawFromCopierVault, withdrawFromMasterVault, claimPerformanceFees, callTrade, initializeTierConfig, initializeRiskConfig, updateRiskConfig, updateCopierRiskParams, loading, error };
};