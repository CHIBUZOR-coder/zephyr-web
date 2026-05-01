// zephyr-web/src/features/trades/useTrades.ts

import { useState, useEffect, useCallback } from 'react';
const API_BASE_URL =  "https://zephyr-np09.onrender.com";

export interface Trade {
  id: string;
  signature: string;
  vaultPda: string;
  vaultType: 'MASTER' | 'COPIER';
  tokenIn: string;
  tokenOut: string;
  amountInRaw: string;
  amountOutRaw: string;
  amountInDecimal: number;
  amountOutDecimal: number;
  slippage: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  executedAt: string;
  confirmedAt?: string;
  masterTradeId?: string;
  masterExecutionVaultId?: string;
  copierVaultId?: string;
  masterExecutionVault?: {
    id: string;
    masterWallet: string;
    vaultPda: string;
    currentTier?: number;
    user?: {
      displayName?: string;
      avatar?: string;
    };
  };
  copierVault?: {
    id: string;
    vaultPda: string;
    copier?: {
      displayName?: string;
      avatar?: string;
      walletAddress?: string;
    };
  };
  copiedTrades?: Trade[];
}

export const TIER_LABELS: Record<number, string> = {
  1: 'Community',
  2: 'Verified',
  3: 'Elite',
  4: 'Alpha',
  5: 'Institutional',
};

export const getTierLabel = (tier: number | undefined): string => {
  if (!tier || tier < 1 || tier > 5) return 'Community';
  return TIER_LABELS[tier] || 'Community';
};

export interface TradeStats {
  totalTrades: number;
  totalVolume: number;
  totalVolumeUsd: number;
  winningTrades: number;
  losingTrades: number;
  pendingTrades: number;
}

export const useRecentTrades = (limit = 20) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trades/recent?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setTrades(data.data ?? []);
      } else {
        setError(data.message || 'Failed to fetch trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
};

export const useVaultTrades = (vaultPda: string, limit = 50) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    if (!vaultPda) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trades/vault/${vaultPda}?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setTrades(data.data ?? []);
      } else {
        setError(data.message || 'Failed to fetch trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [vaultPda, limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
};

export const useMasterTrades = (masterWallet: string, limit = 50) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    if (!masterWallet) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trades/master/${masterWallet}?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setTrades(data.data ?? []);
      } else {
        setError(data.message || 'Failed to fetch trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [masterWallet, limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
};

export const useCopierTrades = (copierWallet: string, limit = 50) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    if (!copierWallet) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trades/copier/${copierWallet}?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setTrades(data.data ?? []);
      } else {
        setError(data.message || 'Failed to fetch trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [copierWallet, limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
};

export const useVaultStats = (vaultPda: string) => {
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!vaultPda) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trades/vault/${vaultPda}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [vaultPda]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useCopiedTrades = (masterSignature: string) => {
  const [copiedTrades, setCopiedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCopiedTrades = useCallback(async () => {
    if (!masterSignature) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trades/master/${masterSignature}/copiers`);
      const data = await response.json();
      if (data.success) {
        setCopiedTrades(data.data ?? []);
      } else {
        setError(data.message || 'Failed to fetch copied trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [masterSignature]);

  useEffect(() => {
    fetchCopiedTrades();
  }, [fetchCopiedTrades]);

  return { copiedTrades, loading, error, refetch: fetchCopiedTrades };
};
