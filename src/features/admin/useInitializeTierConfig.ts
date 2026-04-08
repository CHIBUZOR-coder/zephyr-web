import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useProgram } from '../../core/solana/useProgram';

/**
 * Hook to initialize the TierConfig on-chain (one-time setup)
 * This creates a singleton PDA that stores tier requirements for all 5 tiers
 * 
 * Only needs to be called once per network/program deployment
 */
export const useInitializeTierConfig = () => {
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initializeTierConfig = useCallback(async (adminWallet?: PublicKey) => {
    if (!program || !publicKey) {
      const errMsg = 'Program or wallet not initialized';
      setError(errMsg);
      throw new Error(errMsg);
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setTxSignature(null);

    try {
      // Use provided admin wallet or default to current wallet
      const admin = adminWallet || publicKey;

      // 1. Derive TierConfig PDA
      const [tierConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tier_config')],
        program.programId
      );

      console.log('🔧 Initializing TierConfig...');
      console.log('   Authority:', publicKey.toBase58());
      console.log('   Admin:', admin.toBase58());
      console.log('   TierConfig PDA:', tierConfigPda.toBase58());

      // 2. Send initialization transaction
      const tx = await (program.methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .initializeTierConfig(admin) as any)
        .accounts({
          authority: publicKey,
          tierConfig: tierConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ TierConfig initialized successfully!');
      console.log('   Transaction:', tx);

      setTxSignature(tx);
      setSuccess(true);
      return tx;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize TierConfig';
      console.error('❌ Error initializing TierConfig:', err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [program, publicKey]);

  return {
    initializeTierConfig,
    isLoading,
    error,
    txSignature,
    success,
  };
};
