import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Button, Badge, PriceDisplay } from "../components/ui";
import { EmptyState } from "../components/EmptyState";
import { DoodleStar, DoodleRecycle } from "../components/Doodles";
import { api } from "../api";
import type { Match, Post } from "../types";

function MatchPostBox({ post, label }: { post: Post; label: string }) {
  const { navigate } = useRouter();
  return (
    <div
      className="flex-1 bg-warm-white rounded-2xl border border-cream-200 overflow-hidden cursor-pointer hover:border-orange-200 transition-colors"
      onClick={() => navigate("post-detail", { postId: post._id })}
    >
      {post.images[0] && (
        <img src={post.images[0]} alt={post.title} className="w-full h-28 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brown-400">{label}</span>
          <Badge variant={post.type}>{post.type === "sell" ? "Sell" : "Buy"}</Badge>
        </div>
        <p className="font-semibold text-brown-800 text-sm line-clamp-2 mb-1">{post.title}</p>
        <PriceDisplay price={post.price} className="text-xs font-bold text-orange-500" />
        <p className="text-xs text-brown-400 mt-1">by @{post.user.username}</p>
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const { navigate } = useRouter();
  const { token } = useAuth();

  return (
    <div className="bg-cream-50 border border-cream-200 rounded-3xl p-5 relative overflow-hidden animate-fade-up">
      {/* Sparkle decoration */}
      <div className="absolute top-4 right-4 animate-wiggle opacity-50">
        <DoodleStar size={20} color="#e8b84b" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
          <DoodleStar size={16} color="#d4a030" />
        </div>
        <div>
          <p className="text-sm font-bold text-brown-800">Match found!</p>
          <p className="text-xs text-brown-400">{new Date(match.createdAt).toLocaleDateString("en-ET", { month: "short", day: "numeric" })}</p>
        </div>
      </div>

      {/* The two posts */}
      <div className="flex gap-3 items-center mb-4">
        <MatchPostBox post={match.buyPost} label="Looking for" />

        {/* Connection arrow */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
            <path d="M16 4v40M16 4C10 10 6 14 16 20C26 26 22 30 16 44" stroke="#c4622d" strokeWidth="2" strokeLinecap="round" className="animate-draw" strokeDasharray="100" strokeDashoffset="0" />
            <path d="M10 40l6 6 6-6" stroke="#c4622d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-bold text-orange-500 uppercase">Match</span>
        </div>

        <MatchPostBox post={match.sellPost} label="For sale" />
      </div>

      {/* CTA */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate("post-detail", { postId: match.buyPost._id })}
        >
          View match
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={async () => {
            if (token) {
              await api.conversations.create(match.sellPost._id, token).catch(() => {});
              navigate("messages");
            }
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          Message
        </Button>
      </div>
    </div>
  );
}

export default function Matches() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.ai.getMatches(token).then((res) => {
      setMatches(res.matches);
    }).finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/10 rounded-3xl p-6 mb-8 border border-yellow-400/20 relative overflow-hidden">
        <div className="absolute top-3 right-6 animate-spin-slow opacity-40">
          <DoodleRecycle size={40} color="#c4622d" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-400/30 rounded-2xl flex items-center justify-center">
            <DoodleStar size={20} color="#d4a030" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-brown-900">AI Matches</h1>
            <p className="text-xs text-brown-400">Powered by TrashIt AI</p>
          </div>
        </div>
        <p className="text-sm text-brown-600 leading-relaxed">
          Our AI scans BUY and SELL posts and connects you with people who have exactly what you need — or need exactly what you have.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="skeleton rounded-3xl h-64" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          illustration="box"
          title="No matches yet"
          description="Post your BUY or SELL listings and our AI will automatically find connections for you."
          action={{ label: "Create a post", onClick: () => { } }}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-brown-400 mb-2">{matches.length} match{matches.length !== 1 ? "es" : ""} found</p>
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
