import React, { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider} from '@coral-xyz/anchor';
import type {Idl } from '@coral-xyz/anchor';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import idl from '../../idl/zephyr.json';
import type { Zephyr } from '../../idl/zephyr';
import { ProgramContext } from './ProgramContext';



// Define the Anchor-compatible wallet interface locally to avoid versioning issues
interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
}

export const ProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;

    const anchorWallet: AnchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };

    const provider = new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: 'processed',
    });

    return new Program(idl as unknown as Zephyr, provider);
  }, [connection, wallet]);

  return (
    <ProgramContext.Provider value={{ program: program as any }}>
      {children}
    </ProgramContext.Provider>
  );
};
