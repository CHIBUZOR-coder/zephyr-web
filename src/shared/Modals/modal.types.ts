export type Trader = {
  id: number;
  rank: number;
  name: string;
  tag: string;
  tiers: string;
  type: "PRO" | "STANDARD" | "ELITE"; // or just string if more types exist
  pnl: string;
  aum: string;
  winRate: string;
  drawdown: string;
  trades: number;
  copiers: number;
};
