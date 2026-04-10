import { useState, useEffect } from "react";
import { authFetch } from "../../../../../core/query/authClient";
import type { Trader } from "./leaderboar.types";

const MAX_DISPLAY_PCT = 99999; // Cap display at 99,999%

function formatRoiPct(roiPct: number): string {
  // Cap extreme values for display
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

export function useDashboardLeaderboard() {
  const [leaders, setLeaders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await authFetch<LeaderboardResponse>(
        "/api/leaderboard?period=30d&sort=pnl&limit=10",
      );

      if (response.success) {
        const mappedLeaders: Trader[] = response.data.traders.map((entry) => ({
          id: entry.rank,
          rank: entry.rank,
          name:
            entry.user.displayName ||
            `Trader ${entry.masterWallet.slice(0, 4)}`,
          image:
            entry.user.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.masterWallet}`,
          tag: entry.tierShortLabel,
          tiers: entry.tierLabel,
          type: "PRO",
          pnl: formatRoiPct(entry.metrics.roiPct),
          aum: `$${formatCompactNumber(entry.metrics.aumUsd)}`,
          winRate: `${entry.metrics.winRatePct.toFixed(0)}%`,
          drawdown: `${entry.metrics.maxDrawdownPct.toFixed(1)}%`,
          trades: entry.metrics.totalTrades,
          copiers: entry.metrics.activeCopiers,
          rio: parseFloat(entry.metrics.roiPct.toFixed(1)),
          follows: entry.metrics.activeCopiers,
          followsDisplay: formatCompactNumber(entry.metrics.activeCopiers),
          sol: (entry.metrics.aumUsd / 150).toFixed(0),
          address: entry.masterWallet,
          vaultAddress: entry.vaultPda,
        }));
        setLeaders(mappedLeaders);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch dashboard leaderboard:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch dashboard leaderboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return { leaders, loading, error, refetch: fetchLeaderboard };
}
