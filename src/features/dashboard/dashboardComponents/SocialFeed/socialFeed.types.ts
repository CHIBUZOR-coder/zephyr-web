export type FeedItemType = {
  id: string;
  username: string;
  avatarUrl?: string;
  content: string;
  timestamp: string; // ISO string
  likes?: number;
  comments?: number;
};
