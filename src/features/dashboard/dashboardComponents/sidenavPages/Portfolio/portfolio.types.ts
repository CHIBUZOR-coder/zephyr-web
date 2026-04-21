import type { PositionData } from '../../../../master/useUserVaults'

export interface PinnedVault {
  currentPosition: PositionData | undefined;
  id: string;
  name: string;
  walletSnippet: string;
  fullAddress: string;
  connectedCopiers: number;
  lastExecution: string;
  totalBalanceSol: number;
  totalBalanceUsd: number;
  activePositions: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  availableFeesSol: number;
  historicalClaimedSol: number;
  tier: string;
}


interface RiskRules {
  tp: number;
  sl: number;
}

export interface Strategy {
  id: string;
  name: string; // use "\n" to split into two lines e.g. "ALPHASEEKER\nCOPY VAULT"
  walletSnippet: string;
  fullAddress: string;
  masterVaultAddress?: string;
  masterWalletAddress?: string;
  masterVaultDisplayName?: string;
  masterVaultAvatar?: string;
  balanceSol: number;
  balanceUsd: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPct: number;
  riskRules: RiskRules;
  lastActivityLabel: string; // e.g. "14M AGO"
}
