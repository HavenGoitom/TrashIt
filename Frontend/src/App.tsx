import { useEffect, useState } from "react";
import { RouterProvider, AuthProvider, useRouter, useAuth } from "./context";
import { Layout } from "./components/Layout";
import { api, initSocket, getSocket } from "./api";
import type { Notification } from "./types";

// Pages
import Landing from "./pages/Landing";
import { Login, Register } from "./pages/Auth";
import Discover from "./pages/Discover";
import Browse from "./pages/Browse";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import MyPosts from "./pages/MyPosts";
import Favorites from "./pages/Favorites";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AIPage from "./pages/AIPage";
import Admin from "./pages/Admin";

// ─── Router ───────────────────────────────────────────────────────────────────

function AppRouter() {
  const { page } = useRouter();
  const { isLoggedIn, token, logout, authRestoring } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  // Validate the stored session once on mount. If the access token has expired
  // the API client silently refreshes it using the HttpOnly refresh cookie; if
  // that fails the session is cleared and the user is asked to sign in again.
  useEffect(() => {
    const storedToken = localStorage.getItem("trashit_token");
    if (!storedToken) return;

    api.auth.me(storedToken).catch(() => {
      // Only sign out if the session we validated is still the active one, so a
      // user who just signed in is never kicked back out.
      if (localStorage.getItem("trashit_token") === storedToken) {
        logout();
      }
    });
  }, [logout]);

  // Initialize socket and listen for real-time notifications
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    const socket = initSocket(token);
    const handleNotification = (notification: Notification) => {
      setNotifCount(prev => prev + 1);
    };
    socket.on("new_notification", handleNotification);
    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, [isLoggedIn, token]);

  // Poll notification count
  useEffect(() => {
    if (!isLoggedIn || !token) { setNotifCount(0); return; }
    const fetchCount = () => {
      api.notifications.getUnreadCount(token).then(res => setNotifCount(res.unreadCount)).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

  // Show nothing while restoring auth
  if (authRestoring) {
    return (
      <div className="min-h-full flex items-center justify-center bg-cream-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pages that don't use the Layout wrapper
  const standalonePages: typeof page[] = ["landing", "login", "register"];

  if (standalonePages.includes(page)) {
    switch (page) {
      case "landing": return <Landing />;
      case "login": return <Login />;
      case "register": return <Register />;
    }
  }

  // Protected pages (redirect to login if not authenticated)
  const protectedPages: typeof page[] = [
    "create-post", "edit-post", "my-posts", "favorites", "matches",
    "messages", "notifications", "profile", "ai", "admin",
  ];
  if (protectedPages.includes(page) && !isLoggedIn) {
    return <Login />;
  }

  // Render in layout
  return (
    <Layout notifCount={notifCount}>
      {renderPage(page)}
    </Layout>
  );
}

function renderPage(page: string) {
  switch (page) {
    case "discover": return <Discover />;
    case "browse": return <Browse />;
    case "post-detail": return <PostDetail />;
    case "create-post": return <CreatePost />;
    case "edit-post": return <CreatePost />;
    case "my-posts": return <MyPosts />;
    case "favorites": return <Favorites />;
    case "matches": return <Matches />;
    case "messages": return <Messages />;
    case "notifications": return <Notifications />;
    case "profile": return <Profile />;
    case "ai": return <AIPage />;
    case "admin": return <Admin />;
    default: return <Discover />;
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRouter />
      </RouterProvider>
    </AuthProvider>
  );
}
