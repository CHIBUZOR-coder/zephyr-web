import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../../../../../core/query/authClient";

export type VaultActivityType =
  | "VAULT_CREATED"
  | "DEPOSIT"
  | "DEPOSIT_MASTER"
  | "WITHDRAWAL"
  | "TRADE_EXECUTED"
  | "TRADE_MIRRORED"
  | "FEE_COLLECTED"
  | "FEE_CLAIMED"
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
    staleTime: 5000,
    refetchInterval: 10000,
  });

  return {
    activities: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useAllVaultActivities(
  vaultAddresses: string[],
  limit = 15
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["all-vault-activities", vaultAddresses, limit],
    queryFn: async () => {
      if (vaultAddresses.length === 0) return [];
      
      try {
        const allActivities: VaultActivity[] = [];
        
        await Promise.all(
          vaultAddresses.map(async (address) => {
            const res = await authFetch<VaultActivityResponse>(
              `/api/vaults/${address}/activities?limit=${limit}`
            );
            if (res.success && res.data) {
              allActivities.push(...res.data);
            }
          })
        );
        
        // Sort by timestamp descending
        allActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        return allActivities.slice(0, limit);
      } catch {
        return [];
      }
    },
    enabled: vaultAddresses.length > 0,
    staleTime: 5000,
    refetchInterval: 10000,
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
  
  const sig = item.signature;
  const hasSignature = sig && typeof sig === 'string' && sig.length > 0;
  
  return {
    id: item.id,
    type: typeLabel,
    time: relativeTime,
    token,
    amount,
    status: "success" as const,
    tx: hasSignature ? formatAddress(sig) : "N/A",
    signature: hasSignature ? sig : "N/A",
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
    TRADE_MIRRORED: "MIRRORED TRADE",
    FEE_COLLECTED: "FEE COLLECTED",
    FEE_CLAIMED: "FEE CLAIMED",
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
      const amountOut = (data?.minAmountOut as string) ?? (data?.amountOut as string) ?? "0";
      const formattedAmount = formatAmount(amountOut, tokenOut);
      return { token: formatTokenSymbol(tokenOut), amount: `+${formattedAmount}` };
    }
    case "TRADE_MIRRORED": {
      const assetMint = (data?.assetMint as string) ?? (data?.tokenIn as string) ?? "TOKEN";
      const copierAmount = (data?.copierAmount as string) ?? (data?.amountIn as string) ?? (data?.filledAmount as string) ?? "0";
      const formattedAmount = formatAmount(copierAmount, assetMint);
      return { token: formatTokenSymbol(assetMint), amount: `+${formattedAmount}` };
    }
    case "FEE_COLLECTED":
    case "FEE_CLAIMED": {
      const totalFee = (data?.totalFee as string) ?? (data?.traderFee as string) ?? (data?.amount as string) ?? "0";
      const formattedAmount = formatAmount(totalFee);
      const prefix = type === "FEE_CLAIMED" ? "-" : "+";
      return { token: "SOL", amount: `${prefix}${formattedAmount}` };
    }
    case "VAULT_CREATED":
      return { token: "N/A", amount: "N/A" };
    case "STATUS_CHANGED":
      return { token: "N/A", amount: "N/A" };
    default:
      return { token: "N/A", amount: "N/A" };
  }
}

function formatAmount(raw: string, mint?: string): string {
  try {
    const num = /^[0-9a-fA-F]+$/.test(raw) && /[a-fA-F]/.test(raw)
      ? BigInt(`0x${raw}`)
      : BigInt(raw);
    if (num === 0n) return "0.00";
    
    // Simple decimal handling: SOL = 9, USDC = 6, others default to 9
    const isUSDC = mint === "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr" || mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const decimals = isUSDC ? 6 : 9;
    
    const divisor = BigInt(10 ** decimals);
    const wholePart = num / divisor;
    const fractionalPart = num % divisor;
    const fractionalStr = fractionalPart.toString().padStart(decimals, "0").slice(0, 4);
    
    // Trim trailing zeros for cleaner display
    let trimmedFractional = fractionalStr.replace(/0+$/, "");
    if (trimmedFractional.length < 2) trimmedFractional = fractionalStr.slice(0, 2);
    
    return `${wholePart}.${trimmedFractional}`;
  } catch {
    return raw;
  }
}

function formatTokenSymbol(mint: string): string {
  if (!mint) return "TOKEN";
  if (mint === "11111111111111111111111111111111" || mint === "So11111111111111111111111111111111111111112") return "SOL";
  if (mint === "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr" || mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") return "USDC";
  
  if (mint.length < 8) return mint;
  return mint.slice(0, 4).toUpperCase();
}

function formatAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
