import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./auth.store";
import type { AuthUser } from "./auth.types";
import { authFetch } from "../../core/query/authClient";

export function useAuthLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthUser,
    Error,
    {
      publicKey: string;
      signMessage: (msg: Uint8Array) => Promise<Uint8Array>;
    }
  >({
    mutationFn: async ({ publicKey, signMessage }) => {
      // ⚠️ New safety check: ensure wallet is connected
      if (!publicKey || !signMessage) {
        throw new Error("Wallet not connected or signMessage function missing");
      }

      // 1️⃣ Ask user to sign FIRST (consent)
      // const consentMessage = "Sign in to Zephyr"; // renamed from `message` to avoid conflict
      // const encodedMessage = new TextEncoder().encode(consentMessage);

      // ⚡ Log before signing
      // console.log("About to sign consent message:", consentMessage);

      // const signatureBytes = await signMessage(encodedMessage);

      // ⚡ Log after signing
      // console.log("Signature bytes returned from wallet:", signatureBytes);

      // 🔐 user approved here — safe to talk to backend now
      // const signature = Array.from(signatureBytes);
      // console.log("signature (array):", signature);

      // 2️⃣ Request nonce
      const { message: nonceMessage, nonce } = await authFetch<{
        message: string;
        nonce: string;
      }>("/api/auth/nonce", {
        method: "POST",
        body: JSON.stringify({ walletAddress: publicKey }),
      });

      const encodedMessage = new TextEncoder().encode(nonceMessage);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = Array.from(signatureBytes);
      console.log("Nonce message returned from backend:", nonceMessage);
      console.log("Nonce value returned from backend:", nonce);

      // 3️⃣ Verify
      const { user, accessToken } = await authFetch<{
        success: boolean;
        accessToken: string;
        user: AuthUser;
      }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          walletAddress: publicKey,
          signature,
          message: nonceMessage,
        }),
      });

      // Optional: log the JWT token
      // console.log("JWT token returned from /verify:", token);

      setAuth(user, accessToken);
      return user;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
}
