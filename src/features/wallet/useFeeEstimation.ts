import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

/**
 * Hook to estimate the network fee for a standard SOL transfer.
 */
export function useFeeEstimation() {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["network-fee"],
    queryFn: async () => {
      try {
        // Use modern API to get fee estimation
        const { blockhash } = await connection.getLatestBlockhash();
        
        // Create a dummy transaction message to estimate fee
        const dummyPayer = new PublicKey("11111111111111111111111111111111");
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: dummyPayer,
            toPubkey: dummyPayer,
            lamports: 0,
          })
        );
        
        tx.recentBlockhash = blockhash;
        tx.feePayer = dummyPayer;

        const feeResponse = await connection.getFeeForMessage(tx.compileMessage());
        
        if (feeResponse.value !== null) {
          return feeResponse.value / LAMPORTS_PER_SOL;
        }
        
        return 0.000005; // Standard 5000 lamports fallback
      } catch (err) {
        console.warn("Failed to fetch dynamic fee, using fallback", err);
        return 0.000005;
      }
    },
    // Refresh every minute
    refetchInterval: 60000,
  });
}
