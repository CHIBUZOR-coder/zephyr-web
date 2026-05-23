import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "../../../../core/query/authClient";
import type { SocialPost } from "./socialFeed.types";

export function useSocialFeed() {
  const queryClient = useQueryClient();

  const {
    data: feed,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["social-feed"],
    queryFn: async () => {
      try {
        const res = await authFetch<{ success: boolean; data: SocialPost[] }>(
          "/api/social/feed",
        );
        return res.success ? res.data : [];
      } catch (err) {
        console.error("Failed to fetch social feed:", err);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const postMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await authFetch<{ success: boolean; data: SocialPost }>(
        "/api/social/feed",
        {
          method: "POST",
          body: JSON.stringify({ content }),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });

  return {
    feed,
    isLoading,
    error,
    post: postMutation.mutateAsync,
    isPosting: postMutation.isPending,
    postError: postMutation.error,
  };
}
