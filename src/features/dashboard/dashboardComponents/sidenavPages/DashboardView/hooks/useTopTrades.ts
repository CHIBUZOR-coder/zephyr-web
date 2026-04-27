import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../../../../../../core/query/authClient";

export interface TopTrade {
  id: string;
  vaultPda: string;
  signature: string;
  tokenIn: string;
  tokenOut: string;
  amountInDecimal: string;
  amountOutDecimal: string;
  executedAt: string;
  masterExecutionVault: {
    masterWallet: string;
    vaultPda: string;
    currentTier: number;
    user: {
      displayName: string | null;
      avatar: string | null;
    };
  };
}

interface TopTradesResponse {
  success: boolean;
  data: TopTrade[];
}

export function useTopTrades(limit = 3) {
  return useQuery({
    queryKey: ["top-trades", limit],
    queryFn: async () => {
      const response = await authFetch<TopTradesResponse>(`/api/trades/top-profitable?limit=${limit}`);
      if (!response.success) throw new Error("Failed to fetch top trades");
      return response.data;
    },
    staleTime: 30000, // 30s
    refetchInterval: 60000, // 1m
  });
}
