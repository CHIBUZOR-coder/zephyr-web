import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DefaultRiskState {
  maxDrawdownSol: string;
  maxTradeSizeSol: string;
  maxLossSol: string;
  takeProfitPct: string;
  slippagePct: string;
  setFromSettings: (params: {
    maxTradeSizeSol: string;
    maxLossSol: string;
    maxDrawdownSol: string;
    takeProfitPct: string;
    slippagePct: string;
  }) => void;
}

export const useDefaultRiskStore = create<DefaultRiskState>()(
  persist(
    (set) => ({
      maxDrawdownSol: "5",
      maxTradeSizeSol: "2",
      maxLossSol: "3",
      takeProfitPct: "20",
      slippagePct: "0.5%",
      setFromSettings: (params) => set(params),
    }),
    {
      name: "zephyr-default-risk",
    }
  )
);
