// Matches the metrics object inside each trader
export type TraderMetrics = {
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
};

// Matches the user object inside each trader
export type TraderUser = {
  walletAddress: string;
  displayName: string;
  avatar: string | null;
  isVerified: boolean;
};

// Matches a single trader object in data.traders[]
export type Trader = {
  rank: number;
  masterWallet: string;
  vaultPda: string;
  user: TraderUser;
  currentTier: number;
  tierLabel: string;
  tierShortLabel: string;
  metrics: TraderMetrics;
  compositeScore: number;
};

// Matches the full API response shape
export type TradersApiResponse = {
  success: boolean;
  data: {
    traders: Trader[];
    total: number;
    page: number;
    limit: number;
  };
};
