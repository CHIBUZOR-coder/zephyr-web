import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "../../core/query/authClient";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useCallback, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { endpoint } from "../../core/config/solanaWallet";
import { useGeneralContext } from "../../Context/GeneralContext";

export const PositionState = {
  Open: "Open",
  Closed: "Closed",
  PartialClosed: "PartialClosed",
} as const;

export interface PositionData {
  id: number;
  assetMint: string;
  state: typeof PositionState;
  entryPrice: number;
  size: number;
  realizedProfit: number;
  lastUpdated: number;
}

export interface MasterVault {
  id: string;
  vaultPda: string;
  masterWallet: string;
  successFeeBps: number;
  volumeFeeBps: number;
  totalVolume: string; // BigInt from backend
  totalFeesEarned: string; // BigInt from backend
  totalTrades: number;
  isPaused: boolean;
  currentTier: number;
  balance?: number; // In SOL
  positionCounter?: number;
  currentPosition?: PositionData;
  totalRealizedProfit?: string; // <-- Added missing property
  createdAt: string;
  updatedAt: string;
  _count?: {
    copierVaults: number;
  };
}

export interface CopierVault {
  id: string;
  vaultPda: string;
  copierWallet: string;
  masterExecutionVaultPda: string;
  balance: string; // BigInt from backend
  totalDeposited: string; // BigInt from backend
  totalRealizedProfit?: string;
  isPaused: boolean;
  actualBalance?: number; // In SOL (on-chain)
  updatedAt: string;
}

export function useUserVaults() {
  const { publicKey } = useWallet();
  const { setHasMatervalt } = useGeneralContext();
  const queryClient = useQueryClient();
  const [connection] = useState(() => new Connection(endpoint, "confirmed"));

  const { data: masterVault, isLoading: loadingMaster } = useQuery({
    queryKey: ["master-vault", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return null;
      try {
        const res = await authFetch<{ success: boolean; data: MasterVault }>(
          `/api/vaults/master/${publicKey.toBase58()}`,
        );
        if (res.success && res.data) {
          // Fetch on-chain balance
          const balance = await connection.getBalance(
            new PublicKey(res.data.vaultPda),
          );
          // const result = { ...res.data, balance: balance / 1e9 };
          // console.log("vaults:", result);
          return { ...res.data, balance: balance / 1e9 };
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!publicKey,
    refetchInterval: 10000,
  });

  // Sync hasMaterVault state with context
  useEffect(() => {
    if (masterVault) {
      setHasMatervalt(true);
    } else if (!loadingMaster && publicKey) {
      setHasMatervalt(false);
    }
  }, [masterVault, loadingMaster, publicKey, setHasMatervalt]);

  const { data: copierVaults, isLoading: loadingCopiers } = useQuery({
    queryKey: ["copier-vaults", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return [];
      try {
        const res = await authFetch<{ success: boolean; data: CopierVault[] }>(
          `/api/vaults/copier/${publicKey.toBase58()}`,
        );
        if (res.success && res.data) {
          // Fetch balances for all copier vaults
          const enrichedVaults = await Promise.all(
            res.data.map(async (v) => {
              const balance = await connection.getBalance(
                new PublicKey(v.vaultPda),
              );
              return { ...v, actualBalance: balance / 1e9 };
            }),
          );
          return enrichedVaults;
        }
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!publicKey,
    refetchInterval: 10000,
  });

  const { data: managedCopierVaults, isLoading: loadingManaged } = useQuery({
    queryKey: ["managed-copier-vaults", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return [];
      try {
        const res = await authFetch<{ success: boolean; data: CopierVault[] }>(
          `/api/vaults/master/${publicKey.toBase58()}/copiers`,
        );
        if (res.success && res.data) {
          const enrichedVaults = await Promise.all(
            res.data.map(async (v) => {
              const balance = await connection.getBalance(
                new PublicKey(v.vaultPda),
              );
              return { ...v, actualBalance: balance / 1e9 };
            }),
          );
          return enrichedVaults;
        }
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!publicKey,
    refetchInterval: 10000,
  });

  const refetchAll = useCallback(async () => {
    if (!publicKey) return;
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["master-vault", publicKey.toBase58()],
      }),
      queryClient.invalidateQueries({
        queryKey: ["copier-vaults", publicKey.toBase58()],
      }),
      queryClient.invalidateQueries({
        queryKey: ["managed-copier-vaults", publicKey.toBase58()],
      }),
    ]);
  }, [queryClient, publicKey]);

  return {
    masterVault,
    copierVaults,
    managedCopierVaults,
    isLoading: loadingMaster || loadingCopiers || loadingManaged,
    refetchAll,
  };
}
