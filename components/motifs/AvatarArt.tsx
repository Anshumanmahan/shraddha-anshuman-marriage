import { cn } from "@/lib/cn";

/* ==================================================================
   DRAWN AVATARS
   Stand-ins for the couple's illustrated avatars. Line-art busts, so
   they sit happily on ivory or burgundy and never look like a
   missing asset. Swapped out via `weddingConfig.groom/bride.avatar`.
   ================================================================== */

type ArtProps = { className?: string };

const base = {
  viewBox: "0 0 200 230",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: "false" as const,
};

/** Groom — safa with a kalgi, sherwani collar. */
export function GroomArt({ className }: ArtProps) {
  return (
    <svg {...base} className={cn("h-full w-full", className)}>
      {/* Kalgi plume */}
      <g opacity="0.9">
        <path d="M134 40 C138 26 146 18 152 16 C150 26 146 36 138 44" />
        <path d="M136 42 C142 34 146 28 149 22" strokeWidth="0.6" opacity="0.6" />
        <circle cx="133" cy="46" r="2.6" />
      </g>

      {/* Safa (turban) */}
      <path d="M56 92 C54 66 72 48 100 48 C126 48 144 64 144 88" />
      <path d="M56 92 C64 80 78 74 100 74 C122 74 136 80 144 88" opacity="0.75" />
      <path d="M60 82 C72 68 86 62 102 62" strokeWidth="0.7" opacity="0.55" />
      <path d="M68 72 C80 62 92 58 104 57" strokeWidth="0.7" opacity="0.4" />
      <path d="M56 92 C56 96 60 99 66 99 L134 99 C140 99 144 96 144 92" />
      {/* Tail of the safa */}
      <path d="M144 90 C154 96 158 108 154 120 C150 112 146 104 142 99" opacity="0.8" />

      {/* Face */}
      <path d="M68 99 V116 C68 138 82 152 100 152 C118 152 132 138 132 116 V99" />
      <path d="M66 116 C60 116 58 124 64 128" opacity="0.7" />
      <path d="M134 116 C140 116 142 124 136 128" opacity="0.7" />
      <path d="M86 118 C89 115 93 115 96 118" strokeWidth="1" opacity="0.85" />
      <path d="M104 118 C107 115 111 115 114 118" strokeWidth="1" opacity="0.85" />
      {/* Moustache */}
      <path d="M88 133 C93 130 97 130 100 132 C103 130 107 130 112 133" opacity="0.8" />

      {/* Sherwani */}
      <path d="M100 152 V166" opacity="0.6" />
      <path d="M36 230 C36 196 60 174 86 168 L100 182 L114 168 C140 174 164 196 164 230" />
      <path d="M86 168 L100 182 L114 168" opacity="0.9" />
      <path d="M100 182 V230" opacity="0.5" />
      {[194, 206, 218].map((y) => (
        <circle key={y} cx="100" cy={y} r="2.2" opacity="0.7" />
      ))}
      <path d="M72 176 C80 190 84 210 84 230" strokeWidth="0.7" opacity="0.35" />
      <path d="M128 176 C120 190 116 210 116 230" strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}

/** Bride — dupatta, maang tikka, jhumkas. */
export function BrideArt({ className }: ArtProps) {
  return (
    <svg {...base} className={cn("h-full w-full", className)}>
      {/* Dupatta over the head */}
      <path d="M46 138 C42 84 66 46 100 46 C134 46 158 84 154 138" />
      <path d="M56 130 C54 90 74 60 100 60 C126 60 146 90 144 130" opacity="0.6" />
      <path d="M46 138 C42 158 44 178 52 196" opacity="0.8" />
      <path d="M154 138 C158 158 156 178 148 196" opacity="0.8" />
      {/* Fringe */}
      {[52, 62, 138, 148].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${i < 2 ? 150 + i * 6 : 150 + (3 - i) * 6} v9`}
          strokeWidth="0.7"
          opacity="0.45"
        />
      ))}

      {/* Hair */}
      <path d="M68 100 C72 80 84 70 100 70 C116 70 128 80 132 100" opacity="0.85" />

      {/* Maang tikka */}
      <path d="M100 70 V60" strokeWidth="0.8" opacity="0.85" />
      <path d="M100 60 C96 56 96 50 100 47 C104 50 104 56 100 60 Z" opacity="0.9" />
      <circle cx="100" cy="74" r="2.4" opacity="0.9" />

      {/* Face */}
      <path d="M70 100 V120 C70 142 83 156 100 156 C117 156 130 142 130 120 V100" />
      <path d="M87 120 C90 117 94 117 97 120" strokeWidth="1" opacity="0.85" />
      <path d="M103 120 C106 117 110 117 113 120" strokeWidth="1" opacity="0.85" />
      <path d="M94 136 C97 138 103 138 106 136" opacity="0.8" />
      {/* Bindi */}
      <circle cx="100" cy="107" r="1.8" fill="currentColor" stroke="none" opacity="0.85" />

      {/* Jhumkas */}
      <g opacity="0.9">
        <path d="M68 118 v6" />
        <path d="M63 124 h10 l-5 8 Z" />
        <circle cx="68" cy="135" r="2" />
        <path d="M132 118 v6" />
        <path d="M127 124 h10 l-5 8 Z" />
        <circle cx="132" cy="135" r="2" />
      </g>

      {/* Neckline + haar */}
      <path d="M100 156 V170" opacity="0.6" />
      <path d="M44 230 C44 198 66 178 88 172 C92 180 108 180 112 172 C134 178 156 198 156 230" />
      <path d="M78 176 C84 190 116 190 122 176" opacity="0.75" />
      <path d="M72 180 C80 200 120 200 128 180" strokeWidth="0.7" opacity="0.5" />
      <path d="M100 190 C97 194 97 199 100 202 C103 199 103 194 100 190 Z" opacity="0.8" />
    </svg>
  );
}
