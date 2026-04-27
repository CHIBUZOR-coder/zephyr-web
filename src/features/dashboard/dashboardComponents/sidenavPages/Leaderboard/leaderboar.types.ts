// export interface Trader {
//   id: number;
//   rank: number;
//   name: string;
//   tag: string;
//   tiers: string;
//   type: string;
//   pnl: string;
//   aum: string;
//   winRate: string;
//   drawdown: string;
//   trades: number;
//   copiers: number;
// }

export type LeaderboardPeriod = "7d" | "30d" | "90d" | "all";
export type LeaderboardSort = "pnl" | "roi" | "winRate" | "maxDrawdown" | "aum" | "copiers" | "volume";

export type Trader = {
  id: number;
  rank: number;
  name: string;
  image: string;
  tag: string;
  tiers: string;
  type: string;
  pnl: string;
  aum: string;
  winRate: string;
  drawdown: string;
  trades: number;
  copiers: number;
  rio: number;
  follows: number;
  followsDisplay: string;
  sol: string;
  volume: string;
  bio?: string | null;
  twitter?: string | null;
  discord?: string | null;
  telegram?: string | null;
  address?: string;
  vaultAddress?: string;
  createdAt?: string;
  updatedAt?: string;
};
