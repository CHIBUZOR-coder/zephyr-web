import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuthStore } from "./auth.store";
import { useAuthLogin } from "./useAuthLogin";

export function useAutoSignIn() {
  const { publicKey, connected, signMessage } = useWallet();
  const { authenticated, hydrated } = useAuthStore();
  const loginMutation = useAuthLogin();

  // 🛑 prevents duplicate prompts
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!connected || !publicKey || !signMessage) return;
    if (authenticated) return;
    if (loginMutation.isPending) return;
    if (attemptedRef.current) return;

    attemptedRef.current = true;

    loginMutation.mutate({
      publicKey: publicKey.toBase58(),
      signMessage,
    });
  }, [
    hydrated,
    connected,
    authenticated,
    publicKey,
    signMessage,
    loginMutation,
  ]);
}
