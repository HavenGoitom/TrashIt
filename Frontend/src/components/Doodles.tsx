// Hand-drawn SVG doodle system for TrashIt

interface DoodleProps {
  className?: string;
  size?: number;
  color?: string;
}

export function DoodleStar({ className = "", size = 24, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2.5c-.3 0-.5.2-.6.5L9.7 7.8 4.2 8.6c-.3 0-.5.2-.6.5s0 .5.2.7l3.9 3.7-.9 5.3c-.1.3.1.6.3.7.3.2.6.1.8-.1L12 17l4.8 2.4c.3.1.6.1.8-.1.2-.2.3-.5.3-.7l-.9-5.3 3.9-3.7c.2-.2.3-.5.2-.7-.1-.2-.3-.4-.6-.5l-5.5-.8L12.6 3c-.2-.3-.4-.5-.6-.5z"
        fill={color}
        stroke={color}
        strokeWidth="0.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleHeart({ className = "", size = 24, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleLeaf({ className = "", size = 24, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M17 8C8 10 5.9 16.17 3.82 19.83M17 8L6.78 17C6.78 17 9 11.73 12 9c1.3-1.17 3.34-2.46 5-1z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function DoodleArrow({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M4 16c2-3 6-8 12-8s10 4 10 8M22 10l4 6-4 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleSpiral({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M16 16c0 0 4-1 4-5s-4-5-7-3-5 6-2 10 9 5 13 1 6-11 1-16-13-7-17 0-5 15 3 20"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DoodleSpark({ className = "", size = 24, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleRecycle({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 4L8 18h4v2h8v-2h4L16 4z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M7 20l-3 4 4 1M25 20l3 4-4 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 26c2 2 6 2 6 2M22 26c-2 2-6 2-6 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleBottle({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="13" y="2" width="6" height="4" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M13 6c-2 1-4 3-4 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13c0-4-2-6-4-7" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M12 14h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleBox({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M4 10l12-6 12 6v14l-12 6-12-6V10z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M16 4v22M4 10l12 6 12-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 7l12 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleCloud({ className = "", size = 40, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M10 28a8 8 0 0 1-2-5.5A8.5 8.5 0 0 1 16 14a6 6 0 0 1 11.5 2 6 6 0 0 1 4 5.5A5.5 5.5 0 0 1 26 27.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DoodlePlant({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 28V16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 22c-2-4-8-5-10-4 0 0 2 6 10 4z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M16 18c2-4 8-5 10-4 0 0-2 6-10 4z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M16 14c0-4 4-8 6-8 0 0 0 6-6 8z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M13 28h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleMotionLines({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M4 16h6M6 11h4M6 21h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleSmiley({ className = "", size = 32, color = "currentColor" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="12" stroke={color} strokeWidth="1.5" />
      <circle cx="11" cy="13" r="1.5" fill={color} />
      <circle cx="21" cy="13" r="1.5" fill={color} />
      <path d="M11 20c1.2 2 4.8 3 10 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── Complex Illustration: Hero Character ─────────────────────────────────────

export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Ground / Shadow */}
      <ellipse cx="200" cy="345" rx="90" ry="12" fill="#2d1f14" opacity="0.08" />

      {/* Big cardboard box */}
      <rect x="120" y="240" width="100" height="80" rx="6" fill="#d4b896" stroke="#9a7856" strokeWidth="2" />
      <rect x="120" y="240" width="100" height="24" rx="6" fill="#c4a07c" stroke="#9a7856" strokeWidth="2" />
      <path d="M145 240L155 264M225 240L215 264" stroke="#9a7856" strokeWidth="2" strokeLinecap="round" />
      {/* Recycle symbol on box */}
      <path d="M170 272l6-10 6 10M158 272l-6 10 8-2M182 272l6 10-8-2" stroke="#7d5a3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Character body */}
      <rect x="163" y="168" width="54" height="70" rx="20" fill="#e8b84b" />
      {/* Shirt detail */}
      <rect x="170" y="175" width="40" height="50" rx="14" fill="#c4622d" opacity="0.7" />
      <path d="M183 185v30" stroke="#fffcf7" strokeWidth="2" strokeLinecap="round" />

      {/* Arms */}
      {/* Left arm - reaching down toward box */}
      <path d="M163 188c-12 5-22 20-24 45" stroke="#e8b84b" strokeWidth="20" strokeLinecap="round" />
      {/* Right arm */}
      <path d="M217 188c12 5 22 20 24 45" stroke="#e8b84b" strokeWidth="20" strokeLinecap="round" />
      {/* Hands */}
      <circle cx="139" cy="233" r="12" fill="#e8c68a" />
      <circle cx="241" cy="233" r="12" fill="#e8c68a" />

      {/* Legs */}
      <path d="M178 236v30c0 8 8 8 8 0v-12" stroke="#2d1f14" strokeWidth="18" strokeLinecap="round" />
      <path d="M202 236v30c0 8-8 8-8 0v-12" stroke="#2d1f14" strokeWidth="18" strokeLinecap="round" />
      {/* Shoes */}
      <ellipse cx="183" cy="268" rx="14" ry="8" fill="#1a1009" />
      <ellipse cx="197" cy="268" rx="14" ry="8" fill="#1a1009" />

      {/* Head */}
      <circle cx="190" cy="148" r="38" fill="#e8c68a" />
      {/* Hair */}
      <path d="M155 135c2-22 15-35 35-35s33 13 35 35" fill="#2d1f14" />
      {/* Eyes */}
      <circle cx="178" cy="145" r="5" fill="#2d1f14" />
      <circle cx="202" cy="145" r="5" fill="#2d1f14" />
      {/* Eye shine */}
      <circle cx="180" cy="143" r="1.5" fill="white" />
      <circle cx="204" cy="143" r="1.5" fill="white" />
      {/* Smile */}
      <path d="M178 158c4 6 14 6 24 0" stroke="#2d1f14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="168" cy="155" rx="6" ry="4" fill="#e87a5a" opacity="0.4" />
      <ellipse cx="212" cy="155" rx="6" ry="4" fill="#e87a5a" opacity="0.4" />

      {/* Small items floating around */}
      {/* Bottle on left */}
      <g transform="translate(70 180) rotate(-15)">
        <rect x="3" y="0" width="10" height="4" rx="1" fill="#c4622d" opacity="0.8" />
        <path d="M3 4c-3 2-4 5-4 9v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13c0-4-1-7-3-9" fill="#d4e8f8" stroke="#9a9a9a" strokeWidth="1.2" />
        <path d="M1 14h12" stroke="#9a9a9a" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Jar on right */}
      <g transform="translate(295 185) rotate(10)">
        <rect x="2" y="0" width="20" height="8" rx="2" fill="#8a8a8a" opacity="0.6" />
        <path d="M0 8a4 4 0 0 0-2 4v22a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V12a4 4 0 0 0-2-4z" fill="#d4e8f0" stroke="#9a9a9a" strokeWidth="1.2" />
      </g>

      {/* Stars scattered */}
      <g transform="translate(60 120)" opacity="0.9">
        <path d="M8 2L9.8 6.8 15 7.5 11.2 11 12.4 16 8 13.5 3.6 16 4.8 11 1 7.5 6.2 6.8z" fill="#e8b84b" stroke="#e8b84b" strokeWidth="0.5" />
      </g>
      <g transform="translate(305 105)" opacity="0.8">
        <path d="M6 1L7.4 5 11 5.5 8.4 8 9.2 12 6 10.4 2.8 12 3.6 8 1 5.5 4.6 5z" fill="#c4622d" stroke="#c4622d" strokeWidth="0.5" />
      </g>
      <g transform="translate(310 220)" opacity="0.7">
        <path d="M5 1L6.2 4.2 9 4.6 7 6.4 7.6 10 5 8.6 2.4 10 3 6.4 1 4.6 3.8 4.2z" fill="#e8b84b" stroke="#e8b84b" strokeWidth="0.5" />
      </g>

      {/* Leaf top right */}
      <g transform="translate(315 140) rotate(25)">
        <path d="M12 3C5 6 2 11 1 16M12 3L4 12c0 0 2-4 4-5s4-2 4 0v-4z" stroke="#5a7a4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Spiral top left */}
      <g transform="translate(45 75)" opacity="0.6">
        <path d="M10 10c0 0 3-1 3-4S9 2 6 4 1 8 4 12s8 4 11 1 5-9 1-13S5 -3 2 4" stroke="#c4622d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Motion lines left of character */}
      <path d="M100 175h15M96 188h12M100 201h15" stroke="#dfd0b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Sparkles around character */}
      <g transform="translate(248 125)">
        <path d="M6 0v12M0 6h12M2 2l8 8M10 2l-8 8" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </g>
      <g transform="translate(82 228)" opacity="0.5">
        <path d="M4 0v8M0 4h8M1.2 1.2l5.6 5.6M6.8 1.2l-5.6 5.6" stroke="#c4622d" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Recycling arrow hint at bottom */}
      <path d="M155 338c-10-8-20-5-25 5" stroke="#6d8c60" strokeWidth="2" strokeLinecap="round" />
      <path d="M127 343l3 6 4-5" stroke="#6d8c60" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M240 338c10-8 20-5 25 5" stroke="#6d8c60" strokeWidth="2" strokeLinecap="round" />
      <path d="M268 343l-3 6-4-5" stroke="#6d8c60" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Small doodle text "use me!" near box */}
      <text x="232" y="270" fontSize="10" fill="#9a7856" fontStyle="italic" transform="rotate(5 232 270)">use me!</text>
    </svg>
  );
}

// ─── Empty State Characters ────────────────────────────────────────────────────

export function EmptySearchChar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body */}
      <ellipse cx="100" cy="145" rx="30" ry="35" fill="#e8b84b" />
      {/* Head */}
      <circle cx="100" cy="98" r="32" fill="#e8c68a" />
      {/* Hair */}
      <path d="M70 88c2-20 12-30 30-30s28 10 30 30" fill="#2d1f14" />
      {/* Eyes - curious/searching */}
      <circle cx="89" cy="96" r="5" fill="#2d1f14" />
      <circle cx="111" cy="96" r="5" fill="#2d1f14" />
      <circle cx="90.5" cy="94.5" r="1.5" fill="white" />
      <circle cx="112.5" cy="94.5" r="1.5" fill="white" />
      {/* Raised eyebrow */}
      <path d="M84 88c2-3 10-3 10 0" stroke="#2d1f14" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M106 88c2-3 10-3 10 0" stroke="#2d1f14" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Thinking mouth */}
      <path d="M92 108c2 2 8 2 10 0" stroke="#2d1f14" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Magnifying glass */}
      <circle cx="145" cy="80" r="18" stroke="#c4622d" strokeWidth="3" fill="#d4e8f8" opacity="0.6" />
      <path d="M158 93l14 14" stroke="#c4622d" strokeWidth="4" strokeLinecap="round" />
      {/* Arm holding magnifier */}
      <path d="M128 115c5-10 12-20 20-30" stroke="#e8c68a" strokeWidth="14" strokeLinecap="round" />
      {/* Stars */}
      <path d="M40 60l1.8 4.8 5.2.7-3.8 3.5 1.2 5-4.4-2.5-4.4 2.5 1.2-5-3.8-3.5 5.2-.7z" fill="#e8b84b" opacity="0.7" />
      <path d="M155 140l1.4 3.6 3.9.5-2.8 2.6.9 3.8-3.4-1.9-3.4 1.9.9-3.8-2.8-2.6 3.9-.5z" fill="#c4622d" opacity="0.5" />
    </svg>
  );
}

