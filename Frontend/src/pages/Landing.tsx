import { useState, useEffect } from "react";
import { useRouter } from "../context";
import { HeroIllustration, DoodleStar, DoodleLeaf, DoodleRecycle, DoodleSpark, DoodleClusterLeft, DoodleClusterRight } from "../components/Doodles";
import { api } from "../api";
import { PriceDisplay, Badge } from "../components/ui";
import type { Post } from "../types";

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-warm-white rounded-2xl p-6 border border-cream-200 hover:border-orange-200 transition-colors group">
      <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
        <div className="text-orange-500">{icon}</div>
      </div>
      <h3 className="font-semibold text-brown-800 mb-2">{title}</h3>
      <p className="text-sm text-brown-400 leading-relaxed">{description}</p>
    </div>
  );
}

function MiniPostCard({ post }: { post: Post }) {
  const { navigate } = useRouter();
  return (
    <div
      className="bg-warm-white rounded-2xl overflow-hidden border border-cream-200 w-full sm:w-64 sm:flex-shrink-0 cursor-pointer hover:border-orange-200 transition-colors"
      onClick={() => navigate("post-detail", { postId: post._id })}
    >
      <div className="h-36 relative overflow-hidden bg-cream-100">
        {post.images?.[0] && <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />}
        <div className="absolute top-2 left-2">
          <Badge variant={post.type}>{post.type === "sell" ? "Sell" : "Buy"}</Badge>
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-brown-800 text-sm line-clamp-1 break-words">{post.title}</p>
        <PriceDisplay price={post.price} className="text-sm font-bold text-orange-500 mt-1" />
      </div>
    </div>
  );
}

