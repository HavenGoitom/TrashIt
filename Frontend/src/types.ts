export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: "user" | "admin";
  bio?: string;
  location?: string;
  createdAt?: string;
  suspended?: boolean;
}

export interface PriceRange {
  fixed?: number;
  min?: number;
  max?: number;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  images: string[];
  type: "sell" | "buy";
  price: PriceRange;
  quantity: PriceRange;
  status: "active" | "sold" | "closed";
  user: Pick<User, "_id" | "username" | "name" | "email">;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Pick<User, "_id" | "username" | "name" | "email">[];
  post: Pick<Post, "_id" | "title" | "type" | "status">;
  lastMessage: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: Pick<User, "_id" | "username" | "name">;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: "new_conversation" | "new_message" | "match" | "post_update";
  message: string;
  read: boolean;
  sender?: Pick<User, "username" | "name">;
  relatedPost?: Pick<Post, "_id" | "title">;
  relatedConversation?: string;
  createdAt: string;
}

export interface Favorite {
  _id: string;
  user: string;
  post: Post;
  createdAt: string;
}

export interface Match {
  _id: string;
  buyPost: Post & { user: User };
  sellPost: Post & { user: User };
  buyerNotified: boolean;
  sellerNotified: boolean;
  createdAt: string;
}

export interface AIIdea {
  title: string;
  description: string;
  steps: string[];
  difficulty: "easy" | "medium" | "hard";
}

export interface Report {
  _id: string;
  targetType: "post" | "user";
  reportedPost?: Pick<Post, "_id" | "title">;
  reportedUser?: Pick<User, "_id" | "username">;
  reporter: Pick<User, "_id" | "username" | "name">;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  adminNote?: string;
  createdAt: string;
}

export interface AdminStats {
  users: { total: number; suspended: number };
  posts: { total: number; active: number; sold: number; closed: number };
  reports: { pending: number };
}

export type Page =
  | "landing"
  | "login"
  | "register"
  | "discover"
  | "browse"
  | "post-detail"
  | "create-post"
  | "edit-post"
  | "my-posts"
  | "favorites"
  | "matches"
  | "messages"
  | "notifications"
  | "profile"
  | "ai"
  | "admin";

export interface PageParams {
  postId?: string;
  type?: "buy" | "sell";
  search?: string;
  conversationId?: string;
  tab?: string;
}
