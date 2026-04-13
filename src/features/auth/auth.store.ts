import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "./auth.types";
import { API_BASE } from "../../core/query/authClient";

type AuthState = {
  authenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;

  hydrated: boolean;
  authResolved: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authenticated: false,
      user: null,
      accessToken: null,

      hydrated: false,
      authResolved: false,

      setAuth: (user, token) =>
        set({
          authenticated: true,
          user,
          accessToken: token,
          authResolved: true,
        }),

      logout: async () => {
        set({
          authenticated: false,
          user: null,
          accessToken: null,
          authResolved: true,
        });

        try {
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            credentials: "include",
          });
        } catch (err) {
          console.error("Logout API call failed:", err);
        }
      },
    }),
    {
      name: "auth-storage",
      // Persist user and token to maintain session across refreshes
      partialize: (state) => ({
        user: state.user,
        authenticated: state.authenticated,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    },
  ),
);
