

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authFetch } from "../../core/query/authClient";
import type { AuthUser } from "./auth.types";
import { useAuthStore } from "./auth.store";

type AuthMeResponse = {
  authenticated: boolean;
  user: AuthUser | null;
};

export function useAuthSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);

  const query = useQuery<AuthMeResponse>({
    queryKey: ["auth-me"],
    queryFn: () => authFetch<AuthMeResponse>("/api/auth/me"),
    enabled: hydrated && !!token,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.authenticated && query.data.user && token) {
      setAuth(query.data.user, token);
    } else {
      logout();
    }
  }, [query.data, token, setAuth, logout]);

  useEffect(() => {
    if (!query.error) return;

    if ((query.error as Error).message.includes("401")) {
      logout();
    }
  }, [query.error, logout]);

  return query;
}
