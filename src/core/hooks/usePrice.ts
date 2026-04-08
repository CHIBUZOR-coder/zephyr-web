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
      return response.data;
    },
    refetchInterval: 60000, // Refresh every 60s
  });
}
