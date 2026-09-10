import { useEffect, useState } from "react";
import { RouterProvider, AuthProvider, useRouter, useAuth } from "./context";
import { Layout } from "./components/Layout";
import { api } from "./api";

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
  const { isLoggedIn, token } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

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
