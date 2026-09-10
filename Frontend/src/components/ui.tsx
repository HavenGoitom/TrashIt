import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, useState } from "react";

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 select-none cursor-pointer";

    const variants = {
      primary: "bg-brown-800 text-warm-white hover:bg-brown-900 active:scale-[0.97] shadow-sm",
      secondary: "bg-orange-500 text-warm-white hover:bg-orange-600 active:scale-[0.97] shadow-sm",
      ghost: "bg-transparent text-brown-700 hover:bg-cream-100 active:scale-[0.97]",
      danger: "bg-red-400 text-warm-white hover:bg-red-400/80 active:scale-[0.97]",
      outline: "border-2 border-brown-200 text-brown-700 hover:border-brown-300 hover:bg-cream-50 active:scale-[0.97]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-brown-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-warm-white border-2 ${error ? "border-red-400" : "border-cream-200"} rounded-xl px-4 py-2.5 text-sm text-brown-800 placeholder:text-brown-300 focus:outline-none focus:border-orange-400 transition-colors ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""} ${className}`}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-400">{rightIcon}</span>}
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-brown-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-brown-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full bg-warm-white border-2 ${error ? "border-red-400" : "border-cream-200"} rounded-xl px-4 py-2.5 text-sm text-brown-800 placeholder:text-brown-300 focus:outline-none focus:border-orange-400 transition-colors resize-none ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-brown-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-brown-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`w-full bg-warm-white border-2 ${error ? "border-red-400" : "border-cream-200"} rounded-xl px-4 py-2.5 text-sm text-brown-800 focus:outline-none focus:border-orange-400 transition-colors appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant?: "sell" | "buy" | "active" | "sold" | "closed" | "custom";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "custom", children, className = "" }: BadgeProps) {
  const base = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
  const variants = {
    sell: "badge-sell",
    buy: "badge-buy",
    active: "badge-active",
    sold: "badge-sold",
    closed: "badge-closed",
    custom: "",
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const AVATAR_COLORS = [
  "bg-orange-400 text-warm-white",
  "bg-yellow-400 text-brown-800",
  "bg-olive-500 text-warm-white",
  "bg-brown-500 text-warm-white",
  "bg-brown-300 text-brown-800",
];

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIdx];

  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brown-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-warm-white rounded-2xl shadow-xl w-full ${maxWidth} animate-fade-up`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
            <h2 className="font-display text-lg font-semibold text-brown-800">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors text-brown-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`animate-spin text-orange-500 ${className}`} width={size} height={size} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── PriceDisplay ─────────────────────────────────────────────────────────────

interface PriceDisplayProps {
  price: { fixed?: number; min?: number; max?: number };
  className?: string;
}

export function PriceDisplay({ price, className = "" }: PriceDisplayProps) {
  if (price.fixed !== undefined) {
    return <span className={className}>{price.fixed.toLocaleString()} birr</span>;
  }
  if (price.min !== undefined && price.max !== undefined) {
    return <span className={className}>{price.min.toLocaleString()} – {price.max.toLocaleString()} birr</span>;
  }
  return <span className={className}>Negotiable</span>;
}

// ─── QuantityDisplay ──────────────────────────────────────────────────────────

interface QuantityDisplayProps {
  quantity: { fixed?: number; min?: number; max?: number };
  className?: string;
}

export function QuantityDisplay({ quantity, className = "" }: QuantityDisplayProps) {
  if (quantity.fixed !== undefined) {
    return <span className={className}>Qty: {quantity.fixed}</span>;
  }
  if (quantity.min !== undefined && quantity.max !== undefined) {
    return <span className={className}>Qty: {quantity.min}–{quantity.max}</span>;
  }
  return <span className={className}>Qty: —</span>;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const colors = {
    success: "bg-olive-500 text-warm-white",
    error: "bg-red-400 text-warm-white",
    info: "bg-brown-800 text-warm-white",
  };

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg ${colors[type]} animate-fade-up max-w-sm`}>
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── useToast ─────────────────────────────────────────────────────────────────

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, ToastComponent };
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="bg-warm-white rounded-2xl overflow-hidden border border-cream-200">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="flex justify-between mt-2">
          <div className="skeleton h-6 w-20 rounded-lg" />
          <div className="skeleton h-6 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface TabsProps {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex gap-1 bg-cream-100 p-1 rounded-xl ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            active === tab.key
              ? "bg-warm-white text-brown-800 shadow-sm"
              : "text-brown-500 hover:text-brown-700"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${active === tab.key ? "bg-orange-500 text-white" : "bg-cream-200 text-brown-500"}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, onSubmit, placeholder = "Search...", className = "" }: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
      className={`relative ${className}`}
    >
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-warm-white border-2 border-cream-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-brown-800 placeholder:text-brown-300 focus:outline-none focus:border-orange-400 transition-colors shadow-sm"
      />
    </form>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────

export function DifficultyBadge({ level }: { level: "easy" | "medium" | "hard" }) {
  const styles = {
    easy: "bg-olive-500/15 text-olive-600 border border-olive-500/30",
    medium: "bg-yellow-400/20 text-yellow-500 border border-yellow-400/40",
    hard: "bg-orange-500/15 text-orange-600 border border-orange-500/30",
  };
  const labels = { easy: "Easy", medium: "Medium", hard: "Challenging" };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}