export function EmptyBoxChar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Empty box */}
      <path d="M50 110l50-25 50 25v60l-50 25-50-25z" stroke="#b89672" strokeWidth="2" fill="#ede4d3" />
      <path d="M50 110l50 25 50-25" stroke="#b89672" strokeWidth="2" />
      <path d="M100 135v50" stroke="#b89672" strokeWidth="2" />
      {/* Character looking into box */}
      <circle cx="100" cy="75" r="25" fill="#e8c68a" />
      <path d="M78 65c2-15 10-22 22-22s20 7 22 22" fill="#2d1f14" />
      <circle cx="92" cy="74" r="4" fill="#2d1f14" />
      <circle cx="108" cy="74" r="4" fill="#2d1f14" />
      <circle cx="93.5" cy="72.5" r="1.2" fill="white" />
      <circle cx="109.5" cy="72.5" r="1.2" fill="white" />
      <path d="M93 83c2 2 6 2 9 0" stroke="#2d1f14" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Body leaning over */}
      <ellipse cx="100" cy="105" rx="20" ry="22" fill="#c4622d" opacity="0.8" />
      {/* Tiny stars */}
      <path d="M35 80l1.2 3.2 3.5.5-2.5 2.3.6 3.4-2.8-1.7-2.8 1.7.6-3.4-2.5-2.3 3.5-.5z" fill="#e8b84b" opacity="0.6" />
      <path d="M160 90l1.2 3.2 3.5.5-2.5 2.3.6 3.4-2.8-1.7-2.8 1.7.6-3.4-2.5-2.3 3.5-.5z" fill="#c4622d" opacity="0.5" />
    </svg>
  );
}

