import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Tabs, SearchBar, SkeletonCard } from "../components/ui";
import { PostCard, PostCardSkeleton } from "../components/PostCard";
import { EmptyState } from "../components/EmptyState";
import { DoodleStar, DoodleSpark } from "../components/Doodles";
import { api } from "../api";
import type { Post } from "../types";

function GreetingBanner({ name }: { name: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brown-800 to-brown-900 rounded-3xl px-6 py-8 mb-8">
      <div className="absolute top-3 right-6 animate-wiggle opacity-60">
        <DoodleStar size={28} color="#e8b84b" />
      </div>
      <div className="absolute bottom-3 left-40 opacity-30">
        <DoodleSpark size={20} color="#e8b84b" />
      </div>
      <p className="text-brown-300 text-sm font-medium">{greeting}, {name.split(" ")[0]}!</p>
      <h1 className="font-display text-3xl font-semibold text-warm-white mt-1 mb-2">
        What are you looking for today?
      </h1>
      <p className="text-brown-400 text-sm">Browse posts, create a listing, or see your AI matches.</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick, highlight }: { icon: React.ReactNode; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95 ${
        highlight
          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
          : "bg-warm-white border border-cream-200 text-brown-700 hover:border-orange-200"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? "bg-orange-600" : "bg-cream-100"}`}>
        {icon}
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

export default function Discover() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "sell" | "buy">("all");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeTab !== "all") params.type = activeTab;
    if (search) params.search = search;

    api.posts.getAll(params).then((res) => {
      setPosts(res.posts.filter((p) => p.status === "active"));
    }).catch(() => setPosts([])).finally(() => setLoading(false));
  }, [activeTab, search]);

  // Load featured posts from real API
  useEffect(() => {
    setFeaturedLoading(true);
    api.posts.getAll({ status: "active", sort: "newest", limit: "4" }).then((res) => {
      setFeaturedPosts(res.posts.slice(0, 4));
    }).catch(() => setFeaturedPosts([])).finally(() => setFeaturedLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {user && <GreetingBanner name={user.name} />}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <QuickAction
          highlight
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>}
          label="Post"
          onClick={() => navigate("create-post")}
        />
        <QuickAction
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
          label="Matches"
          onClick={() => navigate("matches")}
        />
        <QuickAction
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
          label="Favorites"
          onClick={() => navigate("favorites")}
        />
        <QuickAction
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M12 21v-1m-4.95-1.05l-.707.707M17.657 17.657l.707.707" /></svg>}
          label="AI Ideas"
          onClick={() => navigate("ai")}
        />
      </div>

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search materials, products, or things you need..."
        className="mb-6"
      />

      {/* Featured Section */}
      {!search && activeTab === "all" && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-brown-800">
              People are giving these things a second life
            </h2>
            <button onClick={() => navigate("browse")} className="text-sm text-orange-500 font-semibold hover:underline">
              See all →
            </button>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : null}
        </section>
      )}

      {/* Tabs + Posts grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-brown-800">Discover</h2>
        </div>

        <Tabs
          tabs={[
            { key: "all", label: "All posts" },
            { key: "sell", label: "Selling" },
            { key: "buy", label: "Looking for" },
          ]}
          active={activeTab}
          onChange={(k) => setActiveTab(k as typeof activeTab)}
          className="mb-6"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            illustration="search"
            title={search ? `No results for "${search}"` : "Nothing here yet"}
            description={search ? "Try different keywords or clear the search." : "Be the first to post something!"}
            action={search ? { label: "Clear search", onClick: () => setSearch("") } : { label: "Create a post", onClick: () => navigate("create-post") }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}