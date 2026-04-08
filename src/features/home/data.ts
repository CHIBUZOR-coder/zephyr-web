// data.ts
import type { Trader } from "./traders.types";

export const traders: Trader[] = [
  {
    id: 1,
    name: "SolanaWhale_x",
    memberSince: 2023,
    roi7d: 142.8,
    winRate: 78.5,
    risk: "MODERATE",
    aum: "$4.2M",
  },
  {
    id: 2,
    name: "QuantLogic",
    memberSince: 2024,
    roi7d: 85.2,
    winRate: 92.1,
    risk: "LOW",
    aum: "$1.8M",
  },
  {
    id: 3,
    name: "AlphaSeeker",
    memberSince: 2023,
    roi7d: 210.4,
    winRate: 64.0,
    risk: "HIGH",
    aum: "$850K",
  },
];
