import { useWallet } from "@solana/wallet-adapter-react";
import { useAuthStore } from "../../features/auth/auth.store";

export function useWalletMismatch() {
  const { publicKey, connected } = useWallet();
  const { authenticated, user } = useAuthStore();

  if (!authenticated || !connected || !publicKey || !user?.walletAddress) {
    return false;
  }

  return user.walletAddress !== publicKey.toBase58();
}
