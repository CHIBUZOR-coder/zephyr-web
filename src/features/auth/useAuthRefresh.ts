import { useEffect, useRef } from "react";
import { useAuthStore } from "./auth.store";

export function useAuthRefresh() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  // 🛑 Prevents duplicate refresh attempts - delegate to authFetch's refreshPromise
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Only attempt refresh if:
    // 1. Store has rehydrated
    // 2. We have user data (means they logged in before)
    // 3. But NO token in memory (page was refreshed)
    // 4. Haven't already attempted in this component
    if (!hydrated || !user || accessToken || attemptedRef.current) return;

    attemptedRef.current = true;
    console.log("🔄 useAuthRefresh: Delegating to authFetch for token refresh...");

    // Don't refresh here - let authFetch handle it when it gets a 401
    // This prevents double refresh race conditions
    useAuthStore.setState({ authResolved: true });
  }, [hydrated, user, accessToken, setAuth]);
}
