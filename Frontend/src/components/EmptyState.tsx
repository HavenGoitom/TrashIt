import { ReactNode } from "react";
import { Button } from "./ui";
import { EmptyBoxChar, EmptySearchChar } from "./Doodles";

interface EmptyStateProps {
  illustration?: "box" | "search" | "custom";
  customIllustration?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "ghost" | "outline";
  };
  className?: string;
}

export function EmptyState({
  illustration = "box",
  customIllustration,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center py-16 px-8 ${className}`}>
      <div className="w-40 h-40 mb-4 opacity-90">
        {customIllustration ? (
          customIllustration
        ) : illustration === "search" ? (
          <EmptySearchChar className="w-full h-full" />
        ) : (
          <EmptyBoxChar className="w-full h-full" />
        )}
      </div>

      <h3 className="font-display text-xl font-semibold text-brown-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-brown-400 max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {!description && action && <div className="mb-6" />}

      {action && (
        <Button variant={action.variant ?? "secondary"} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Inline empty for sections ────────────────────────────────────────────────

export function EmptySection({ message }: { message: string }) {
  return (
    <div className="py-12 text-center">
      <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b89672" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-brown-400">{message}</p>
    </div>
  );
}
