import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../query/authClient";

export interface SolPriceData {
  price: number;
  change24h: number;
  volume24h: number;
}

export function useSolPrice() {
  return useQuery({
    queryKey: ["sol-price"],
    queryFn: async () => {
      const response = await authFetch<{ success: boolean; data: SolPriceData }>(
        "/api/market/price/sol"
      );
      if (!response.success) throw new Error("Failed to fetch price");
      return response.data;
    },
    staleTime: 30000, // 30s
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });
}
