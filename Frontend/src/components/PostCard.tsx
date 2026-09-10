import { useState } from "react";
import type { Post } from "../types";
import { Badge, PriceDisplay, QuantityDisplay } from "./ui";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { api } from "../api";

interface PostCardProps {
  post: Post;
  onFavoriteChange?: () => void;
  initialFavorited?: boolean;
  className?: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ET", { month: "short", day: "numeric" });
}

// Small decorative doodles per post type
function PostDoodle({ type }: { type: "sell" | "buy" }) {
  if (type === "sell") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="absolute top-2 left-2 opacity-70">
        <path d="M14 3l1.8 5.4 5.7.7-4.1 3.9 1.1 5.6L14 16l-4.5 2.6 1.1-5.6L6.5 9l5.7-.7z" fill="#e8b84b" stroke="#e8b84b" strokeWidth="0.5" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="absolute top-2 left-2 opacity-70">
      <circle cx="12" cy="12" r="8" stroke="#93c5fd" strokeWidth="2" fill="none" />
      <path d="M18 18l5 5" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PostCard({ post, onFavoriteChange, initialFavorited = false, className = "" }: PostCardProps) {
  const { isLoggedIn, token } = useAuth();
  const { navigate } = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isLoggedIn || !token) {
      navigate("login");
      return;
    }
    setFavLoading(true);
    try {
      if (favorited) {
        await api.favorites.remove(post._id, token);
      } else {
        await api.favorites.add(post._id, token);
        setHeartAnim(true);
        setTimeout(() => setHeartAnim(false), 400);
      }
      setFavorited(!favorited);
      onFavoriteChange?.();
    } catch {
      // silently handle
    } finally {
      setFavLoading(false);
    }
  }

  const hasImage = post.images.length > 0;

  return (
    <div
      onClick={() => navigate("post-detail", { postId: post._id })}
      className={`bg-warm-white rounded-2xl overflow-hidden border border-cream-200 cursor-pointer card-hover group ${className}`}
    >
      {/* Image area */}
      <div className="relative h-44 bg-cream-100 overflow-hidden">
        {hasImage ? (
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream-100 to-cream-200">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
              <rect x="8" y="16" width="32" height="24" rx="4" stroke="#b89672" strokeWidth="2" />
              <path d="M8 22l10-8 8 6 6-4 8 6" stroke="#b89672" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="18" cy="24" r="3" fill="#b89672" />
            </svg>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={post.type}>{post.type === "sell" ? "● Sell" : "○ Buy"}</Badge>
        </div>

        {/* Decorative doodle */}
        <PostDoodle type={post.type} />

        {/* Status badge if not active */}
        {post.status !== "active" && (
          <div className="absolute inset-0 bg-brown-900/40 flex items-center justify-center">
            <Badge variant={post.status} className="text-sm">
              {post.status === "sold" ? "Sold" : "Closed"}
            </Badge>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            favorited
              ? "bg-red-400 text-white shadow-sm"
              : "bg-warm-white/90 text-brown-400 hover:text-red-400 shadow-sm backdrop-blur-sm"
          } ${heartAnim ? "animate-heart-pop" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-brown-800 text-sm leading-snug line-clamp-1 mb-1">{post.title}</h3>
        <p className="text-xs text-brown-400 line-clamp-2 mb-3 leading-relaxed">{post.description}</p>

        {/* Price & Quantity row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <PriceDisplay
            price={post.price}
            className="text-sm font-bold text-brown-800"
          />
          <QuantityDisplay
            quantity={post.quantity}
            className="text-xs text-brown-400 bg-cream-100 px-2 py-1 rounded-lg"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-cream-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-400/20 text-orange-600 flex items-center justify-center text-[10px] font-bold">
              {post.user.name[0]}
            </div>
            <span className="text-xs text-brown-400 font-medium">{post.user.username}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brown-300">
            {post.location && (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{post.location}</span>
                <span>·</span>
              </>
            )}
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PostCardSkeleton() {
  return (
    <div className="bg-warm-white rounded-2xl overflow-hidden border border-cream-200">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-14 rounded-full" />
        <div className="skeleton h-4 w-4/5 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-3/5 rounded-lg" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-5 w-24 rounded-lg" />
          <div className="skeleton h-5 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
