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
  address?: string;
  vaultAddress?: string;
  createdAt?: string;
  updatedAt?: string;
};
