import { useState, useEffect } from "react";
import { useRouter } from "../context";
import { useAuth } from "../context";
import { Button, Badge, PriceDisplay, QuantityDisplay, Modal, Textarea, useToast } from "../components/ui";
import { Avatar } from "../components/ui";
import { BackButton } from "../components/Layout";
import { api } from "../api";
import type { Post } from "../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ET", { year: "numeric", month: "long", day: "numeric" });
}

export default function PostDetail() {
  const { params, navigate } = useRouter();
  const { user, token, isLoggedIn } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const postId = params.postId;
  const isOwner = user && post && user._id === post.user._id;

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    api.posts.getOne(postId).then((res) => {
      setPost(res.post);
    }).catch(() => {
      setPost(null);
    }).finally(() => setLoading(false));

    if (isLoggedIn && token) {
      api.favorites.check(postId, token).then((res) => setFavorited(res.isFavorited)).catch(() => {});
    }
  }, [postId, isLoggedIn, token]);

  async function toggleFav() {
    if (!isLoggedIn || !token) { navigate("login"); return; }
    setFavLoading(true);
    try {
      if (favorited) {
        await api.favorites.remove(postId!, token);
      } else {
        await api.favorites.add(postId!, token);
        setHeartAnim(true);
        setTimeout(() => setHeartAnim(false), 400);
      }
      setFavorited(!favorited);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setFavLoading(false);
    }
  }

  async function startConversation() {
    if (!isLoggedIn || !token) { navigate("login"); return; }
    setMsgLoading(true);
    try {
      const res = await api.conversations.create(postId!, token);
      navigate("messages", { conversationId: res.conversation._id });
      showToast("Conversation started!", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to start conversation", "error");
    } finally {
      setMsgLoading(false);
    }
  }

  async function submitReport() {
    if (!token) return;
    if (!reportReason.trim()) { showToast("Please provide a reason", "error"); return; }
    setReportLoading(true);
    try {
      await api.reports.reportPost(postId!, reportReason, token);
      setReportOpen(false);
      setReportReason("");
      showToast("Report submitted. Thank you for keeping TrashIt safe.", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to submit report", "error");
    } finally {
      setReportLoading(false);
    }
  }

  async function deletePost() {
    if (!token || !post) return;
    try {
      await api.posts.delete(post._id, token);
      navigate("my-posts");
      showToast("Post deleted successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete", "error");
    }
  }

  async function updateStatus(status: string) {
    if (!token || !post) return;
    try {
      await api.posts.updateStatus(post._id, status, token);
      setPost((p) => p ? { ...p, status: status as Post["status"] } : p);
      setStatusMenuOpen(false);
      showToast(`Status updated to "${status}"`, "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update status", "error");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="skeleton h-8 w-24 rounded-xl mb-6" />
        <div className="skeleton h-80 w-full rounded-3xl mb-6" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-48 rounded-lg" />
          <div className="skeleton h-8 w-3/4 rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-2/3 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center py-20">
        <p className="text-brown-400">Post not found.</p>
        <Button variant="ghost" onClick={() => navigate("browse")} className="mt-4">Browse posts</Button>
      </div>
    );
  }

  const images = post.images.length > 0 ? post.images : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {ToastComponent}
      <BackButton />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <div className="relative bg-cream-100 rounded-3xl overflow-hidden aspect-[4/3] mb-3">
            {images.length > 0 ? (
              <img src={images[currentImage]} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b89672" strokeWidth="1.5" opacity="0.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
            {/* Type badge */}
            <div className="absolute top-4 left-4">
              <Badge variant={post.type}>{post.type === "sell" ? "● Selling" : "○ Looking for"}</Badge>
            </div>
            {/* Status overlay */}
            {post.status !== "active" && (
              <div className="absolute inset-0 bg-brown-900/50 flex items-center justify-center">
                <Badge variant={post.status} className="text-base px-4 py-2">{post.status === "sold" ? "Sold" : "Closed"}</Badge>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === currentImage ? "border-orange-500" : "border-cream-200"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Post info */}
        <div className="flex flex-col">
          <div className="flex-1">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-brown-900 mb-3 leading-tight">
              {post.title}
            </h1>
            <p className="text-brown-500 leading-relaxed mb-6">{post.description}</p>

            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-cream-100 rounded-2xl p-4">
                <p className="text-xs text-brown-400 font-medium uppercase tracking-wide mb-1">Price</p>
                <PriceDisplay price={post.price} className="text-xl font-bold text-brown-800" />
              </div>
              <div className="bg-cream-100 rounded-2xl p-4">
                <p className="text-xs text-brown-400 font-medium uppercase tracking-wide mb-1">Quantity</p>
                <QuantityDisplay quantity={post.quantity} className="text-xl font-bold text-brown-800" />
              </div>
            </div>

            {/* Meta */}
            <div className="space-y-3 mb-6">
              {post.location && (
                <div className="flex items-center gap-2 text-sm text-brown-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {post.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-brown-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Posted on {formatDate(post.createdAt)}
              </div>
            </div>

            {/* Poster info */}
            <div className="bg-cream-50 border border-cream-200 rounded-2xl p-4 mb-6">
              <p className="text-xs text-brown-400 font-medium uppercase tracking-wide mb-3">Posted by</p>
              <div className="flex items-center gap-3">
                <Avatar name={post.user.name} size="md" />
                <div>
                  <p className="font-semibold text-brown-800">{post.user.name}</p>
                  <p className="text-xs text-brown-400">@{post.user.username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isOwner ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => navigate("edit-post", { postId: post._id })}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Edit post
                  </Button>
                  <div className="relative">
                    <Button variant="outline" onClick={() => setStatusMenuOpen(!statusMenuOpen)} className="w-full">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      Change status
                    </Button>
                    {statusMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-warm-white rounded-xl border border-cream-200 shadow-lg py-1 w-48 z-10">
                        {["active", "sold", "closed"].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(s)}
                            className={`w-full text-left px-4 py-2.5 text-sm capitalize hover:bg-cream-50 flex items-center gap-2 ${post.status === s ? "text-orange-500 font-semibold" : "text-brown-700"}`}
                          >
                            {post.status === s && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="danger" onClick={() => setDeleteConfirmOpen(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                  Delete post
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={favorited ? "danger" : "outline"}
                    onClick={toggleFav}
                    loading={favLoading}
                    className={heartAnim ? "animate-heart-pop" : ""}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {favorited ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => isLoggedIn ? setReportOpen(true) : navigate("login")}
                    className="text-brown-400"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    Report
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={startConversation}
                  loading={msgLoading}
                  disabled={post.status !== "active"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  Message {post.type === "sell" ? "seller" : "buyer"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report this post">
        <div className="space-y-4">
          <p className="text-sm text-brown-500">
            Help us keep TrashIt safe. Tell us what's wrong with this post.
          </p>
          <Textarea
            label="What's the issue?"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe the problem with this post..."
            rows={4}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setReportOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={submitReport} loading={reportLoading} className="flex-1">Submit report</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Delete post">
        <div className="space-y-4">
          <p className="text-sm text-brown-500">Are you sure you want to delete this post? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={deletePost} className="flex-1">Delete post</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}