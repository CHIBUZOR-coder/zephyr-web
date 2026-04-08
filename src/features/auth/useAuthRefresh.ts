import { useEffect, useRef } from "react";
import { useAuthStore } from "./auth.store";
import { API_BASE } from "../../core/query/authClient";

export function useAuthRefresh() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  // 🛑 Prevents duplicate refresh attempts
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Only attempt refresh if:
    // 1. Store has rehydrated
    // 2. We have user data (means they logged in before)
    // 3. But NO token in memory (page was refreshed)
    // 4. Haven't already attempted
    if (!hydrated || !user || accessToken || attemptedRef.current) return;

    attemptedRef.current = true;
    console.log("🔄 Attempting token refresh...");

    fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include", // ← sends httpOnly cookie
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Refresh failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Token refreshed:", data);

        // TODO: Adjust based on actual backend response
        // If backend returns { accessToken, user }:
        if (data.accessToken && data.user) {
          setAuth(data.user, data.accessToken);
        }
        // If backend only returns { user } (token in cookie):
        else if (data.user) {
          console.warn("Backend returned user but no accessToken");
          useAuthStore.setState({
            authenticated: true,
            user: data.user,
            authResolved: true,
          });
        }
      })
      .catch((err) => {
        console.error("❌ Token refresh failed:", err);
        // Clear stale session
        useAuthStore.setState({
          authenticated: false,
          user: null,
          accessToken: null,
          authResolved: true,
        });
      });
  }, [hydrated, user, accessToken, setAuth]);
}
