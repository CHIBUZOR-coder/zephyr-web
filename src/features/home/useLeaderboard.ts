import { useState, useEffect, useCallback } from "react";
import { authFetch } from "../../core/query/authClient";
import type { Trader, Risk } from "./traders.types";

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

export function useLeaderboard() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRisk = (drawdown: number): Risk => {
    if (drawdown < 15) return "LOW";
    if (drawdown < 25) return "MODERATE";
    return "HIGH";
  };

  const formatAUM = (aum: number): string => {
    if (aum >= 1_000_000) return `$${(aum / 1_000_000).toFixed(1)}M`;
    if (aum >= 1_000) return `$${(aum / 1_000).toFixed(1)}K`;
    return `$${aum.toFixed(0)}`;
  };

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      const response = await authFetch<LeaderboardResponse>(
        "/api/leaderboard?period=30d&sort=pnl&limit=10",
      );

      if (response.success) {
        const MAX_DISPLAY = 99999;
        const mappedTraders: Trader[] = response.data.traders.map((entry) => ({
          id: entry.rank,
          name: entry.user.displayName || `Trader ${entry.masterWallet.slice(0, 4)}`,
          memberSince: 2024, // Backend doesn't provide this yet, using 2024 as default
          roi7d: Math.abs(entry.metrics.roiPct) > MAX_DISPLAY ? Math.sign(entry.metrics.roiPct) * MAX_DISPLAY : entry.metrics.roiPct,
          winRate: parseFloat(entry.metrics.winRatePct.toFixed(1)),
          risk: mapRisk(entry.metrics.maxDrawdownPct),
          aum: formatAUM(entry.metrics.aumUsd),
          walletAddress: entry.masterWallet,
          vaultPda: entry.vaultPda,
        }));

        setTraders(mappedTraders);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch leaderboard:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { traders, loading, error, refetch: fetchLeaderboard };
}
