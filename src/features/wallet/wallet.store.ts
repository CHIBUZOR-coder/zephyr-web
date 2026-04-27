// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// type WalletState = {
//   publicKey: string | null;
//   connected: boolean;
//   setWallet: (publicKey: string | null, connected: boolean) => void;
//   resetWallet: () => void;
// };

// export const useWalletStore = create<WalletState>()(
//   persist(
//     (set) => ({
//       publicKey: null,
//       connected: false,

//       setWallet: (publicKey, connected) => set({ publicKey, connected }),

//       resetWallet: () => set({ publicKey: null, connected: false }),
//     }),
//     {
//       name: "wallet-storage",
//     },
//   ),
// );
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── your original type, untouched ──────────────────────────────────────
type WalletState = {
  publicKey: string | null;
  connected: boolean;
  setWallet: (publicKey: string | null, connected: boolean) => void;
  resetWallet: () => void;

  // ── new additions only ────────────────────────────────────────────────
  wallets: DetectedWallet[];
  primaryAddress: string | null;
  addWallet: (wallet: DetectedWallet) => void;
  removeWallet: (address: string) => void;
  setPrimary: (address: string) => void;
};

export type WalletType = "SOLANA" | "ETHEREUM";

export interface DetectedWallet {
  address: string;
  type: WalletType;
  name?: string;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      // ── your original defaults, untouched ──────────────────────────
      publicKey: null,
      connected: false,

      // ── your original actions, untouched ───────────────────────────
      setWallet: (publicKey, connected) => set({ publicKey, connected }),
      resetWallet: () => set({ publicKey: null, connected: false }),

      // ── new defaults ───────────────────────────────────────────────
      wallets: [],
      primaryAddress: null,

      // ── new actions (touch ONLY new fields) ────────────────────────
      addWallet: (wallet) =>
        set((state) => {
          const exists = state.wallets.some(
            (w) => w.address === wallet.address,
          );
          if (exists) return state;

          return {
            wallets: [...state.wallets, wallet],
            primaryAddress: state.primaryAddress ?? wallet.address,
            // ✅ publicKey and connected are NOT touched here
          };
        }),

      removeWallet: (address) =>
        set((state) => {
          const remaining = state.wallets.filter((w) => w.address !== address);
          return {
            wallets: remaining,
            primaryAddress:
              state.primaryAddress === address
                ? (remaining[0]?.address ?? null)
                : state.primaryAddress,
            // ✅ publicKey and connected are NOT touched here
          };
        }),

      setPrimary: (address) => set({ primaryAddress: address }),
      // ✅ only updates primaryAddress, nothing else
    }),
    {
      name: "wallet-storage",
    },
  ),
);