import { io, Socket } from "socket.io-client";
import type {
  User,
  Post,
  Conversation,
  Message,
  Notification,
  Favorite,
  Match,
  AIIdea,
  Report,
  AdminStats,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL;
const USE_MOCK = false;

function authHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader(token ?? null),
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json();
  if (!res.ok) {
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('trashit:unauthorized'));
      }
      throw new Error(data.message || 'Request failed');
    }
  return data;
}

// ─── Socket.io ─────────────────────────────────────────────────────────────────

let socket: Socket | null = null;

export function initSocket(token: string): Socket {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ─── Image Upload ──────────────────────────────────────────────────────────────

export async function uploadImages(files: FileList | File[], token: string): Promise<string[]> {
  const formData = new FormData();
  const fileArray = Array.from(files);
  fileArray.forEach((file) => formData.append("images", file));

  const res = await fetch(`${BASE_URL}/image/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.images.map((img: { url: string }) => img.url);
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    _id: "u1",
    username: "sara_addis",
    name: "Sara Bekele",
    email: "sara@example.com",
    role: "user",
    bio: "Upcycling enthusiast. Turning trash into treasure one item at a time.",
    location: "Addis Ababa",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    _id: "u2",
    username: "daniel_m",
    name: "Daniel Mengistu",
    email: "daniel@example.com",
    role: "user",
    location: "Dire Dawa",
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    _id: "u3",
    username: "liya_t",
    name: "Liya Tadesse",
    email: "liya@example.com",
    role: "user",
    location: "Bahir Dar",
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    _id: "u4",
    username: "admin",
    name: "TrashIt Admin",
    email: "admin@trashit.com",
    role: "admin",
    createdAt: "2023-12-01T10:00:00Z",
  },
];

const unsplashImages: Record<string, string> = {
  bottles: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&h=400&fit=crop&auto=format",
  cardboard: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&h=400&fit=crop&auto=format",
  clothes: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=400&fit=crop&auto=format",
  jars: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop&auto=format",
  tires: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
  electronics: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&h=400&fit=crop&auto=format",
  wood: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=400&fit=crop&auto=format",
  metal: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop&auto=format",
  paper: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=400&fit=crop&auto=format",
  furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&auto=format",
  cans: "https://images.unsplash.com/photo-1581281869957-2df7e34e7498?w=600&h=400&fit=crop&auto=format",
  general: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
};

export const MOCK_POSTS: Post[] = [
  {
    _id: "p1",
    title: "Clean Plastic Bottles — Bulk Pack",
    description: "Well-cleaned PET plastic bottles, great for recycling or creative reuse projects. Sorted by size and rinsed clean.",
    images: [unsplashImages.bottles],
    type: "sell",
    price: { fixed: 500 },
    quantity: { fixed: 50 },
    status: "active",
    user: { _id: "u2", username: "daniel_m", name: "Daniel Mengistu", email: "daniel@example.com" },
    location: "Dire Dawa",
    createdAt: "2024-09-01T09:00:00Z",
    updatedAt: "2024-09-01T09:00:00Z",
  },
  {
    _id: "p2",
    title: "Looking for Cardboard Boxes",
    description: "Need sturdy cardboard boxes for an upcycling workshop. Any size works — small, medium, or large. Can pick up.",
    images: [unsplashImages.cardboard],
    type: "buy",
    price: { min: 200, max: 400 },
    quantity: { min: 10, max: 30 },
    status: "active",
    user: { _id: "u1", username: "sara_addis", name: "Sara Bekele", email: "sara@example.com" },
    location: "Addis Ababa",
    createdAt: "2024-09-02T10:00:00Z",
    updatedAt: "2024-09-02T10:00:00Z",
  },
  {
    _id: "p3",
    title: "Vintage Denim Jackets — Pre-loved",
    description: "A collection of pre-loved denim jackets ready for a new home. Great for upcycling or restyling. Various sizes available.",
    images: [unsplashImages.clothes],
    type: "sell",
    price: { min: 150, max: 300 },
    quantity: { fixed: 8 },
    status: "active",
    user: { _id: "u3", username: "liya_t", name: "Liya Tadesse", email: "liya@example.com" },
    location: "Bahir Dar",
    createdAt: "2024-09-03T11:00:00Z",
    updatedAt: "2024-09-03T11:00:00Z",
  },
  {
    _id: "p4",
    title: "Glass Jar Collection — Assorted Sizes",
    description: "Beautiful glass jars from jams, pickles, and pasta sauces. Cleaned and ready for storage, candle-making, or decoration.",
    images: [unsplashImages.jars],
    type: "sell",
    price: { fixed: 30 },
    quantity: { fixed: 40 },
    status: "active",
    user: { _id: "u2", username: "daniel_m", name: "Daniel Mengistu", email: "daniel@example.com" },
    location: "Addis Ababa",
    createdAt: "2024-09-04T08:00:00Z",
    updatedAt: "2024-09-04T08:00:00Z",
  },
  {
    _id: "p5",
    title: "Need Used Bicycle Tires",
    description: "Looking for used bicycle tires for a garden upcycling project — creating tire planters. Any condition acceptable.",
    images: [unsplashImages.tires],
    type: "buy",
    price: { min: 50, max: 150 },
    quantity: { min: 5, max: 20 },
    status: "active",
    user: { _id: "u1", username: "sara_addis", name: "Sara Bekele", email: "sara@example.com" },
    location: "Addis Ababa",
    createdAt: "2024-09-05T12:00:00Z",
    updatedAt: "2024-09-05T12:00:00Z",
  },
  {
    _id: "p6",
    title: "Scrap Wood Pieces — Workshop Offcuts",
    description: "Assorted hardwood offcuts from a carpentry workshop. Various shapes and sizes — excellent for craft projects and small builds.",
    images: [unsplashImages.wood],
    type: "sell",
    price: { fixed: 200 },
    quantity: { min: 20, max: 50 },
    status: "active",
    user: { _id: "u3", username: "liya_t", name: "Liya Tadesse", email: "liya@example.com" },
    location: "Bahir Dar",
    createdAt: "2024-09-06T13:00:00Z",
    updatedAt: "2024-09-06T13:00:00Z",
  },
  {
    _id: "p7",
    title: "Old Electronics — Circuit Boards & Parts",
    description: "Old computers, phones, and appliances for component recovery. Good for electronics hobbyists and repair projects.",
    images: [unsplashImages.electronics],
    type: "sell",
    price: { min: 100, max: 500 },
    quantity: { fixed: 15 },
    status: "active",
    user: { _id: "u2", username: "daniel_m", name: "Daniel Mengistu", email: "daniel@example.com" },
    location: "Dire Dawa",
    createdAt: "2024-09-07T09:00:00Z",
    updatedAt: "2024-09-07T09:00:00Z",
  },
  {
    _id: "p8",
    title: "Looking for Aluminum Cans",
    description: "Collecting aluminum cans for a school recycling drive. Any quantity helps — I can arrange pickup or delivery.",
    images: [unsplashImages.cans],
    type: "buy",
    price: { fixed: 10 },
    quantity: { min: 100, max: 500 },
    status: "active",
    user: { _id: "u3", username: "liya_t", name: "Liya Tadesse", email: "liya@example.com" },
    location: "Bahir Dar",
    createdAt: "2024-09-08T10:00:00Z",
    updatedAt: "2024-09-08T10:00:00Z",
  },
  {
    _id: "p9",
    title: "Vintage Wooden Furniture — Set of 3",
    description: "A beautiful set of vintage wooden chairs — solid structure, just needs refinishing. Priced to move quickly.",
    images: [unsplashImages.furniture],
    type: "sell",
    price: { fixed: 1200 },
    quantity: { fixed: 1 },
    status: "sold",
    user: { _id: "u1", username: "sara_addis", name: "Sara Bekele", email: "sara@example.com" },
    location: "Addis Ababa",
    createdAt: "2024-08-20T10:00:00Z",
    updatedAt: "2024-09-05T15:00:00Z",
  },
  {
    _id: "p10",
    title: "Scrap Metal — Iron & Steel",
    description: "Various metal scraps from a home renovation — pipes, brackets, sheet metal. Good condition for repurposing.",
    images: [unsplashImages.metal],
    type: "sell",
    price: { min: 300, max: 800 },
    quantity: { fixed: 25 },
    status: "active",
    user: { _id: "u2", username: "daniel_m", name: "Daniel Mengistu", email: "daniel@example.com" },
    location: "Addis Ababa",
    createdAt: "2024-09-09T11:00:00Z",
    updatedAt: "2024-09-09T11:00:00Z",
  },
  {
    _id: "p11",
    title: "Newspaper & Cardboard Pulp Material",
    description: "Large supply of old newspapers and cardboard — perfect for papier-mâché, composting, or packing material.",
    images: [unsplashImages.paper],
    type: "sell",
    price: { fixed: 80 },
    quantity: { min: 50, max: 200 },
    status: "active",
    user: { _id: "u3", username: "liya_t", name: "Liya Tadesse", email: "liya@example.com" },
    location: "Bahir Dar",
    createdAt: "2024-09-10T07:00:00Z",
    updatedAt: "2024-09-10T07:00:00Z",
  },
  {
    _id: "p12",
    title: "Need Old Fabric & Textile Scraps",
    description: "Looking for fabric offcuts, old clothing scraps, and textile waste for a rug-making project. Any color or material.",
    images: [unsplashImages.clothes],
    type: "buy",
    price: { min: 50, max: 200 },
    quantity: { min: 5, max: 30 },
    status: "active",
    user: { _id: "u1", username: "sara_addis", name: "Sara Bekele", email: "sara@example.com" },
    location: "Addis Ababa",
    createdAt: "2024-09-10T08:00:00Z",
    updatedAt: "2024-09-10T08:00:00Z",
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    _id: "c1",
    participants: [
      { _id: "u1", username: "sara_addis", name: "Sara Bekele", email: "sara@example.com" },
      { _id: "u2", username: "daniel_m", name: "Daniel Mengistu", email: "daniel@example.com" },
    ],
    post: { _id: "p1", title: "Clean Plastic Bottles — Bulk Pack", type: "sell", status: "active" },
    lastMessage: "I can deliver them this Saturday, does that work?",
    lastMessageAt: "2024-09-10T14:30:00Z",
    createdAt: "2024-09-09T10:00:00Z",
  },
  {
    _id: "c2",
    participants: [
      { _id: "u1", username: "sara_addis", name: "Sara Bekele", email: "sara@example.com" },
      { _id: "u3", username: "liya_t", name: "Liya Tadesse", email: "liya@example.com" },
    ],
    post: { _id: "p3", title: "Vintage Denim Jackets — Pre-loved", type: "sell", status: "active" },
    lastMessage: "Are any of the jackets size M?",
    lastMessageAt: "2024-09-10T11:00:00Z",
    createdAt: "2024-09-10T10:00:00Z",
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      _id: "m1",
      conversation: "c1",
      sender: { _id: "u1", username: "sara_addis", name: "Sara Bekele" },
      content: "Hi! Are the plastic bottles still available?",
      read: true,
      createdAt: "2024-09-09T10:00:00Z",
    },
    {
      _id: "m2",
      conversation: "c1",
      sender: { _id: "u2", username: "daniel_m", name: "Daniel Mengistu" },
      content: "Yes they are! How many do you need?",
      read: true,
      createdAt: "2024-09-09T10:15:00Z",
    },
    {
      _id: "m3",
      conversation: "c1",
      sender: { _id: "u1", username: "sara_addis", name: "Sara Bekele" },
      content: "Around 20 would be great. What would the price be?",
      read: true,
      createdAt: "2024-09-09T10:30:00Z",
    },
    {
      _id: "m4",
      conversation: "c1",
      sender: { _id: "u2", username: "daniel_m", name: "Daniel Mengistu" },
      content: "I can do 20 for 200 birr. I can deliver them this Saturday, does that work?",
      read: false,
      createdAt: "2024-09-10T14:30:00Z",
    },
  ],
  c2: [
    {
      _id: "m5",
      conversation: "c2",
      sender: { _id: "u1", username: "sara_addis", name: "Sara Bekele" },
      content: "Hello! Are any of the jackets size M?",
      read: false,
      createdAt: "2024-09-10T11:00:00Z",
    },
  ],
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: "n1",
    recipient: "u1",
    type: "new_message",
    message: "daniel_m sent you a message about 'Clean Plastic Bottles'",
    read: false,
    sender: { username: "daniel_m", name: "Daniel Mengistu" },
    relatedPost: { _id: "p1", title: "Clean Plastic Bottles — Bulk Pack" },
    relatedConversation: "c1",
    createdAt: "2024-09-10T14:30:00Z",
  },
  {
    _id: "n2",
    recipient: "u1",
    type: "match",
    message: "We found a match for your BUY post — someone has cardboard boxes!",
    read: false,
    relatedPost: { _id: "p2", title: "Looking for Cardboard Boxes" },
    createdAt: "2024-09-10T12:00:00Z",
  },
  {
    _id: "n3",
    recipient: "u1",
    type: "new_conversation",
    message: "liya_t wants to discuss your post about cardboard boxes",
    read: true,
    sender: { username: "liya_t", name: "Liya Tadesse" },
    relatedPost: { _id: "p2", title: "Looking for Cardboard Boxes" },
    relatedConversation: "c2",
    createdAt: "2024-09-10T10:00:00Z",
  },
  {
    _id: "n4",
    recipient: "u1",
    type: "match",
    message: "Your tire post matched with someone selling bicycle wheels!",
    read: true,
    relatedPost: { _id: "p5", title: "Need Used Bicycle Tires" },
    createdAt: "2024-09-09T09:00:00Z",
  },
];

export const MOCK_FAVORITES: Favorite[] = [
  {
    _id: "f1",
    user: "u1",
    post: MOCK_POSTS[0],
    createdAt: "2024-09-08T10:00:00Z",
  },
  {
    _id: "f2",
    user: "u1",
    post: MOCK_POSTS[5],
    createdAt: "2024-09-09T10:00:00Z",
  },
];

export const MOCK_MATCHES: Match[] = [
  {
    _id: "match1",
    buyPost: { ...MOCK_POSTS[1], user: MOCK_USERS[0] } as Post & { user: User },
    sellPost: { ...MOCK_POSTS[10], user: MOCK_USERS[2] } as Post & { user: User },
    buyerNotified: true,
    sellerNotified: true,
    createdAt: "2024-09-10T12:00:00Z",
  },
  {
    _id: "match2",
    buyPost: { ...MOCK_POSTS[4], user: MOCK_USERS[0] } as Post & { user: User },
    sellPost: { ...MOCK_POSTS[9], user: MOCK_USERS[1] } as Post & { user: User },
    buyerNotified: true,
    sellerNotified: false,
    createdAt: "2024-09-09T09:00:00Z",
  },
];

export const MOCK_REPORTS: Report[] = [
  {
    _id: "r1",
    targetType: "post",
    reportedPost: { _id: "p7", title: "Old Electronics — Circuit Boards & Parts" },
    reporter: { _id: "u3", username: "liya_t", name: "Liya Tadesse" },
    reason: "Price seems misleading — description does not match the photos.",
    status: "pending",
    createdAt: "2024-09-09T15:00:00Z",
  },
  {
    _id: "r2",
    targetType: "user",
    reportedUser: { _id: "u2", username: "daniel_m" },
    reporter: { _id: "u1", username: "sara_addis", name: "Sara Bekele" },
    reason: "User was rude and unresponsive after agreeing to a trade.",
    status: "resolved",
    adminNote: "Warning issued to user.",
    createdAt: "2024-09-08T10:00:00Z",
  },
];

export const MOCK_ADMIN_STATS: AdminStats = {
  users: { total: 127, suspended: 3 },
  posts: { total: 284, active: 201, sold: 58, closed: 25 },
  reports: { pending: 7 },
};

// ─── API Client ───────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: async (data: { username: string; name: string; email: string; password: string }) => {
      if (USE_MOCK) {
        await delay(600);
        const user: User = { _id: "u_new", username: data.username, name: data.name, email: data.email, role: "user" };
        return { success: true, token: "mock_token_new", user };
      }
      return request<{ success: boolean; token: string; user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    login: async (data: { email: string; password: string }) => {
      if (USE_MOCK) {
        await delay(600);
        const user = data.email === "admin@trashit.com" ? MOCK_USERS[3] : MOCK_USERS[0];
        if (data.password.length < 6) throw new Error("Invalid email or password");
        return { success: true, token: "mock_token_" + user._id, user };
      }
      return request<{ success: boolean; token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    me: async (token: string) => {
      if (USE_MOCK) {
        await delay(300);
        return { success: true, user: MOCK_USERS[0] };
      }
      return request<{ success: boolean; user: User }>("/api/auth/me", {}, token);
    },
  },

  posts: {
    getAll: async (params?: Record<string, string | number>) => {
      if (USE_MOCK) {
        await delay(400);
        let posts = [...MOCK_POSTS];
        if (params?.type) posts = posts.filter((p) => p.type === params.type);
        if (params?.search) {
          const s = String(params.search).toLowerCase();
          posts = posts.filter((p) => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
        }
        if (params?.status) posts = posts.filter((p) => p.status === params.status);
        return { success: true, count: posts.length, total: posts.length, totalPages: 1, currentPage: 1, posts };
      }
      const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
      return request<{ success: boolean; count: number; total: number; posts: Post[] }>(`/api/posts${query}`);
    },
    getOne: async (id: string) => {
      if (USE_MOCK) {
        await delay(300);
        const post = MOCK_POSTS.find((p) => p._id === id);
        if (!post) throw new Error("Post not found");
        return { success: true, post };
      }
      return request<{ success: boolean; post: Post }>(`/api/posts/${id}`);
    },
    create: async (data: Partial<Post>, token: string) => {
      if (USE_MOCK) {
        await delay(700);
        return { success: true, message: "Post created successfully", post: { ...data, _id: "p_new", status: "active" } as Post };
      }
      return request<{ success: boolean; post: Post }>("/api/posts", { method: "POST", body: JSON.stringify(data) }, token);
    },
    update: async (id: string, data: Partial<Post>, token: string) => {
      if (USE_MOCK) {
        await delay(500);
        return { success: true, message: "Post updated successfully" };
      }
      return request<{ success: boolean }>(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
    },
    updateStatus: async (id: string, status: string, token: string) => {
      if (USE_MOCK) {
        await delay(400);
        return { success: true, message: `Post status updated to '${status}'` };
      }
      return request<{ success: boolean }>(`/api/posts/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
    },
    delete: async (id: string, token: string) => {
      if (USE_MOCK) {
        await delay(400);
        return { success: true, message: "Post deleted successfully" };
      }
      return request<{ success: boolean }>(`/api/posts/${id}`, { method: "DELETE" }, token);
    },
  },

  favorites: {
    getAll: async (token: string) => {
      if (USE_MOCK) {
        await delay(400);
        return { success: true, count: MOCK_FAVORITES.length, favorites: MOCK_FAVORITES };
      }
      return request<{ success: boolean; favorites: Favorite[] }>("/api/favorites", {}, token);
    },
    add: async (postId: string, token: string) => {
      if (USE_MOCK) { await delay(300); return { success: true, message: "Post added to favorites" }; }
      return request<{ success: boolean }>(`/api/favorites/${postId}`, { method: "POST" }, token);
    },
    remove: async (postId: string, token: string) => {
      if (USE_MOCK) { await delay(300); return { success: true, message: "Post removed from favorites" }; }
      return request<{ success: boolean }>(`/api/favorites/${postId}`, { method: "DELETE" }, token);
    },
    check: async (postId: string, token: string) => {
      if (USE_MOCK) {
        await delay(200);
        return { success: true, isFavorited: MOCK_FAVORITES.some((f) => f.post._id === postId) };
      }
      return request<{ success: boolean; isFavorited: boolean }>(`/api/favorites/check/${postId}`, {}, token);
    },
  },

  conversations: {
    getAll: async (token: string) => {
      if (USE_MOCK) {
        await delay(400);
        return { success: true, count: MOCK_CONVERSATIONS.length, conversations: MOCK_CONVERSATIONS };
      }
      return request<{ success: boolean; conversations: Conversation[] }>("/api/conversations", {}, token);
    },
    create: async (postId: string, token: string) => {
      if (USE_MOCK) { await delay(500); return { success: true, conversation: MOCK_CONVERSATIONS[0] }; }
      return request<{ success: boolean; conversation: Conversation }>("/api/conversations", { method: "POST", body: JSON.stringify({ postId }) }, token);
    },
    getMessages: async (id: string, token: string) => {
      if (USE_MOCK) {
        await delay(400);
        const messages = MOCK_MESSAGES[id] || [];
        return { success: true, count: messages.length, messages };
      }
      return request<{ success: boolean; messages: Message[] }>(`/api/conversations/${id}/messages`, {}, token);
    },
  },

  notifications: {
    getAll: async (token: string) => {
      if (USE_MOCK) {
        await delay(400);
        return { success: true, count: MOCK_NOTIFICATIONS.length, notifications: MOCK_NOTIFICATIONS };
      }
      return request<{ success: boolean; notifications: Notification[] }>("/api/notifications", {}, token);
    },
    getUnreadCount: async (token: string) => {
      if (USE_MOCK) {
        await delay(200);
        return { success: true, unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length };
      }
      return request<{ success: boolean; unreadCount: number }>("/api/notifications/unread-count", {}, token);
    },
    markRead: async (id: string, token: string) => {
      if (USE_MOCK) { await delay(200); return { success: true }; }
      return request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: "PATCH" }, token);
    },
    markAllRead: async (token: string) => {
      if (USE_MOCK) { await delay(300); return { success: true }; }
      return request<{ success: boolean }>("/api/notifications/read-all", { method: "PATCH" }, token);
    },
  },

  profile: {
    update: async (data: Partial<User>, token: string) => {
      if (USE_MOCK) { await delay(500); return { success: true, message: "Profile updated", user: { ...MOCK_USERS[0], ...data } }; }
      return request<{ success: boolean; user: User }>("/api/profile", { method: "PUT", body: JSON.stringify(data) }, token);
    },
    changePassword: async (data: { currentPassword: string; newPassword: string }, token: string) => {
      if (USE_MOCK) {
        await delay(500);
        if (data.currentPassword !== "password123") throw new Error("Current password is incorrect");
        return { success: true, message: "Password changed successfully" };
      }
      return request<{ success: boolean }>("/api/profile/password", { method: "PUT", body: JSON.stringify(data) }, token);
    },
    delete: async (password: string, token: string) => {
      if (USE_MOCK) { await delay(600); return { success: true, message: "Account deleted successfully" }; }
      return request<{ success: boolean }>("/api/profile", { method: "DELETE", body: JSON.stringify({ password }) }, token);
    },
  },

  reports: {
    reportPost: async (postId: string, reason: string, token: string) => {
      if (USE_MOCK) { await delay(500); return { success: true, message: "Post reported successfully" }; }
      return request<{ success: boolean }>(`/api/reports/post/${postId}`, { method: "POST", body: JSON.stringify({ reason }) }, token);
    },
    reportUser: async (userId: string, reason: string, token: string) => {
      if (USE_MOCK) { await delay(500); return { success: true, message: "User reported successfully" }; }
      return request<{ success: boolean }>(`/api/reports/user/${userId}`, { method: "POST", body: JSON.stringify({ reason }) }, token);
    },
    getMy: async (token: string) => {
      if (USE_MOCK) { await delay(400); return { success: true, count: MOCK_REPORTS.length, reports: MOCK_REPORTS }; }
      return request<{ success: boolean; reports: Report[] }>("/api/reports/my", {}, token);
    },
  },

  ai: {
    whatCouldIMake: async (material: string, token: string) => {
      if (USE_MOCK) {
        await delay(1800);
        return {
          success: true,
          material,
          ideas: generateMockIdeas(material),
        };
      }
      return request<{ success: boolean; material: string; ideas: AIIdea[] }>(
        "/api/ai/what-could-i-make",
        { method: "POST", body: JSON.stringify({ material }) },
        token
      );
    },
    getMatches: async (token: string) => {
      if (USE_MOCK) { await delay(500); return { success: true, count: MOCK_MATCHES.length, matches: MOCK_MATCHES }; }
      return request<{ success: boolean; matches: Match[] }>("/api/matches", {}, token);
    },
    getMatchDetail: async (id: string, token: string) => {
      if (USE_MOCK) {
        await delay(400);
        const match = MOCK_MATCHES.find((m) => m._id === id);
        if (!match) throw new Error("Match not found");
        return { success: true, match };
      }
      return request<{ success: boolean; match: Match }>(`/api/matches/${id}`, {}, token);
    },
  },

  admin: {
    getUsers: async (token: string) => {
      if (USE_MOCK) { await delay(400); return { success: true, count: MOCK_USERS.length, users: MOCK_USERS }; }
      return request<{ success: boolean; users: User[] }>("/api/admin/users", {}, token);
    },
    suspendUser: async (userId: string, token: string) => {
      if (USE_MOCK) { await delay(400); return { success: true, message: "User suspended" }; }
      return request<{ success: boolean }>(`/api/admin/users/${userId}/suspend`, { method: "PATCH" }, token);
    },
    getPosts: async (token: string) => {
      if (USE_MOCK) { await delay(400); return { success: true, count: MOCK_POSTS.length, posts: MOCK_POSTS }; }
      return request<{ success: boolean; posts: Post[] }>("/api/admin/posts", {}, token);
    },
    deletePost: async (postId: string, token: string) => {
      if (USE_MOCK) { await delay(400); return { success: true, message: "Post removed by admin" }; }
      return request<{ success: boolean }>(`/api/admin/posts/${postId}`, { method: "DELETE" }, token);
    },
    getReports: async (token: string, status?: string) => {
      if (USE_MOCK) {
        await delay(400);
        const reports = status ? MOCK_REPORTS.filter((r) => r.status === status) : MOCK_REPORTS;
        return { success: true, count: reports.length, reports };
      }
      const q = status ? `?status=${status}` : "";
      return request<{ success: boolean; reports: Report[] }>(`/api/admin/reports${q}`, {}, token);
    },
    resolveReport: async (reportId: string, adminNote: string, token: string) => {
      if (USE_MOCK) { await delay(400); return { success: true }; }
      return request<{ success: boolean }>(`/api/admin/reports/${reportId}/resolve`, { method: "PATCH", body: JSON.stringify({ adminNote }) }, token);
    },
    getStats: async (token: string) => {
      if (USE_MOCK) { await delay(400); return { success: true, stats: MOCK_ADMIN_STATS }; }
      return request<{ success: boolean; stats: AdminStats }>("/api/admin/stats", {}, token);
    },
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function generateMockIdeas(material: string): AIIdea[] {
  const ideas: Record<string, AIIdea[]> = {
    default: [
      {
        title: "Decorative Centerpiece",
        description: `Transform your ${material} into a beautiful centerpiece for tables or shelves.`,
        steps: ["Clean the material thoroughly", "Sand or smooth any rough edges", "Apply primer and paint in desired color", "Add decorative elements like rope, paint, or fabric", "Display proudly"],
        difficulty: "easy",
      },
      {
        title: "Functional Storage Container",
        description: `Repurpose your ${material} into clever storage for everyday items.`,
        steps: ["Clean and dry the material", "Measure and cut if needed", "Line with fabric or paper for aesthetics", "Add labels or paint for identification", "Use for organizing small items"],
        difficulty: "easy",
      },
      {
        title: "Garden Planter",
        description: `Give ${material} new life as a unique garden planter for herbs or flowers.`,
        steps: ["Drill drainage holes in the bottom", "Add a layer of gravel for drainage", "Fill with potting mix", "Plant your chosen seeds or seedlings", "Water and place in appropriate sunlight"],
        difficulty: "easy",
      },
      {
        title: "Lamp or Light Fixture",
        description: `Create a stunning light fixture using ${material} as the main structure.`,
        steps: ["Plan the design and ensure structural integrity", "Cut openings for light and cables", "Wire a simple lamp kit (or use fairy lights)", "Decorate the exterior with paint or texture", "Mount safely and enjoy the ambiance"],
        difficulty: "medium",
      },
      {
        title: "Art Installation Piece",
        description: `Create a meaningful art piece using ${material} to spark conversations about reuse.`,
        steps: ["Gather multiple pieces of the material", "Sketch a concept or theme", "Arrange and connect pieces creatively", "Add color, texture, or mixed media elements", "Display in a prominent location"],
        difficulty: "hard",
      },
    ],
  };

  const lm = material.toLowerCase();
  if (lm.includes("bottle") || lm.includes("plastic")) {
    return [
      { title: "Vertical Garden Tower", description: "Stack plastic bottles to create a stunning vertical garden for balconies or small spaces.", steps: ["Cut openings in the sides of each bottle", "Fill with soil and connect with rope or wire", "Plant herbs or small flowers in each bottle", "Water from the top and let gravity do the rest"], difficulty: "medium" },
      { title: "Bird Feeder", description: "Transform plastic bottles into beautiful bird feeders that attract local wildlife.", steps: ["Cut two large windows in the bottle sides", "Insert wooden spoons as perches", "Fill with birdseed", "Hang from a tree branch with strong string"], difficulty: "easy" },
      { title: "Pencil & Desk Organizer", description: "Cut bottles to different heights and bundle them together as a stylish desk organizer.", steps: ["Cut bottles at varying heights", "Sand cut edges smooth", "Wrap with twine, fabric, or paint", "Glue together in a cluster"], difficulty: "easy" },
      { title: "Mini Greenhouse Cloche", description: "Cut the bottom off large bottles to use as mini greenhouses for seedlings.", steps: ["Cut bottle bottom off cleanly", "Place over young seedlings to protect them", "Remove the cap for ventilation on warm days", "Remove cloche as plants grow bigger"], difficulty: "easy" },
      { title: "Watering Can", description: "Poke small holes in a bottle cap to create a gentle watering can for delicate plants.", steps: ["Use a hot needle to poke small holes in the cap", "Fill bottle with water", "Tighten the cap", "Squeeze gently to water plants evenly"], difficulty: "easy" },
    ];
  }

  if (lm.includes("cardboard")) {
    return [
      { title: "Architectural Model or Toy City", description: "Build a miniature city or architectural model using cardboard for kids or display.", steps: ["Cut building shapes from thick cardboard", "Score and fold for 3D structures", "Paint windows and doors", "Arrange on a base board to create a city scene"], difficulty: "medium" },
      { title: "Storage Boxes with Lids", description: "Create custom storage boxes covered in decorative paper or fabric.", steps: ["Cut cardboard to size for base and lid", "Score and fold edges precisely", "Cover with decorative paper or fabric", "Use glue to secure seams and edges"], difficulty: "easy" },
      { title: "Cat Scratcher Lounger", description: "Layer cardboard strips tightly to create a comfortable cat scratcher your pet will love.", steps: ["Cut strips of equal width from corrugated cardboard", "Glue strips together tightly on their sides", "Shape into an oval or rectangle", "Optionally sprinkle with catnip"], difficulty: "medium" },
      { title: "Photo Frame Collection", description: "Create a gallery wall of unique cardboard frames painted and decorated with personality.", steps: ["Cut frame shapes with a craft knife", "Layer two pieces for depth", "Paint or cover with washi tape", "Attach a backing and mounting hardware"], difficulty: "easy" },
      { title: "Furniture: Bedside Table", description: "Stack and secure cardboard layers to create a surprisingly sturdy bedside table.", steps: ["Stack cardboard in a brick pattern and glue each layer", "Continue until reaching desired height", "Trim sides straight and smooth", "Paint with a strong sealant or primer"], difficulty: "hard" },
    ];
  }

  return ideas.default;
}
