// zephyr-web/src/features/master/useVaultOperations.ts
import { useState, useCallback } from 'react';
import { useProgram } from '../../core/solana/useProgram';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, SendTransactionError } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { authFetch } from '../../core/query/authClient';
import type { TierState } from './useMasterTier';

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
        
        return 'Transaction failed. Please try again or contact support if the issue persists.';
      }
    } catch {
      // Fall through to default
    }
  }
  
  const message = error?.message || String(err);
  
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
    return 'Transaction timed out. Please try again.';
  }
  
  return message || 'Transaction failed. Please try again.';
}

export const useVaultOperations = () => {
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositToCopierVault = useCallback(async (vaultPda: string, amountSol: number) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      const amountLamports = new BN(amountSol * LAMPORTS_PER_SOL);
      const vaultPubkey = new PublicKey(vaultPda);

      // Derivations for instruction accounts
      const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], program.programId);
      const [riskConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('risk_config')], program.programId);

      console.log(`Depositing ${amountSol} SOL to vault ${vaultPda}...`);

      const tx = await (program.methods
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
          lamports: amountSol * LAMPORTS_PER_SOL,
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
      const amountLamports = new BN(amountSol * LAMPORTS_PER_SOL);
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
      const amountLamports = new BN(amountSol * LAMPORTS_PER_SOL);
      
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
      const amountLamports = new BN(amountSol * LAMPORTS_PER_SOL);
      
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
      const amountLamports = new BN(amountSol * LAMPORTS_PER_SOL);
      
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

  const callTrade = useCallback(async (params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    minAmountOut: number;
    oraclePrice: number;
    tradeType: 'Buy' | 'Sell' | 'PartialSell';
  }) => {
    if (!program || !publicKey) throw new Error('Program or wallet not initialized');
    
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Tier Metrics from backend
      console.log('Fetching tier metrics for trade...');
      const tierRes = await authFetch<{ success: boolean; data: TierState }>(
        `/api/tier/masters/${publicKey.toBase58()}/tier`
      );
      
      if (!tierRes.success) throw new Error('Failed to fetch tier metrics');
      const metrics = tierRes.data.metrics;

      // 2. Derive PDAs
      const [masterVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('master_vault'), publicKey.toBuffer()],
        program.programId
      );

      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        program.programId
      );

      const [masterTradePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('master_trade'), masterVaultPda.toBuffer()],
        program.programId
      );

      const [tierConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tier_config')],
        program.programId
      );

      // Get fee wallet from config (we might need to fetch this first or hardcode for now)
      // For now, let's fetch config account
      const configAccount = await program.account.config.fetch(configPda);
      const platformFeeWallet = configAccount.feeWallet;

      console.log('Executing callTrade on-chain...');

      const tradeParams = {
        tokenIn: new PublicKey(params.tokenIn),
        tokenOut: new PublicKey(params.tokenOut),
        amountIn: new BN(params.amountIn),
        minAmountOut: new BN(params.minAmountOut),
        oraclePrice: new BN(params.oraclePrice),
        tradeType: { [params.tradeType.toLowerCase()]: {} },
        daysActive: metrics.daysActive,
        winRateBps: metrics.winRateBps,
        maxDrawdownBps: metrics.maxDrawdownBps,
        rollingAumUsd: new BN(metrics.rollingAumUsd),
        copierRetentionBps: metrics.copierRetentionBps,
      };

      const tx = await (program.methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .callTrade(tradeParams) as any)
        .accounts({
          master: publicKey,
          config: configPda,
          masterVault: masterVaultPda,
          masterTrade: masterTradePda,
          platformFeeWallet: platformFeeWallet,
          tierConfig: tierConfigPda,
          systemProgram: SystemProgram.programId,
          jupiterProgram: new PublicKey('JUP6LkbZbjS1jKKccwgwsS1iUCszzuSps7is8Z9vpk7'),
        })
        .rpc();

      console.log('Trade execution successful:', tx);
      return tx;
    } catch (err: unknown) {
      console.error('Trade failed:', err);
      const friendlyError = parseSolanaError(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

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

  return { depositToCopierVault, transferToVault, depositToMasterVault, withdrawFromCopierVault, withdrawFromMasterVault, claimPerformanceFees, callTrade, initializeTierConfig, initializeRiskConfig, updateRiskConfig, loading, error };
};