export function AILoadingChar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Brain/thinking cloud */}
      <path d="M70 60c0-10 5-18 15-18 2-8 10-12 18-10 4-8 14-10 20-4 8-2 14 4 12 12 8 2 10 12 4 18z" fill="#f5f0e8" stroke="#b89672" strokeWidth="1.5" />
      {/* Dots in thought cloud (thinking...) */}
      <circle cx="88" cy="50" r="3" fill="#c4622d">
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0s" />
      </circle>
      <circle cx="100" cy="50" r="3" fill="#c4622d">
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
      </circle>
      <circle cx="112" cy="50" r="3" fill="#c4622d">
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0.8s" />
      </circle>
      {/* Character body */}
      <ellipse cx="100" cy="155" rx="28" ry="32" fill="#e8b84b" />
      <ellipse cx="100" cy="155" rx="20" ry="28" fill="#c4622d" opacity="0.6" />
      {/* Head */}
      <circle cx="100" cy="110" r="30" fill="#e8c68a" />
      <path d="M73 100c2-18 12-28 27-28s25 10 27 28" fill="#2d1f14" />
      {/* Eyes - thinking upward */}
      <circle cx="90" cy="110" r="4.5" fill="#2d1f14" />
      <circle cx="110" cy="110" r="4.5" fill="#2d1f14" />
      <circle cx="91.5" cy="108" r="1.5" fill="white" />
      <circle cx="111.5" cy="108" r="1.5" fill="white" />
      {/* Little smile */}
      <path d="M93 120c2 3 9 3 13 0" stroke="#2d1f14" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Recycling objects orbiting */}
      <circle cx="155" cy="110" r="10" fill="#d4e8f8" stroke="#9a9a9a" strokeWidth="1.2">
        <animateTransform attributeName="transform" type="rotate" from="0 100 110" to="360 100 110" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="110" r="7" fill="#d4b896" stroke="#9a7856" strokeWidth="1.2">
        <animateTransform attributeName="transform" type="rotate" from="0 100 110" to="-360 100 110" dur="4s" repeatCount="indefinite" />
      </circle>
      {/* Sparkle */}
      <path d="M155 65l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#e8b84b" />
      <path d="M45 155l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#c4622d" opacity="0.7" />
    </svg>
  );
}

