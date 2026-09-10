import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { User, Page, PageParams } from "./types";

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

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback((t: string, u: User) => {
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
  }, []);

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
