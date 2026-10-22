import type { EventIcon } from "@/wedding.config";
import { cn } from "@/lib/cn";

/* ==================================================================
   EVENT ICONS
   One small line drawing per ceremony. 48×48, stroke-only, so they
   read as engraving rather than as UI icons.
   ================================================================== */

type IconProps = { className?: string };

const svgProps = {
  viewBox: "0 0 48 48",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: "false" as const,
};

/** Two rings, joined. */
function Rings({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("h-full w-full", className)}>
      <circle cx="19" cy="28" r="10" />
      <circle cx="29" cy="28" r="10" />
      <path d="M24 8 L27 14 H21 Z" />
      <path d="M24 14 V18" opacity="0.6" />
    </svg>
  );
}

/** Sangeet — a dholak with a pair of notes rising. */
function Sangeet({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("h-full w-full", className)}>
      <path d="M10 26 C10 21 16 18 24 18 C32 18 38 21 38 26 L38 34 C38 39 32 42 24 42 C16 42 10 39 10 34 Z" />
      <path d="M10 26 C10 31 16 34 24 34 C32 34 38 31 38 26" opacity="0.55" />
      <path d="M14 22 L34 38 M34 22 L14 38" opacity="0.3" strokeWidth="0.7" />
      <path d="M28 6 V15 M28 6 L36 8 V16" opacity="0.85" />
      <circle cx="26" cy="15" r="2" opacity="0.85" />
      <circle cx="34" cy="16" r="2" opacity="0.85" />
    </svg>
  );
}

/** Dinner — a thali. */
function Dinner({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("h-full w-full", className)}>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="13" opacity="0.4" />
      <circle cx="18" cy="19" r="3.4" opacity="0.8" />
      <circle cx="30" cy="19" r="3.4" opacity="0.8" />
      <circle cx="24" cy="30" r="3.4" opacity="0.8" />
    </svg>
  );
}

/** Haldi — a bowl of turmeric with a marigold above. */
function Haldi({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("h-full w-full", className)}>
      <path d="M9 28 H39 C39 36 33 41 24 41 C15 41 9 36 9 28 Z" />
      <path d="M13 28 C17 26 31 26 35 28" opacity="0.5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path
          key={a}
          d="M24 8 C21 12 21 16 24 19 C27 16 27 12 24 8 Z"
          opacity="0.75"
          transform={`rotate(${a} 24 19)`}
        />
      ))}
      <circle cx="24" cy="19" r="1.6" />
    </svg>
  );
}

/** Barat — the ceremonial parasol of the procession. */
function Barat({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("h-full w-full", className)}>
      <path d="M6 24 C6 14 14 7 24 7 C34 7 42 14 42 24 Z" />
      <path d="M6 24 C10 20 14 20 18 24 C22 20 26 20 30 24 C34 20 38 20 42 24" opacity="0.65" />
      <path d="M24 7 V4" />
      <path d="M24 24 V40" />
      <path d="M20 43 H28" opacity="0.7" />
      <path d="M12 27 V32 M36 27 V32" opacity="0.45" strokeWidth="0.7" />
    </svg>
  );
}

/** Jaimaal — the exchanged garland. */
function Jaimaal({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("h-full w-full", className)}>
      <path d="M14 10 C6 20 6 32 14 40" />
      <path d="M34 10 C42 20 42 32 34 40" />
      <path d="M14 40 C18 44 30 44 34 40" />
      <path d="M14 10 C18 6 30 6 34 10" opacity="0.5" />
      {[13, 20, 28, 36].map((y, i) => (
        <g key={y} opacity="0.8">
          <circle cx={i % 2 === 0 ? 9.5 : 10.5} cy={y} r="1.5" />
          <circle cx={i % 2 === 0 ? 38.5 : 37.5} cy={y} r="1.5" />
        </g>
      ))}
      <circle cx="24" cy="43" r="1.5" opacity="0.8" />
    </svg>
  );
}

/** Reception — a lit diya. */
function Reception({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("h-full w-full", className)}>
      <path d="M7 29 H41 C41 36 33 40 24 40 C15 40 7 36 7 29 Z" />
      <path d="M11 29 C16 27 32 27 37 29" opacity="0.5" />
      <path d="M24 8 C29 14 31 19 28 23 C26.5 25 21.5 25 20 23 C17 19 19 14 24 8 Z" />
      <path d="M24 15 C26 18 26.5 21 24 23 C21.5 21 22 18 24 15 Z" opacity="0.5" />
      <path d="M4 24 L1.5 22 M44 24 L46.5 22" opacity="0.4" strokeWidth="0.7" />
    </svg>
  );
}

const ICONS: Record<EventIcon, (p: IconProps) => React.JSX.Element> = {
  rings: Rings,
  sangeet: Sangeet,
  dinner: Dinner,
  haldi: Haldi,
  barat: Barat,
  jaimaal: Jaimaal,
  reception: Reception,
};

export function CeremonyIcon({
  name,
  className,
}: {
  name: EventIcon;
  className?: string;
}) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
