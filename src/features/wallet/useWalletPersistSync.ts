// useWalletPersistSync.ts
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletStore } from "./wallet.store";

export function useWalletPersistSync() {
  const { publicKey, connected } = useWallet();
  const setWallet = useWalletStore((s) => s.setWallet);
  const resetWallet = useWalletStore((s) => s.resetWallet);

  useEffect(() => {
    if (connected && publicKey) {
      setWallet(publicKey.toBase58(), true);
    } else {
      resetWallet();
    }
  }, [connected, publicKey, setWallet, resetWallet]);
}
