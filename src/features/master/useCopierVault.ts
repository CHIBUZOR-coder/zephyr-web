import { useState, useCallback } from 'react';
import { useProgram } from '../../core/solana/useProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { authFetch } from '../../core/query/authClient';
import { useWallet } from '@solana/wallet-adapter-react';

export interface CopierVaultParams {
  masterVault: string;
  maxLossPct: number;
  maxTradeSizePct: number;
  maxDrawdownPct: number;
  stopLossTriggerBps: number;
  stopLossSellBps: number;
  dailyLossLimitBps: number;
}

export const useCopierVault = () => {
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCopierVault = useCallback(async (params: CopierVaultParams) => {
    if (!program || !publicKey) {
      throw new Error('Program or wallet not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const masterVaultPubkey = new PublicKey(params.masterVault);
      
      // 1. Derive PDAs
      const [copierVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer(), masterVaultPubkey.toBuffer()],
        program.programId
      );

      // Check if copier vault already exists
      let existingVault = false;
      try {
        await program.account.copierVault.fetch(copierVaultPda);
        existingVault = true;
      } catch {
        // Account doesn't exist yet - continue with creation
      }

      if (existingVault) {
        console.log('Copier vault already exists on-chain, syncing with backend...');
        const response = await authFetch<{ success: boolean; message?: string; data: { vaultPda: string } }>('/api/vaults/copier_vault/sync', {
          method: 'POST',
          body: JSON.stringify({
            vaultPda: copierVaultPda.toString(),
            masterVault: params.masterVault,
          }),
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to sync existing vault with backend');
        }

        console.log('Existing vault synced with backend');
        return { tx: null, vault: response.data };
      }

      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        program.programId
      );

      const [riskConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('risk_config')],
        program.programId
      );

      // Fetch master vault account to get master_wallet
      console.log('Fetching master vault account details for:', masterVaultPubkey.toString());
      
      let masterVaultAccount;
      try {
        masterVaultAccount = await program.account.masterExecutionVault.fetch(masterVaultPubkey);
      } catch (fetchErr: unknown) {
        console.error('Failed to fetch master vault account:', fetchErr);
        throw new Error(`Master vault account ${masterVaultPubkey.toString()} not found on-chain. Ensure the trader has initialized their vault.`);
      }
      
      const masterWallet = masterVaultAccount.masterWallet;

      console.log('Initializing copier vault on-chain...', copierVaultPda.toString());

      let tx: string | null = null;
      try {
        tx = await (program.methods
          .initializeCopierVault(
            {
              maxLossPct: params.maxLossPct,
              maxTradeSizePct: params.maxTradeSizePct,
              maxDrawdownPct: params.maxDrawdownPct,
            },
            params.stopLossTriggerBps,
            params.stopLossSellBps,
            params.dailyLossLimitBps
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any)
          .accounts({
            copier: publicKey,
            masterWallet: masterWallet,
            vault: copierVaultPda,
            config: configPda,
            masterVault: masterVaultPubkey,
            riskConfig: riskConfigPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        console.log('Solana transaction successful:', tx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (txErr: any) {
        const msg = txErr?.message || String(txErr);
        if (msg.includes('already processed') || msg.includes('already been processed')) {
          console.log('Creation transaction was already processed. Continuing to sync.');
        } else {
          throw txErr;
        }
      }

      // 2. Sync with Backend
      console.log('Syncing copier vault with backend...');
      const response = await authFetch<{ success: boolean; message?: string; data: { vaultPda: string } }>('/api/vaults/copier_vault/sync', {
        method: 'POST',
        body: JSON.stringify({
          vaultPda: copierVaultPda.toString(),
          masterVault: params.masterVault,
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to sync vault with backend');
      }

      console.log('Backend sync successful');
      return { tx, vault: response.data };
    } catch (err: unknown) {
      console.error('Error creating copier vault:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  return { createCopierVault, loading, error };
};
