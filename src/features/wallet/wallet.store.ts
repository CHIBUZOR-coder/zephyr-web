import { create } from "zustand";
import { persist } from "zustand/middleware";

type WalletState = {
  publicKey: string | null;
  connected: boolean;
  setWallet: (publicKey: string | null, connected: boolean) => void;
  resetWallet: () => void;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      publicKey: null,
      connected: false,

      setWallet: (publicKey, connected) => set({ publicKey, connected }),

      resetWallet: () => set({ publicKey: null, connected: false }),
    }),
    {
      name: "wallet-storage",
    },
  ),
);
