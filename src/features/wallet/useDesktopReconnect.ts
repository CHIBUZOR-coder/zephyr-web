import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import type { WalletName } from "@solana/wallet-adapter-base";

// Restores auto-reconnect on desktop only.
// autoConnect={false} in WalletProviders stops Phantom's native popup on mobile,
// but breaks desktop reconnection on refresh — this hook fixes that.
export function useDesktopReconnect() {
  const { select, connect, connected, connecting, wallets } = useWallet();
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    if (isMobile || connected || connecting) return;

    // The wallet adapter stores the last used wallet name in localStorage
    const storedName = localStorage.getItem("walletName");
    if (!storedName) return;

    const parsed = storedName.replace(/"/g, ""); // adapter wraps it in quotes
    const found = wallets.find((w) => w.adapter.name === parsed);
    if (!found) return;

    if (
      found.readyState === WalletReadyState.Installed ||
      found.readyState === WalletReadyState.Loadable
    ) {
      select(parsed as WalletName);
      setTimeout(() => {
        connect().catch(() => {});
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets]);
}
