import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletStore } from "../../../../../wallet/wallet.store";


export const useWalletDetector = () => {
  const { publicKey, wallet: solanaWallet } = useWallet();
  const addWallet = useWalletStore((s) => s.addWallet);

  // ── Solana: runs whenever user connects/disconnects ──────────────────
  useEffect(() => {
    if (!publicKey) return;

    addWallet({
      address: publicKey.toBase58(),
      type: "SOLANA",
      name: solanaWallet?.adapter.name, // e.g. "Phantom", "Backpack"
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);


};
