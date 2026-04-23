import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RiskStoreState {
  markedAsRead: boolean;
  setMarkedAsRead: (value: boolean) => void;
}

const useRiskStore = create<RiskStoreState>()(
  persist(
    (set) => ({
      markedAsRead: false,
      setMarkedAsRead: (value) => set({ markedAsRead: value }),
    }),
    {
      name: "risk-store",
    },
  ),
);

export default useRiskStore;
