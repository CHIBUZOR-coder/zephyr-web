import { create } from "zustand";
import { persist } from "zustand/middleware";

type TradingModeState = {
  callTrade: boolean;
  masterMode: boolean;

  hydrated: boolean;

  toggleCallTrade: () => void;
  toggleMasterMode: () => void;

  setCallTrade: (value: boolean) => void;
  setMasterMode: (value: boolean) => void;
};

export const useTradingModeStore = create<TradingModeState>()(
  persist(
    (set) => ({
      callTrade: false,
      masterMode: false,
      // TODO: Return this to false after testing

      hydrated: false,

      toggleCallTrade: () =>
        set((state) => ({
          callTrade: !state.callTrade,
        })),

      toggleMasterMode: () =>
        set((state) => ({
          masterMode: !state.masterMode,
        })),

      setCallTrade: (value) =>
        set({
          callTrade: value,
        }),

      setMasterMode: (value) =>
        set({
          masterMode: value,
        }),
    }),
    {
      name: "trading-mode-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    },
  ),
);
