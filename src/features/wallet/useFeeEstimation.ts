import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";

/**
 * Hook to estimate the network fee for a standard SOL transfer.
 */
export function useFeeEstimation() {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["network-fee"],
    queryFn: async () => {
      try {
        const { TransactionMessage } = await import("@solana/web3.js");

        // Use modern API to get fee estimation
        const { blockhash } = await connection.getLatestBlockhash();

        // Create a dummy transaction message to estimate fee
        // We use a valid-looking user address that isn't a program ID
        const dummyPayer = new PublicKey(
          "Gv9mCsh6SAt88p3D8E22TidZUpMhXFkQ1RzXh84q8k9E",
        );
        const dummyReceiver = new PublicKey(
          "3uYpXid8zC7GWhuFzZpYmE6rK6L7pYyR7L8z5z5z5z5z",
        );

        const instructions = [
          SystemProgram.transfer({
            fromPubkey: dummyPayer,
            toPubkey: dummyReceiver,
            lamports: 1000,
          }),
        ];

        const messageV0 = new TransactionMessage({
          payerKey: dummyPayer,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        const feeResponse = await connection.getFeeForMessage(messageV0);

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