// ─── Decorative doodle clusters ───────────────────────────────────────────────

export function DoodleClusterLeft({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      <path d="M30 30c0 0 4-2 4-6s-5-6-8-3-4 7-1 11 8 4 11 1 5-9 1-14" stroke="#c4622d" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M60 70l1.8 4.8 5.2.7-3.8 3.5 1.2 5-4.4-2.5-4.4 2.5 1.2-5-3.8-3.5 5.2-.7z" fill="#e8b84b" opacity="0.6" />
      <path d="M20 100c2-4 8-5 10-4" stroke="#5a7a4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 96L15 108" stroke="#5a7a4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M85 130l1.4 3.6 3.9.5-2.8 2.6.9 3.8-3.4-1.9-3.4 1.9.9-3.8-2.8-2.6 3.9-.5z" fill="#c4622d" opacity="0.4" />
      <path d="M40 160l20-5M40 170l15-4" stroke="#dfd0b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleClusterRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      <path d="M80 20l1.8 4.8 5.2.7-3.8 3.5 1.2 5-4.4-2.5-4.4 2.5 1.2-5-3.8-3.5 5.2-.7z" fill="#e8b84b" opacity="0.7" />
      <path d="M30 60c4-3 9-2 12 0" stroke="#c4622d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M36 64l4 8" stroke="#c4622d" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M90 100c0 0 2-5 6-5s5 3 5 7-3 6-7 4-5-6-2-9" stroke="#b89672" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M50 140l1.2 3.2 3.5.5-2.5 2.3.6 3.4-2.8-1.7-2.8 1.7.6-3.4-2.5-2.3 3.5-.5z" fill="#e8b84b" opacity="0.5" />
      <path d="M70 170c3-4 10-4 12 0" stroke="#5a7a4a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
