// zephyr-web/src/features/master/useVaultOperations.ts
import { useState, useCallback } from 'react';
import { useProgram } from '../../core/solana/useProgram';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { authFetch } from '../../core/query/authClient';
import type { TierState } from './useMasterTier';

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
      setError((err as Error).message || 'Deposit failed');
      throw err;
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
      setError((err as Error).message || 'Transfer failed');
      throw err;
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
      setError((err as Error).message || 'Withdrawal failed');
      throw err;
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
      setError((err as Error).message || 'Deposit failed');
      throw err;
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
      setError((err as Error).message || 'Withdrawal failed');
      throw err;
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
      setError((err as Error).message || 'Fee claim failed');
      throw err;
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
      setError((err as Error).message || 'Trade failed');
      throw err;
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
      // if (err.logs) {
      //   console.log('Program Logs:', err.logs);
      // }
      setError((err as Error).message || 'TierConfig init failed');
      throw err;
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
      setError((err as Error).message || 'RiskConfig init failed');
      throw err;
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
      setError((err as Error).message || 'RiskConfig update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  return { depositToCopierVault, transferToVault, depositToMasterVault, withdrawFromCopierVault, withdrawFromMasterVault, claimPerformanceFees, callTrade, initializeTierConfig, initializeRiskConfig, updateRiskConfig, loading, error };
};
