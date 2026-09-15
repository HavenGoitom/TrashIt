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

// Persist the current page in sessionStorage so refreshing the browser keeps
// the user on the page they were viewing (auth state is restored separately).
const PAGE_KEY = "trashit_page";
const PARAMS_KEY = "trashit_params";

function getInitialHistory(): RouterState[] {
  try {
    const storedPage = sessionStorage.getItem(PAGE_KEY) as Page | null;
    if (storedPage) {
      const params = JSON.parse(sessionStorage.getItem(PARAMS_KEY) || "{}");
      return [{ page: storedPage, params }];
    }
  } catch { /* storage unavailable */ }
  return [{ page: "landing", params: {} }];
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<RouterState[]>(getInitialHistory);
  const current = history[history.length - 1];

  const persist = useCallback((state: RouterState) => {
    try {
      sessionStorage.setItem(PAGE_KEY, state.page);
      sessionStorage.setItem(PARAMS_KEY, JSON.stringify(state.params || {}));
    } catch { /* storage unavailable */ }
  }, []);

  const navigate = useCallback((page: Page, params: PageParams = {}) => {
    persist({ page, params });
    setHistory((h) => [...h, { page, params }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [persist]);

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const next = h.slice(0, -1);
      persist(next[next.length - 1]);
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [persist]);

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
  isSuspended: boolean;
  clearSuspended: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [authRestoring, setAuthRestoring] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  const login = useCallback((t: string, u: User) => {
    setToken(t);
    setUser(u);
    setIsSuspended(!!u.suspended);
    try {
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch { /* storage unavailable */ }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsSuspended(false);
    disconnectSocket();
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { /* storage unavailable */ }
    // Revoke the refresh token server-side and clear the HttpOnly cookie so the
    // session cannot be silently restored later.
    void api.auth.logout();
  }, []);

  const clearSuspended = useCallback(() => setIsSuspended(false), []);

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

  // The API client flags a suspended account on any 403 ACCOUNT_SUSPENDED —
  // including a suspended user trying to log in. The app then shows the
  // suspended screen, the only place a review request can be submitted.
  useEffect(() => {
    const handleSuspended = () => setIsSuspended(true);
    window.addEventListener("trashit:suspended", handleSuspended);
    return () => window.removeEventListener("trashit:suspended", handleSuspended);
  }, []);

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
        isSuspended,
        clearSuspended,
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
