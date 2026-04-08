import { create } from "zustand";
import { persist } from "zustand/middleware";

type LiveTradeTab = "allTrades" | "positions";

type LiveTradeState = {
  activeTab: LiveTradeTab;
  setActiveTab: (tab: LiveTradeTab) => void;
};

export const useLiveTradeStore = create<LiveTradeState>()(
  persist(
    (set) => ({
      activeTab: "allTrades",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "live-trade-tab", // localStorage key
    },
  ),
);
