import { useWallet } from "@solana/wallet-adapter-react";
import { useAuthStore } from "../../features/auth/auth.store";
import { useEffect } from "react";

export function useWalletAuthSync() {
  const { connected, publicKey } = useWallet();
  const { authenticated, user, logout, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!connected || !publicKey) return;
    if (!authenticated || !user?.walletAddress) return;

    const currentWallet = publicKey.toBase58();

    // 🔴 ONLY invalidate if wallet truly changed
    if (user.walletAddress !== currentWallet) {
      logout();
    }
  }, [hydrated, connected, publicKey, authenticated, user, logout]);
}
