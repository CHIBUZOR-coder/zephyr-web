import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuthStore } from "./auth.store";
import { useAuthLogin } from "./useAuthLogin";

export function useAutoSignIn() {
  const { publicKey, connected, signMessage } = useWallet();
  const { authenticated, hydrated, authResolved } = useAuthStore();
  const loginMutation = useAuthLogin();

  const attemptedRef = useRef(false);

  useEffect(() => {
    // 🛑 Critical: Wait for hydration AND session check to finish
    if (!hydrated || !authResolved) return;

    // Check if wallet is connected and ready
    if (!connected || !publicKey || !signMessage) return;

    // Already logged in? Nothing to do.
    if (authenticated) return;

    // Don't double-prompt
    if (loginMutation.isPending || attemptedRef.current) return;

    attemptedRef.current = true;
    console.log(
      "🗝️ useAutoSignIn: Automatic session restoration failed, requesting signature...",
    );

    loginMutation.mutate({
      publicKey: publicKey.toBase58(),
      signMessage,
    });
  }, [
    hydrated,
    authResolved,
    connected,
    authenticated,
    publicKey,
    signMessage,
    loginMutation,
  ]);
}
