import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Button, Tabs, Badge, PriceDisplay } from "../components/ui";
import { EmptyState } from "../components/EmptyState";
import { api } from "../api";
import type { Post } from "../types";

function PostRow({ post, onStatusChange, onDelete }: { post: Post; onStatusChange: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const { navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-warm-white rounded-2xl border border-cream-200 flex gap-4 p-4 hover:border-orange-200 transition-colors">
      {/* Thumbnail */}
      <div className="w-20 h-20 flex-shrink-0 bg-cream-100 rounded-xl overflow-hidden">
        {post.images[0] ? (
          <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brown-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={post.type}>{post.type === "sell" ? "Sell" : "Buy"}</Badge>
              <Badge variant={post.status}>{post.status}</Badge>
            </div>
            <h3
              className="font-semibold text-brown-800 text-sm leading-snug cursor-pointer hover:text-orange-500 transition-colors line-clamp-1"
              onClick={() => navigate("post-detail", { postId: post._id })}
            >
              {post.title}
            </h3>
          </div>

          {/* Actions menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-cream-100 text-brown-400 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-warm-white rounded-xl border border-cream-200 shadow-lg py-1 w-44 z-10">
                <button onClick={() => { navigate("post-detail", { postId: post._id }); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-50 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  View post
                </button>
                <button onClick={() => { navigate("edit-post", { postId: post._id }); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-50 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Edit
                </button>
                {post.status === "active" && (
                  <button onClick={() => { onStatusChange(post._id, "sold"); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-50 flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Mark as sold
                  </button>
                )}
                <div className="h-px bg-cream-200 mx-2 my-1" />
                <button onClick={() => { onDelete(post._id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-cream-50 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-brown-400">
          <PriceDisplay price={post.price} className="font-semibold text-brown-600" />
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString("en-ET", { month: "short", day: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}

export default function MyPosts() {
  const { token } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState("active");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.posts.getAll().then((res) => {
      setPosts(res.posts);
    }).catch(() => setPosts([])).finally(() => setLoading(false));
  }, [token]);

  function handleStatusChange(id: string, status: string) {
    setPosts(ps => ps.map(p => p._id === id ? { ...p, status: status as Post["status"] } : p));
    if (token) api.posts.updateStatus(id, status, token).catch(() => {});
  }

  function handleDelete(id: string) {
    setPosts(ps => ps.filter(p => p._id !== id));
    if (token) api.posts.delete(id, token).catch(() => {});
  }

  const filtered = posts.filter(p => p.status === tab);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-brown-900">My Posts</h1>
          <p className="text-brown-400 text-sm mt-1">Manage your listings</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("create-post")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          New post
        </Button>
      </div>

      <Tabs
        tabs={[
          { key: "active", label: "Active", count: posts.filter(p => p.status === "active").length },
          { key: "sold", label: "Sold", count: posts.filter(p => p.status === "sold").length },
          { key: "closed", label: "Closed", count: posts.filter(p => p.status === "closed").length },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-6"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-warm-white rounded-2xl border border-cream-200 flex gap-4 p-4">
              <div className="skeleton w-20 h-20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-16 rounded-full" />
                <div className="skeleton h-4 w-3/4 rounded-lg" />
                <div className="skeleton h-3 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="box"
          title={tab === "active" ? "No active posts" : tab === "sold" ? "Nothing sold yet" : "No closed posts"}
          description={tab === "active" ? "Create your first post and start exchanging materials." : "Items you mark as sold or close will appear here."}
          action={tab === "active" ? { label: "Create a post", onClick: () => navigate("create-post") } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <PostRow key={post._id} post={post} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}