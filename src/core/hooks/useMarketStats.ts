import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../query/authClient";
import { useSolPrice } from "./usePrice";

export interface AlphaSignals {
  riskAdjustedRatio: { value: number; label: string; status: string };
  avgTradeHoldHours: { value: number; label: string; status: string };
  totalCopierEquityUsd: { value: number; formatted: string; status: string };
  totalActiveMasters: number;
  totalActiveCopiers: number;
  protocolVolumeUsd30d: number;
  protocolVolumeUsdAllTime: number;
}

export interface TrendingToken {
  symbol: string;
  name: string;
  priceUsd: string;
  change24h: number;
  volume24h: string;
}

export function useAlphaSignals() {
  return useQuery({
    queryKey: ["alpha-signals"],
    queryFn: async () => {
      const response = await authFetch<{
        success: boolean;
        data: AlphaSignals;
      }>("/api/leaderboard/alpha-signals");
      return response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });
}

export function useTrendingTokens() {
  return useQuery({
    queryKey: ["trending-tokens"],
    queryFn: async () => {
      const response = await authFetch<{
        success: boolean;
        data: TrendingToken[];
      }>("/api/market/trending");
      return response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 300000, // 5 mins
    refetchIntervalInBackground: true,
  });
}

export function useMarketStats() {
  const { data: solPriceData, isLoading: solLoading } = useSolPrice();
  const { data: alphaSignals, isLoading: alphaLoading } = useAlphaSignals();
  const { data: trendingTokens, isLoading: trendingLoading } =
    useTrendingTokens();

  const rotationInterval = 6000;
  // Initialize with consistent time-based index
  const [tick, setTick] = useState(() => Math.floor(Date.now() / rotationInterval));

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Math.floor(Date.now() / rotationInterval));
    }, 1000); // Check every second for transition
    return () => clearInterval(timer);
  }, []);

  // DETERMINISTIC SYNC-ROTATION
  // Every 6 seconds, we switch to the next token. 
  // Using tick ensures all users see the same token at the same time and render is pure.
  const currentIndex = trendingTokens?.length 
    ? tick % trendingTokens.length 
    : 0;

  const activeToken = trendingTokens?.[currentIndex];

  return {
    solPrice: solPriceData?.price,
    solChange: solPriceData?.change24h ?? 0,
    solVolume: solPriceData?.volume24h,
    networkVolume: alphaSignals?.protocolVolumeUsd30d,
    networkVolumeAllTime: alphaSignals?.protocolVolumeUsdAllTime,
    volumeChange: 0.8,
    trendingToken: activeToken?.symbol || "Loading...",
    trendingChange: activeToken?.change24h || 0,
    isLoading: solLoading || alphaLoading || trendingLoading,
  };
}
