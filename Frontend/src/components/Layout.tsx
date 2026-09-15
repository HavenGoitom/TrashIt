import React, { useState } from "react";
import { useRouter } from "../context";
import { useAuth } from "../context";
import type { Page } from "../types";

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/favicon.svg"
      alt="TrashIt logo"
      className={className}
      style={{ height: "2rem", width: "auto" }}
    />
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotifBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative p-2 rounded-xl hover:bg-cream-100 transition-colors" aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-pop-in">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

const NAV_LINKS: { label: string; page: Page; icon: React.ReactNode }[] = [
  {
    label: "Browse",
    page: "browse",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  },
  {
    label: "Create",
    page: "create-post",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>,
  },
  {
    label: "Matches",
    page: "matches",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  },
  {
    label: "Messages",
    page: "messages",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    label: "AI",
    page: "ai",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
];

export function Header({ notifCount = 0 }: { notifCount?: number }) {
  const { navigate, page } = useRouter();
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("landing");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-sm border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <button onClick={() => navigate(isLoggedIn ? "discover" : "landing")} className="flex-shrink-0">
          <Logo className="h-8 w-auto" />
        </button>

        {/* Desktop Nav */}
        {isLoggedIn && (
          <nav className="hidden lg:flex items-center gap-1 ml-4 min-w-0 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  page === link.page
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-brown-600 hover:bg-cream-100 hover:text-brown-800"
                }`}
              >
                {link.icon}
                {link.label}
                {link.label === "AI" && (
                  <span className="px-1.5 py-0.5 bg-yellow-400 text-brown-800 text-[9px] font-bold rounded-full uppercase tracking-wide">
                    New
                  </span>
                )}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => navigate("admin")}
                className={`flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  page === "admin" ? "bg-orange-500/10 text-orange-500" : "text-brown-600 hover:bg-cream-100"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Admin
              </button>
            )}
          </nav>
        )}

        <div className="flex-1" />

        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <NotifBell count={notifCount} onClick={() => navigate("notifications")} />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-cream-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center text-sm font-bold">
                  {user?.name[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-brown-700">{user?.name.split(" ")[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brown-400">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-warm-white rounded-2xl shadow-lg border border-cream-200 py-2 animate-fade-up z-50">
                  <button onClick={() => { navigate("discover"); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-50 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                    Home
                  </button>
                  <button onClick={() => { navigate("my-posts"); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-50 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    My Posts
                  </button>
                  <button onClick={() => { navigate("favorites"); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-50 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    Favorites
                  </button>
                  <button onClick={() => { navigate("profile"); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-50 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Profile
                  </button>
                  <div className="h-px bg-cream-200 my-1 mx-3" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-cream-50 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("login")} className="px-4 py-2 text-sm font-semibold text-brown-700 hover:text-brown-900 transition-colors">
              Sign in
            </button>
            <button onClick={() => navigate("register")} className="px-4 py-2 bg-brown-800 text-warm-white text-sm font-semibold rounded-xl hover:bg-brown-900 transition-colors">
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

const MOBILE_NAV: { label: string; page: Page; icon: (active: boolean) => React.ReactNode }[] = [
  {
    label: "Home",
    page: "discover",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Browse",
    page: "browse",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "Create",
    page: "create-post",
    icon: (_active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Messages",
    page: "messages",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    page: "profile",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav({ notifCount = 0 }: { notifCount?: number }) {
  const { navigate, page } = useRouter();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-warm-white/95 backdrop-blur-sm border-t border-cream-200 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_NAV.map((item) => {
          const active = page === item.page;
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all ${
                item.page === "create-post"
                  ? "bg-orange-500 text-white -mt-5 shadow-lg shadow-orange-500/30 px-4 py-3"
                  : active
                  ? "text-orange-500"
                  : "text-brown-400"
              }`}
              aria-label={item.label}
            >
              <span className="relative">
                {item.icon(active)}
                {item.page === "messages" && notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white" />
                )}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Page Layout ──────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
  notifCount?: number;
  showBottomNav?: boolean;
  maxWidth?: string;
  noPad?: boolean;
}

export function Layout({ children, notifCount = 0, showBottomNav = true, maxWidth = "max-w-7xl", noPad = false }: LayoutProps) {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-full flex flex-col">
      <Header notifCount={notifCount} />
      <main className={`flex-1 ${noPad ? "" : `${maxWidth} mx-auto w-full px-4 sm:px-6 py-6`}`}>
        {children}
      </main>
      {isLoggedIn && showBottomNav && <BottomNav notifCount={notifCount} />}
      {isLoggedIn && <div className="h-16 lg:hidden" />}
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────

export function BackButton({ label = "Back" }: { label?: string }) {
  const { back } = useRouter();
  return (
    <button onClick={back} className="flex items-center gap-2 text-sm font-semibold text-brown-500 hover:text-brown-800 transition-colors mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
      {label}
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-brown-800">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-brown-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
