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

  // ── Ethereum: silently checks for already-connected accounts ─────────
  useEffect(() => {
    const detect = async () => {
      if (!window.ethereum) return;

      try {
        // eth_accounts = silent check, no popup
        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });
        accounts.forEach((address) => addWallet({ address, type: "ETHEREUM" }));
      } catch (err) {
        console.error("Ethereum detection failed:", err);
      }
    };

    detect();

    // Also react to user switching accounts in MetaMask
    window.ethereum?.on("accountsChanged", (accounts: string[]) => {
      accounts.forEach((address) => addWallet({ address, type: "ETHEREUM" }));
    });

    return () => {
      window.ethereum?.removeAllListeners("accountsChanged");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
