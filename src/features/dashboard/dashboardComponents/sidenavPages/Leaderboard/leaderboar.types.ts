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

export type Trader = {
  id: number;
  rank: number;
  name: string;
  image: string;
  tag: string;
  tiers: string;
  // type: "PRO" | "STANDARD" | "ELITE";
  type: string;
  pnl: string;
  aum: string;
  winRate: string;
  drawdown: string;
  trades: number;
  copiers: number;
  rio: number; // ← added
  follows: number; // ← added
  sol: string; // ← added
  address?: string; // ← added
  vaultAddress?: string; // ← added
};
