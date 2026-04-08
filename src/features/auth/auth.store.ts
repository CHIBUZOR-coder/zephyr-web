import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "./auth.types";

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

      logout: () =>
        set({
          authenticated: false,
          user: null,
          accessToken: null,
          authResolved: true,
        }),
    }),
    {
      name: "auth-storage",
      // ✅ Only persist user, NOT the token
      partialize: (state) => ({
        user: state.user,
        authenticated: state.authenticated,
        // accessToken intentionally excluded
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    },
  ),
);