// Placeholder shown while the preview posts are loading so the section never
// collapses to an empty gap.
function MiniPostSkeleton() {
  return (
    <div className="bg-warm-white rounded-2xl overflow-hidden border border-cream-200 w-full sm:w-64 sm:flex-shrink-0">
      <div className="skeleton h-36 w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-4/5 rounded-lg" />
        <div className="skeleton h-4 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export default function Landing() {
  const { navigate } = useRouter();
  const [previewPosts, setPreviewPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.posts.getAll({ status: "active", limit: "6" }).then((res) => {
      setPreviewPosts(res.posts.slice(0, 6));
    }).catch(() => {
      setPreviewPosts([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-full">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-sm border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 120 36" fill="none" className="h-8 w-auto">
              <g transform="translate(0, 4)">
                <path d="M14 4L9 13h3l-3 6h12l-3-6h3z" fill="#c4622d" />
                <path d="M7 19l-3 5 4 1M21 19l3 5-4 1" stroke="#c4622d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 25c1 1 5 2 5 2M19 25c-1 1-5 2-5 2" stroke="#c4622d" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              <text x="34" y="26" fontSize="20" fontWeight="700" fill="#1a1009" fontFamily="Fraunces, Georgia, serif" letterSpacing="-0.5">TrashIt</text>
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("login")} className="px-4 py-2 text-sm font-semibold text-brown-600 hover:text-brown-800 transition-colors">
              Sign in
            </button>
            <button onClick={() => navigate("register")} className="px-5 py-2.5 bg-brown-800 text-warm-white text-sm font-semibold rounded-xl hover:bg-brown-900 transition-colors shadow-sm">
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cream-50">
        {/* Decorative doodle clusters */}
        <DoodleClusterLeft className="absolute left-0 top-0 h-full w-28 opacity-60 hidden lg:block" />
        <DoodleClusterRight className="absolute right-0 top-0 h-full w-28 opacity-60 hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div className="relative">
              {/* Floating doodle near headline */}
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1.5 bg-yellow-400/20 text-brown-700 text-sm font-semibold rounded-full border border-yellow-400/30">
                  🌱 Reuse. Reduce. Reinvent.
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-brown-900 leading-tight mb-6">
                Give old things
                <br />
                <span className="text-orange-500 relative">
                  a new life.
                  {/* Underline doodle */}
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" height="12">
                    <path d="M3 8c40-6 80-7 120-5s70 4 74 0" stroke="#c4622d" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-brown-500 leading-relaxed mb-8 max-w-lg">
                TrashIt is a marketplace where people buy, sell, and discover possibilities in materials that others no longer need. Turn someone's trash into your treasure.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("browse")}
                  className="px-8 py-4 bg-brown-800 text-warm-white font-semibold rounded-xl hover:bg-brown-900 active:scale-[0.97] transition-all shadow-sm text-base"
                >
                  Explore TrashIt
                </button>
                <button
                  onClick={() => navigate("register")}
                  className="px-8 py-4 border-2 border-brown-200 text-brown-700 font-semibold rounded-xl hover:border-orange-400 hover:text-orange-500 active:scale-[0.97] transition-all text-base"
                >
                  Create a post
                </button>
              </div>

            </div>

            {/* Illustration */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Circular background */}
                <div className="absolute inset-0 m-auto w-72 h-72 bg-yellow-400/15 rounded-full blur-3xl" />
                <HeroIllustration className="relative w-full h-auto animate-float" />

                {/* Floating tags */}
                <div className="absolute top-8 -left-4 bg-warm-white rounded-2xl px-3 py-2 shadow-md border border-cream-200 flex items-center gap-2 animate-float-reverse">
                  <DoodleRecycle size={20} color="#c4622d" />
                  <span className="text-xs font-semibold text-brown-700">Upcycle it!</span>
                </div>
                <div className="absolute bottom-16 -right-4 bg-warm-white rounded-2xl px-3 py-2 shadow-md border border-cream-200 flex items-center gap-2 animate-float">
                  <DoodleLeaf size={18} color="#5a7a4a" />
                  <span className="text-xs font-semibold text-olive-600">Save the planet</span>
                </div>
                <div className="absolute top-1/3 -right-8 bg-yellow-400 rounded-2xl px-3 py-2 shadow-md flex items-center gap-2 animate-wiggle">
                  <DoodleStar size={16} color="#1a1009" />
                  <span className="text-xs font-bold text-brown-800">AI Match!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <DoodleSpark size={20} color="#c4622d" />
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-widest">What you can do</span>
            <DoodleSpark size={20} color="#c4622d" />
          </div>
          <h2 className="font-display text-4xl font-semibold text-brown-900">Everything you need to reuse</h2>
          <p className="mt-3 text-brown-400 max-w-xl mx-auto">A complete platform built around giving materials another chance.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>}
            title="Buy & Sell Freely"
            description="Post what you have or what you need. Every user can both buy and sell — no separate accounts."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
            title="AI-Powered Matches"
            description="Our AI automatically connects BUY and SELL posts when they match — you get notified instantly."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            title="What Could I Make?"
            description="Tell our AI what material you have. Get creative upcycling ideas with step-by-step instructions."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
            title="Direct Messaging"
            description="Reach out to sellers and buyers directly with real-time chat. No middlemen, no fees."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
            title="Save Favorites"
            description="Bookmark posts you love and come back to them whenever you're ready."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
            title="Safe Community"
            description="Report problematic posts or users. Our moderation team keeps TrashIt a trustworthy space."
          />
        </div>
      </section>

      {/* Preview Posts */}
      <section className="py-16 dark-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-warm-white">
                People are giving these things a second life
              </h2>
              <p className="mt-2 text-brown-300">Fresh posts from the TrashIt community</p>
            </div>
            <button
              onClick={() => navigate("register")}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 border-2 border-cream-300/30 text-cream-200 text-sm font-semibold rounded-xl hover:bg-cream-50/10 transition-colors"
            >
              See all posts
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:flex sm:gap-4 sm:overflow-x-auto sm:pb-4" style={{ scrollbarWidth: "none" }}>
              {Array.from({ length: 4 }).map((_, i) => <MiniPostSkeleton key={i} />)}
            </div>
          ) : previewPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:flex sm:gap-4 sm:overflow-x-auto sm:pb-4" style={{ scrollbarWidth: "none" }}>
              {previewPosts.map((post) => (
                <MiniPostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-brown-300 text-sm">No posts yet — be the first to give something a second life.</p>
          )}
        </div>
      </section>

      {/* AI Feature Callout */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-brown-800 to-brown-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-4 right-8 opacity-30">
            <DoodleStar size={40} color="#e8b84b" className="animate-spin-slow" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-20">
            <DoodleRecycle size={60} color="#e8b84b" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400/20 text-yellow-300 text-sm font-semibold rounded-full mb-4 border border-yellow-400/20">
                <DoodleSpark size={14} color="currentColor" className="animate-wiggle" />
                AI-Powered
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-warm-white mb-4">
                What could I make with this?
              </h2>
              <p className="text-brown-300 leading-relaxed mb-6">
                Have old wine bottles? Cardboard boxes? Bicycle tires? Tell TrashIt what you have and get creative upcycling ideas with step-by-step instructions — powered by AI.
              </p>
              <button
                onClick={() => navigate("register")}
                className="px-6 py-3 bg-yellow-400 text-brown-900 font-semibold rounded-xl hover:bg-yellow-300 active:scale-[0.97] transition-all"
              >
                Try it now →
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {["Plastic bottles", "Old tires", "Cardboard boxes", "Wine bottles", "Old clothes", "Glass jars"].map((m) => (
                <span
                  key={m}
                  onClick={() => navigate("register")}
                  className="px-4 py-2.5 bg-warm-white/10 text-cream-200 text-sm font-medium rounded-xl border border-cream-200/20 hover:bg-warm-white/20 cursor-pointer transition-colors"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cream-100 border-t border-cream-200">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <DoodleRecycle size={64} color="#c4622d" className="animate-spin-slow" />
              <DoodleStar size={20} color="#e8b84b" className="absolute -top-2 -right-2 animate-wiggle" />
            </div>
          </div>
          <h2 className="font-display text-4xl font-semibold text-brown-900 mb-4">
            Ready to give trash another chance?
          </h2>
          <p className="text-brown-400 leading-relaxed mb-8">
            Join the TrashIt community and be part of a movement that turns unwanted materials into something useful, beautiful, or meaningful.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("register")}
              className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.97] transition-all shadow-sm text-base"
            >
              Join TrashIt — it&apos;s free
            </button>
            <button
              onClick={() => navigate("browse")}
              className="px-8 py-4 border-2 border-brown-200 text-brown-700 font-semibold rounded-xl hover:border-brown-300 active:scale-[0.97] transition-all text-base"
            >
              Browse posts first
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown-900 text-cream-300 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DoodleRecycle size={20} color="#c4622d" />
          <span className="font-display text-lg font-semibold text-warm-white">TrashIt</span>
        </div>
        <p className="text-sm opacity-60">Turn unwanted things into useful things. © 2026 TrashIt</p>
      </footer>
    </div>
  );
}
