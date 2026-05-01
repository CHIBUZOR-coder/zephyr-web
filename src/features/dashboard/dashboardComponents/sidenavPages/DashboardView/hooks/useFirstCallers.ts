import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../../../../../../core/query/authClient";

export interface FirstCaller {
  id: string;
  vaultPda: string;
  signature: string;
  tokenIn: string;
  tokenOut: string;
  amountInDecimal: string;
  amountOutDecimal: string;
  executedAt: string;
  isFirstCaller: boolean;
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

interface FirstCallersResponse {
  success: boolean;
  data: FirstCaller[];
}

export function useFirstCallers(limit = 10) {
  return useQuery({
    queryKey: ["first-callers", limit],
    queryFn: async () => {
      const response = await authFetch<FirstCallersResponse>(`/api/trades/first-callers?limit=${limit}`);
      if (!response.success) throw new Error("Failed to fetch first callers");
      return response.data ?? [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}