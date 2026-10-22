import { cn } from "@/lib/cn";

/* ==================================================================
   ORNAMENTS
   Fine gold line-art, drawn as SVG so it stays crisp at every size
   and costs nothing to download. Used sparingly — restraint is the
   point of the whole design.
   ================================================================== */

type OrnamentProps = {
  className?: string;
  /** Stroke colour. Defaults to the antique gold token. */
  tone?: string;
};

/* ------------------------------------------------------------------
   Divider — a hairline that resolves into a quatrefoil at its centre.
   The workhorse between sections.
   ------------------------------------------------------------------ */
export function Divider({
  className,
  tone = "var(--color-gold)",
}: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 240 24"
      className={cn("w-full max-w-[240px] h-6", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="orn-fade-l" x1="0" x2="1">
          <stop offset="0" stopColor={tone} stopOpacity="0" />
          <stop offset="1" stopColor={tone} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="orn-fade-r" x1="0" x2="1">
          <stop offset="0" stopColor={tone} stopOpacity="0.9" />
          <stop offset="1" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d="M4 12 H96" stroke="url(#orn-fade-l)" strokeWidth="1" />
      <path d="M144 12 H236" stroke="url(#orn-fade-r)" strokeWidth="1" />

      <circle cx="102" cy="12" r="1.7" fill={tone} opacity="0.75" />
      <circle cx="138" cy="12" r="1.7" fill={tone} opacity="0.75" />

      {/* Vesica quatrefoil */}
      <path
        d="M120 2 Q126.5 12 120 22 Q113.5 12 120 2 Z"
        stroke={tone}
        strokeWidth="1"
      />
      <path
        d="M108 12 Q120 5.5 132 12 Q120 18.5 108 12 Z"
        stroke={tone}
        strokeWidth="1"
      />
      <circle cx="120" cy="12" r="1.5" fill={tone} />
    </svg>
  );
}

/* ------------------------------------------------------------------
   CornerFlourish — one drawing, mirrored by CSS into four corners.
   ------------------------------------------------------------------ */
export function CornerFlourish({
  className,
  tone = "var(--color-gold)",
}: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 110 110"
      className={cn("h-16 w-16", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke={tone} strokeLinecap="round">
        <path d="M2 62 C2 28 28 2 62 2" strokeWidth="1" opacity="0.9" />
        <path d="M2 76 C2 34 34 2 76 2" strokeWidth="0.7" opacity="0.5" />
        {/* paisley curl */}
        <path
          d="M14 40 C20 24 34 15 45 18 C38 27 28 36 14 40 Z"
          strokeWidth="0.9"
          opacity="0.85"
        />
        <path d="M22 33 C28 27 34 24 39 24" strokeWidth="0.6" opacity="0.6" />
        {/* trailing buds */}
        <path d="M8 88 C8 80 14 74 22 74" strokeWidth="0.7" opacity="0.45" />
        <path d="M88 8 C80 8 74 14 74 22" strokeWidth="0.7" opacity="0.45" />
      </g>
      <circle cx="55" cy="55" r="1.6" fill={tone} opacity="0.6" />
      <circle cx="22" cy="74" r="1.3" fill={tone} opacity="0.45" />
      <circle cx="74" cy="22" r="1.3" fill={tone} opacity="0.45" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Mandala — concentric rings and petals. Generated rather than
   hand-drawn so the geometry stays exact.
   ------------------------------------------------------------------ */
export function Mandala({
  className,
  tone = "var(--color-gold)",
  petals = 24,
}: OrnamentProps & { petals?: number }) {
  const outerPetals = Array.from({ length: petals }, (_, i) => (360 / petals) * i);
  const innerPetals = Array.from(
    { length: petals / 2 },
    (_, i) => (720 / petals) * i + 360 / petals / 2,
  );
  const beads = Array.from({ length: petals * 2 }, (_, i) => (180 / petals) * i);

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke={tone} strokeWidth="0.6">
        <circle cx="100" cy="100" r="94" opacity="0.35" />
        <circle cx="100" cy="100" r="88" opacity="0.2" />
        <circle cx="100" cy="100" r="62" opacity="0.3" />
        <circle cx="100" cy="100" r="42" opacity="0.35" />
        <circle cx="100" cy="100" r="20" opacity="0.45" />
      </g>

      {outerPetals.map((a) => (
        <path
          key={`o${a}`}
          d="M100 64 Q108 82 100 96 Q92 82 100 64 Z"
          stroke={tone}
          strokeWidth="0.6"
          opacity="0.42"
          transform={`rotate(${a} 100 100)`}
        />
      ))}

      {innerPetals.map((a) => (
        <path
          key={`i${a}`}
          d="M100 22 Q107 40 100 58 Q93 40 100 22 Z"
          stroke={tone}
          strokeWidth="0.55"
          opacity="0.28"
          transform={`rotate(${a} 100 100)`}
        />
      ))}

      {beads.map((a) => (
        <circle
          key={`b${a}`}
          cx="100"
          cy="9"
          r="0.9"
          fill={tone}
          opacity="0.3"
          transform={`rotate(${a} 100 100)`}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------
   Jaali — a lattice, used at very low opacity as a ground texture.
   ------------------------------------------------------------------ */
export function Jaali({
  className,
  tone = "var(--color-gold)",
  id = "jaali",
}: OrnamentProps & { id?: string }) {
  return (
    <svg
      className={cn("h-full w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={id}
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <g fill="none" stroke={tone} strokeWidth="0.7">
            <path d="M28 2 L54 28 L28 54 L2 28 Z" />
            <path d="M28 14 L42 28 L28 42 L14 28 Z" opacity="0.6" />
            <circle cx="28" cy="28" r="4" opacity="0.5" />
            <path d="M2 2 L14 14 M54 2 L42 14 M2 54 L14 42 M54 54 L42 42" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ------------------------------------------------------------------
   LotusCrest — a small five-petal lotus. Section caps and finials.
   ------------------------------------------------------------------ */
export function LotusCrest({
  className,
  tone = "var(--color-gold)",
}: OrnamentProps) {
  const petals = [-52, -26, 0, 26, 52];
  return (
    <svg
      viewBox="0 0 80 60"
      className={cn("h-10 w-14", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {petals.map((a, i) => (
        <path
          key={a}
          d="M40 10 C32 22 32 38 40 50 C48 38 48 22 40 10 Z"
          stroke={tone}
          strokeWidth="0.9"
          opacity={i === 2 ? 0.95 : 0.6}
          transform={`rotate(${a} 40 52)`}
        />
      ))}
      <path d="M22 52 H58" stroke={tone} strokeWidth="0.9" opacity="0.7" />
      <circle cx="40" cy="52" r="1.6" fill={tone} />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Ampersand — the couple's join. Drawn, not typed, so it reads as
   an ornament rather than a character.
   ------------------------------------------------------------------ */
export function AmpersandCrest({
  className,
  tone = "var(--color-gold)",
}: OrnamentProps) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        fill="none"
        focusable="false"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke={tone}
          strokeWidth="0.8"
          opacity="0.55"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke={tone}
          strokeWidth="0.5"
          opacity="0.3"
        />
        {[0, 90, 180, 270].map((a) => (
          <path
            key={a}
            d="M50 4 Q54 10 50 16 Q46 10 50 4 Z"
            stroke={tone}
            strokeWidth="0.8"
            opacity="0.7"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </svg>
      <span
        className="display italic leading-none"
        style={{ color: tone, fontSize: "0.52em" }}
      >
        &amp;
      </span>
    </span>
  );
}
