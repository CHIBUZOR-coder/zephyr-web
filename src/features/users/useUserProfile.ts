import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../../core/query/authClient";

export interface UserProfile {
  id: string;
  walletAddress: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  twitter?: string | null;
  discord?: string | null;
  telegram?: string | null;
  lastSocialsUpdate?: string | null;
  createdAt: string;
  isVerified: boolean;
  updatedAt: string;
}

export function useUserProfile(address?: string) {
  return useQuery({
    queryKey: ["user-profile", address],
    queryFn: async () => {
      if (!address || address.length < 32) return null;
      try {
        const res = await authFetch<{ success: boolean; user: UserProfile }>(
          `/api/users/${address}`
        );
        return res.success ? res.user : null;
      } catch (e) {
        console.error("Error fetching user profile:", e);
        return null;
      }
    },
    enabled: !!address && address.length >= 32,
    staleTime: 5 * 60 * 1000,
  });
}
