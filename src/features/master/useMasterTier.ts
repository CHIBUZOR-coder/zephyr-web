import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../../core/query/authClient";

export interface TierState {
  vaultPda: string;
  masterWallet: string;
  currentTier: number;
  currentTierLabel: string;
  pendingDowngradeTier: number;
  pendingDowngradeTierLabel: string | null;
  hasPendingDowngrade: boolean;
  tierConfirmedSlot: string;
  verifiedFlags: number;
  verifiedFlagsDecoded: {
    identityVerified: boolean;
    riskAdjReturnPositive: boolean;
    copierPnlNetPositive: boolean;
    governanceApproved: boolean;
  };
  metrics: {
    daysActive: number;
    winRateBps: number;
    winRatePct: string;
    rollingVolumeUsd: string;
    rollingAumUsd: string;
    maxDrawdownBps: number;
    maxDrawdownPct: string;
    copierRetentionBps: number;
    copierRetentionPct: string;
    activeCopiers: number;
  };
  isPaused: boolean;
  totalTrades: number;
  createdAt: string;
}

export interface PerformanceSnapshot {
  id: string;
  snapshotDate: string;
  dailyVolumeUsd: string;
  dailyTrades: number;
  dailyWinningTrades: number;
  dailyFeesEarnedRaw: string;
  rolling30dVolumeUsd: string;
  rolling30dAumUsd: string;
  winRateBps: number;
  maxDrawdownBps: number;
  copierCount: number;
  copierRetentionBps: number;
  tierAtSnapshot: number;
  createdAt: string;
}

export type RoiInterval = {
  day: number;
  roiPct: number;
  volumeUsd: number;
  winRatePct: number;
  aumUsd: number;
  cumulativeVolumeUsd: number;
}

export function useMasterTierState(masterWallet?: string) {
  return useQuery<TierState | null>({
    queryKey: ["master-tier-state", masterWallet],
    queryFn: async () => {
      if (!masterWallet) return null;
      const res = await authFetch<{ success: boolean; data: TierState }>(
        `/api/tier/masters/${masterWallet}/tier`
      );
      return res.success ? res.data : null;
    },
    enabled: !!masterWallet,
    staleTime: 60 * 1000, // 1 minute
    refetchOnMount: true,
    initialDataUpdatedAt: 0,
  });
}

export function useMasterPerformanceSnapshots(masterWallet?: string, days: number = 30) {
  return useQuery<PerformanceSnapshot[]>({
    queryKey: ["master-performance-snapshots", masterWallet, days],
    queryFn: async () => {
      if (!masterWallet) return [];
      const res = await authFetch<{ success: boolean; data: PerformanceSnapshot[] }>(
        `/api/tier/masters/${masterWallet}/performance?days=${days}`
      );
      return res.success ? res.data : [];
    },
    enabled: !!masterWallet,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMasterRoiChart(masterWallet?: string) {
  return useQuery<RoiInterval[]>({
    queryKey: ["master-roi-chart", masterWallet],
    queryFn: async () => {
      if (!masterWallet) return [];
      const res = await authFetch<{ success: boolean; data: { intervals: RoiInterval[] } }>(
        `/api/leaderboard/traders/${masterWallet}/roi`
      );
      return res.success ? res.data.intervals : [];
    },
    enabled: !!masterWallet,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export interface TierConfig {
  authority: string;
  admin: string;
  tierConfigPda: string;
  tiers: Array<{
    tierIndex: number;
    label: string;
    minVolumeUsd: string;
    minAumUsd: string;
    maxDrawdownBps: number;
    maxDrawdownPct: string;
    minTrackRecordDays: number;
    minCopiers: number;
    requiredFlags: number;
    traderFeeBps: number;
    platformFeeBps: number;
    traderFeePct: string;
  }>;
}

export function useProtocolTierConfig() {
  return useQuery<TierConfig | null>({
    queryKey: ["protocol-tier-config"],
    queryFn: async () => {
      const res = await authFetch<{ success: boolean; data: TierConfig }>(
        `/api/tier/config`
      );
      return res.success ? res.data : null;
    },
    staleTime: Infinity, // Protocol config changes very rarely
  });
}
