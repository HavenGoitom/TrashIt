import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { PostCard } from "../components/PostCard";
import { EmptyState } from "../components/EmptyState";
import { SkeletonCard } from "../components/ui";
import { api } from "../api";
import type { Post } from "../types";

export default function Favorites() {
  const { token } = useAuth();
  const { navigate } = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  function loadFavorites() {
    if (!token) return;
    setLoading(true);
    api.favorites.getAll(token).then((res) => {
      setPosts(res.favorites.map(f => f.post));
    }).finally(() => setLoading(false));
  }

  useEffect(() => { loadFavorites(); }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-brown-900">Favorites</h1>
        <p className="text-brown-400 text-sm mt-1">Posts you&apos;ve saved for later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          illustration="box"
          title="Nothing saved yet"
          description="Browse posts and tap the heart icon to save items you like. They'll all appear here."
          action={{ label: "Explore posts", onClick: () => navigate("browse") }}
        />
      ) : (
        <>
          <p className="text-sm text-brown-400 mb-4">{posts.length} saved {posts.length === 1 ? "post" : "posts"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                initialFavorited={true}
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
