// src/features/users/useUserProfile.ts
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "../core/query/authClient"; 
import type { UserProfile } from "../features/users/user.types"; 

type UserProfileResponse = {
  success: boolean;
  user: UserProfile;
};

/**
 * Fetches user profile for a given wallet address.
 * The query is enabled only if a valid walletAddress is provided.
 */
export function useUserProfile(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-profile", walletAddress],
    queryFn: () =>
      authFetch<UserProfileResponse>(`/api/users/${walletAddress}`),
    enabled: !!walletAddress, // only fetch if walletAddress exists
    select: (data) => data.user, // return only the user object
  });
}
