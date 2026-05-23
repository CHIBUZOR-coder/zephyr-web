export interface SocialPost {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    walletAddress: string;
    displayName: string | null;
    username: string | null;
    avatar: string | null;
  };
}

export type FeedItemType = SocialPost;

// Dummy export to ensure this is treated as a module at runtime
export const SOCIAL_POST_VERSION = "1.0.0";
