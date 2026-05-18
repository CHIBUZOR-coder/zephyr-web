import { useEffect, useRef } from "react";
import { useAuthStore } from "./auth.store";
import { authFetch } from "../../core/query/authClient";

export function useAuthRefresh() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // 🛑 Prevents duplicate refresh attempts
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Wait for hydration
    if (!hydrated || attemptedRef.current) return;

    const performRefresh = async () => {
      attemptedRef.current = true;

      // If we have a user but no token, we need to try refreshing
      if (user && !accessToken) {
        console.log("🔄 useAuthRefresh: Attempting silent session restoration...");
        try {
          // This will trigger the refreshAccessToken logic in authFetch
          await authFetch("/api/auth/me");
          console.log("✅ useAuthRefresh: Session restored successfully");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          console.log("ℹ️ useAuthRefresh: No valid session cookie found");
          // authFetch already handles logout() on failure
        }
      }

      // Mark auth as resolved regardless of success/failure
      useAuthStore.setState({ authResolved: true });
    };

    performRefresh();
  }, [hydrated, user, accessToken]);
}
