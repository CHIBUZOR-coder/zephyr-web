import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../../../../../core/query/authClient";

export type VaultActivityType =
  | "VAULT_CREATED"
  | "DEPOSIT"
  | "DEPOSIT_MASTER"
  | "WITHDRAWAL"
  | "TRADE_EXECUTED"
  | "STATUS_CHANGED";

export interface VaultActivity {
  id: string;
  type: VaultActivityType;
  vaultAddress: string;
  signature: string | null;
  timestamp: string;
  data: Record<string, unknown> | null;
  processed: boolean;
}

interface VaultActivityResponse {
  success: boolean;
  data: VaultActivity[];
}

export function useVaultActivities(vaultAddress: string | null, limit = 15) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vault-activities", vaultAddress, limit],
    queryFn: async () => {
      if (!vaultAddress) return [];
      try {
        const res = await authFetch<VaultActivityResponse>(
          `/api/vaults/${vaultAddress}/activities?limit=${limit}`,
        );
        return res.success ? res.data : [];
      } catch {
        return [];
      }
    },
    enabled: !!vaultAddress,
    staleTime: 30000,
  });

  return {
    activities: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function formatVaultActivity(item: VaultActivity): {
  id: string;
  type: string;
  time: string;
  token: string;
  amount: string;
  status: "success";
  tx: string;
  signature: string;
} {
  const data = item.data as Record<string, unknown> | null;
  const relativeTime = formatRelativeDate(item.timestamp);
  const typeLabel = formatEventType(item.type);
  const { token, amount } = extractTokenAndAmount(item.type, data);
  return {
    id: item.id,
    type: typeLabel,
    time: relativeTime,
    token,
    amount,
    status: "success" as const,
    tx: item.signature ? formatAddress(item.signature) : "N/A",
    signature: item.signature || "N/A",
  };
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "JUST NOW";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}D AGO`;
  return `${Math.floor(diffInSeconds / 604800)}W AGO`;
}

function formatEventType(type: VaultActivityType): string {
  const typeMap: Record<VaultActivityType, string> = {
    VAULT_CREATED: "VAULT CREATED",
    DEPOSIT: "DEPOSIT",
    DEPOSIT_MASTER: "DEPOSIT",
    WITHDRAWAL: "WITHDRAWAL",
    TRADE_EXECUTED: "TRADE",
    STATUS_CHANGED: "STATUS CHANGE",
  };
  return typeMap[type] ?? type;
}

function extractTokenAndAmount(
  type: VaultActivityType,
  data: Record<string, unknown> | null,
): { token: string; amount: string } {
  switch (type) {
    case "DEPOSIT":
    case "DEPOSIT_MASTER":
    case "WITHDRAWAL": {
      const amount = data?.amount as string | undefined;
      const formattedAmount = amount ? formatAmount(amount) : "0";
      const prefix = type === "WITHDRAWAL" ? "-" : "+";
      return { token: "SOL", amount: `${prefix}${formattedAmount}` };
    }
    case "TRADE_EXECUTED": {
      const tokenOut = (data?.tokenOut as string) ?? "TOKEN";
      const amountOut = data?.amountOut as string | undefined;
      const formattedAmount = amountOut ? formatAmount(amountOut) : "0";
      return { token: formatTokenSymbol(tokenOut), amount: `+${formattedAmount}` };
    }
    case "VAULT_CREATED":
      return { token: "N/A", amount: "N/A" };
    case "STATUS_CHANGED":
      return { token: "N/A", amount: "N/A" };
    default:
      return { token: "N/A", amount: "N/A" };
  }
}

function formatAmount(raw: string): string {
  try {
    const num = BigInt(raw);
    const decimals = 9;
    const divisor = BigInt(10 ** decimals);
    const wholePart = num / divisor;
    const fractionalPart = num % divisor;
    const fractionalStr = fractionalPart.toString().padStart(decimals, "0").slice(0, 2);
    return `${wholePart}.${fractionalStr}`;
  } catch {
    return raw;
  }
}

function formatTokenSymbol(mint: string): string {
  if (!mint || mint.length < 8) return mint;
  return mint.slice(0, 4).toUpperCase();
}

function formatAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
