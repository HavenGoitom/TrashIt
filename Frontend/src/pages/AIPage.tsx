import { useState } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Button, DifficultyBadge, useToast } from "../components/ui";
import { AILoadingChar, DoodleSpark, DoodleStar, DoodleLeaf, DoodleRecycle } from "../components/Doodles";
import { api } from "../api";
import type { AIIdea } from "../types";

const MATERIAL_SUGGESTIONS = [
  "Plastic bottles",
  "Old tires",
  "Cardboard boxes",
  "Wine bottles",
  "Old clothes",
  "Glass jars",
  "Tin cans",
  "Wood scraps",
  "Old newspapers",
  "CD/DVDs",
];

function IdeaCard({ idea, index }: { idea: AIIdea; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const difficultyIcons = {
    easy: "🌱",
    medium: "🔧",
    hard: "⭐",
  };

  return (
    <div
      className="bg-warm-white rounded-2xl border border-cream-200 overflow-hidden animate-fade-up card-hover"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Card header */}
      <div className={`px-5 py-4 border-b border-cream-100 ${index % 3 === 0 ? "bg-orange-500/5" : index % 3 === 1 ? "bg-yellow-400/10" : "bg-olive-500/5"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{difficultyIcons[idea.difficulty]}</span>
            <h3 className="font-display font-semibold text-brown-800 text-lg leading-snug">{idea.title}</h3>
          </div>
          <DifficultyBadge level={idea.difficulty} />
        </div>
      </div>

      {/* Description */}
      <div className="p-5">
        <p className="text-sm text-brown-500 leading-relaxed mb-4">{idea.description}</p>

        {/* Steps toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          {expanded ? "Hide" : "Show"} {idea.steps.length} steps
        </button>

        {expanded && (
          <div className="mt-4 space-y-2.5 animate-fade-up">
            {idea.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-brown-600 leading-snug">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState({ material }: { material: string }) {
  return (
    <div className="flex flex-col items-center py-12 animate-fade-in">
      <div className="w-40 h-44 mb-6">
        <AILoadingChar className="w-full h-full" />
      </div>
      <p className="font-display text-xl font-semibold text-brown-800 mb-2">
        Thinking about {material}...
      </p>
      <p className="text-sm text-brown-400 text-center max-w-xs">
        Our AI is coming up with creative ideas for what you could make. This takes just a moment.
      </p>
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce-gentle`} style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  );
}

export default function AIPage() {
  const { isLoggedIn, token } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const { navigate: routerNavigate } = useRouter();

  const [material, setMaterial] = useState("");
  const [ideas, setIdeas] = useState<AIIdea[] | null>(null);
  const [resultMaterial, setResultMaterial] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!material.trim()) return;
    if (!isLoggedIn) { routerNavigate("login"); return; }
    if (!token) return;
    if (material.trim().length > 100) {
      showToast("Material name too long (max 100 characters)", "error");
      return;
    }

    setLoading(true);
    setIdeas(null);
    try {
      const res = await api.ai.whatCouldIMake(material.trim(), token);
      setIdeas(res.ideas);
      setResultMaterial(res.material);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "AI is unavailable right now", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {ToastComponent}

      {/* Page header */}
      <div className="relative bg-gradient-to-br from-brown-800 to-brown-900 rounded-3xl p-8 mb-8 overflow-hidden">
        <div className="absolute top-4 right-8 animate-spin-slow opacity-30">
          <DoodleRecycle size={48} color="#e8b84b" />
        </div>
        <div className="absolute bottom-4 left-6 animate-wiggle opacity-20">
          <DoodleLeaf size={32} color="#5a7a4a" />
        </div>
        <div className="absolute top-4 left-6 animate-float opacity-30">
          <DoodleStar size={24} color="#e8b84b" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <DoodleSpark size={20} color="#e8b84b" className="animate-wiggle" />
            <span className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">AI Feature</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-warm-white mb-3">
            What could I make?
          </h1>
          <p className="text-brown-300 leading-relaxed max-w-xl">
            Have a material you don&apos;t know what to do with? Tell us what you have and our AI will suggest creative ways to reuse, repurpose, or upcycle it — with step-by-step instructions.
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-warm-white rounded-2xl border border-cream-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-brown-700 mb-2">
          What do you have?
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. wine bottles, old tires, cardboard boxes..."
            className="flex-1 bg-cream-50 border-2 border-cream-200 rounded-2xl px-4 py-3 text-sm text-brown-800 placeholder:text-brown-300 focus:outline-none focus:border-orange-400 transition-colors"
            disabled={loading}
          />
          <Button
            variant="secondary"
            size="lg"
            onClick={generate}
            loading={loading}
            disabled={!material.trim()}
            className="flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            Get ideas
          </Button>
        </div>

        {/* Suggestions */}
        {!ideas && !loading && (
          <div className="mt-4">
            <p className="text-xs text-brown-400 mb-2 font-medium">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setMaterial(s)}
                  className="px-3 py-1.5 bg-cream-100 text-brown-600 text-xs font-semibold rounded-full hover:bg-orange-500/10 hover:text-orange-600 transition-colors border border-cream-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && <LoadingState material={material} />}

      {/* Results */}
      {!loading && ideas && (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-brown-800">
                Ideas for &quot;{resultMaterial}&quot;
              </h2>
              <p className="text-sm text-brown-400 mt-1">{ideas.length} creative ideas from TrashIt AI</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setIdeas(null); setMaterial(""); }}
            >
              Try another
            </Button>
          </div>

          <div className="grid gap-4">
            {ideas.map((idea, i) => (
              <IdeaCard key={i} idea={idea} index={i} />
            ))}
          </div>

          {/* CTA after ideas */}
          <div className="mt-8 bg-gradient-to-br from-yellow-400/15 to-orange-500/10 rounded-2xl p-6 border border-yellow-400/20 text-center">
            <p className="font-semibold text-brown-800 mb-2">
              Have the materials but not the tools?
            </p>
            <p className="text-sm text-brown-500 mb-4">Post a BUY request and the community might have exactly what you need.</p>
            <Button variant="secondary" size="sm" onClick={() => routerNavigate("create-post")}>
              Post a request
            </Button>
          </div>
        </div>
      )}

      {/* Empty / intro state */}
      {!loading && !ideas && (
        <div className="text-center py-8 opacity-60">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center animate-float">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b89672" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
            </div>
            <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center animate-float delay-200">
              <DoodleStar size={20} color="#e8b84b" />
            </div>
            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center animate-float delay-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b89672" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
          </div>
          <p className="text-brown-400 text-sm max-w-xs mx-auto">
            Enter any material above and discover creative ways to give it a second life.
          </p>
        </div>
      )}
    </div>
  );
}
