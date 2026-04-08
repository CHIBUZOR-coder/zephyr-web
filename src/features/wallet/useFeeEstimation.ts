import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { authFetch } from "../../core/query/authClient";

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
        const tx = new Transaction({
          recentBlockhash: blockhash,
          feePayer: dummyPayer,
        });

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

/**
 * Hook to fetch current SOL price in USD from our backend.
 * Our backend polls CoinGecko every 60s and caches in Redis to avoid rate limits.
 */
export function useSolPrice() {
  return useQuery({
    queryKey: ["sol-price"],
    queryFn: async () => {
      try {
        const response = await authFetch<{ success: boolean; data: { price: number } }>("/api/market/price/sol");
        return response.data.price;
      } catch (err) {
        console.warn("Failed to fetch SOL price from backend", err);
        return 79; // Fallback price
      }
    },
    refetchInterval: 60000, // Refresh every 60s
  });
}
