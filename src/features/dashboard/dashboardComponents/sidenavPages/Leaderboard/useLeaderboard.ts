import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../../../../../core/query/authClient";
import type { Trader, LeaderboardPeriod, LeaderboardSort } from "./leaderboar.types";

const MAX_DISPLAY_PCT = 99999; // Cap display at 99,999%

function formatRoiPct(roiPct: number): string {
  const capped = Math.abs(roiPct) > MAX_DISPLAY_PCT ? Math.sign(roiPct) * MAX_DISPLAY_PCT : roiPct;
  return `${capped >= 0 ? "+" : ""}${capped.toFixed(1)}%`;
}

function formatCompactNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
}

export interface TraderMetrics {
  volumeUsd: number;
  winRatePct: number;
  maxDrawdownPct: number;
  aumUsd: number;
  pnlUsd: number;
  roiPct: number;
  activeCopiers: number;
  totalTrades: number;
  copierRetentionPct: number;
  daysActive: number;
}

export interface LeaderboardEntry {
  rank: number;
  masterWallet: string;
  vaultPda: string;
  user: {
    walletAddress: string;
    displayName: string | null;
    avatar: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  currentTier: number;
  tierLabel: string;
  tierShortLabel: string;
  metrics: TraderMetrics;
  compositeScore: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    traders: LeaderboardEntry[];
    total: number;
    page: number;
    limit: number;
  };
}

function mapLeaderboardEntryToTrader(entry: LeaderboardEntry): Trader {
  return {
    id: entry.rank,
    rank: entry.rank,
    name: entry.user.displayName || `Trader ${entry.masterWallet.slice(0, 4)}`,
    image: entry.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.masterWallet}`,
    tag: entry.tierShortLabel,
    tiers: entry.tierLabel,
    type: "PRO",
    pnl: formatRoiPct(entry.metrics.roiPct),
    aum: `$${formatCompactNumber(entry.metrics.aumUsd)}`,
    winRate: `${entry.metrics.winRatePct.toFixed(0)}%`,
    drawdown: `${entry.metrics.maxDrawdownPct.toFixed(1)}%`,
    trades: entry.metrics.totalTrades || 0,
    copiers: entry.metrics.activeCopiers,
    rio: parseFloat(entry.metrics.roiPct.toFixed(1)),
    follows: entry.metrics.activeCopiers,
    followsDisplay: formatCompactNumber(entry.metrics.activeCopiers),
    sol: (entry.metrics.aumUsd / 150).toFixed(0),
    address: entry.masterWallet,
    vaultAddress: entry.vaultPda,
    createdAt: entry.user.createdAt,
    updatedAt: entry.user.updatedAt,
  };
}

export function useLeaderboard(params: {
  period?: LeaderboardPeriod;
  sort?: LeaderboardSort;
  tier?: number;
  page?: number;
  limit?: number;
} = {}) {
  const { period = "30d", sort = "pnl", tier, page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ["leaderboard", period, sort, tier, page, limit],
    queryFn: async () => {
      let url = `/api/leaderboard?period=${period}&sort=${sort}&page=${page}&limit=${limit}`;
      if (tier !== undefined) url += `&tier=${tier}`;

      const response = await authFetch<LeaderboardResponse>(url);
      if (!response.success) throw new Error("Failed to fetch leaderboard");
      
      return {
        traders: response.data.traders.map(mapLeaderboardEntryToTrader),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      };
    },
    staleTime: 60000, // 60s
  });
}

/** Lean version for dashboard display */
export function useDashboardLeaderboard() {
  const query = useLeaderboard({ period: "30d", sort: "pnl", limit: 10 });
  
  return {
    leaders: query.data?.traders ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

interface TraderProfileResponse {
  success: boolean;
  data?: LeaderboardEntry;
  error?: string;
}

export function useTraderProfile(vaultAddress: string | undefined) {
  return useQuery({
    queryKey: ["trader-profile", vaultAddress],
    queryFn: async () => {
      if (!vaultAddress) return null;
      const response = await authFetch<TraderProfileResponse>(
        `/api/leaderboard/trader/${vaultAddress}`
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || "Trader not found");
      }
      return mapLeaderboardEntryToTrader(response.data);
    },
    enabled: !!vaultAddress,
    staleTime: 60000,
  });
}
