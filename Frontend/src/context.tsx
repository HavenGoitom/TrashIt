import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { User, Page, PageParams } from "./types";
import { disconnectSocket, api } from "./api";

// ─── Router ───────────────────────────────────────────────────────────────────

interface RouterState {
  page: Page;
  params: PageParams;
}

interface RouterContextValue {
  page: Page;
  params: PageParams;
  navigate: (page: Page, params?: PageParams) => void;
  back: () => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<RouterState[]>([{ page: "landing", params: {} }]);
  const current = history[history.length - 1];

  const navigate = useCallback((page: Page, params: PageParams = {}) => {
    setHistory((h) => [...h, { page, params }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const back = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <RouterContext.Provider value={{ page: current.page, params: current.params, navigate, back }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be inside RouterProvider");
  return ctx;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

const TOKEN_KEY = "trashit_token";
const USER_KEY = "trashit_user";

function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  authRestoring: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [authRestoring, setAuthRestoring] = useState(true);

  const login = useCallback((t: string, u: User) => {
    setToken(t);
    setUser(u);
    try {
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch { /* storage unavailable */ }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    disconnectSocket();
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { /* storage unavailable */ }
    // Revoke the refresh token server-side and clear the HttpOnly cookie so the
    // session cannot be silently restored later.
    void api.auth.logout();
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch { /* storage unavailable */ }
  }, []);

  // Listen for 401/invalid token events from API
  useEffect(() => {
    const handleUnauthorized = () => { logout(); };
    window.addEventListener("trashit:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("trashit:unauthorized", handleUnauthorized);
  }, [logout]);

  // Adopt an access token that the API client silently obtained by exchanging
  // the HttpOnly refresh cookie. This keeps the user signed in past the 1-day
  // access-token lifetime without ever showing the login page.
  useEffect(() => {
    const handleRefreshed = (event: Event) => {
      const detail = (event as CustomEvent).detail as { token?: string; user?: User } | undefined;
      if (detail?.token && detail?.user) {
        login(detail.token, detail.user);
      }
    };
    window.addEventListener("trashit:token-refreshed", handleRefreshed);
    return () => window.removeEventListener("trashit:token-refreshed", handleRefreshed);
  }, [login]);

  // Restore the session on load. A stored token is validated by the app (the
  // API client refreshes it silently on 401); with no stored token we fall back
  // to the refresh cookie so the session survives a cleared localStorage.
  useEffect(() => {
    let cancelled = false;

    if (getStoredToken() && getStoredUser()) {
      setAuthRestoring(false);
      return;
    }

    api.auth.refresh()
      .then((res) => {
        if (!cancelled) login(res.token, res.user);
      })
      .catch(() => {
        // No usable refresh token — the user simply stays signed out.
      })
      .finally(() => {
        if (!cancelled) setAuthRestoring(false);
      });

    return () => { cancelled = true; };
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAdmin: user?.role === "admin",
        isLoggedIn: !!user,
        authRestoring,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
