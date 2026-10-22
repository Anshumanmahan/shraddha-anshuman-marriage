import { cn } from "@/lib/cn";

/* ==================================================================
   DAMASK
   The tone-on-tone pattern pressed into good invitation stock.

   Embossing is faked the way it works in print: the same motif drawn
   twice, a highlight offset up-left and a shadow offset down-right,
   both at very low opacity. Neither line is visible on its own — the
   pair is what reads as relief.
   ================================================================== */

/** One tile of the repeat. Two motifs per tile, so it never grids up. */
function Motif({ id }: { id: string }) {
  const rosette = (cx: number, cy: number, r: number, rot: number) => (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {Array.from({ length: 8 }, (_, i) => i * 45).map((a) => (
        <path
          key={a}
          d={`M${cx} ${cy - r} C${cx + r * 0.34} ${cy - r * 0.55} ${cx + r * 0.34} ${
            cy - r * 0.2
          } ${cx} ${cy} C${cx - r * 0.34} ${cy - r * 0.2} ${cx - r * 0.34} ${
            cy - r * 0.55
          } ${cx} ${cy - r} Z`}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.16} />
    </g>
  );

  const sprig = (x: number, y: number, s: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C6 -6 14 -8 20 -6 C14 -1 6 2 0 0 Z" />
      <path d="M0 0 C6 6 14 8 20 6 C14 1 6 -2 0 0 Z" />
      <path d="M0 0 C-4 -7 -3 -15 2 -19" />
      <circle cx="2" cy="-21" r="1.6" />
    </g>
  );

  return (
    <g id={id}>
      {rosette(24, 24, 13, 0)}
      {rosette(72, 72, 10, 22)}
      {sprig(24, 62, 0.62, 24)}
      {sprig(74, 26, 0.55, -150)}
      <circle cx="70" cy="16" r="1.4" />
      <circle cx="16" cy="74" r="1.4" />
      <circle cx="48" cy="48" r="1.1" />
    </g>
  );
}

type DamaskProps = {
  className?: string;
  /** Unique per instance — SVG ids are global. */
  id: string;
  /** Colour of the raised edge. */
  highlight?: string;
  /** Colour of the shadow edge. */
  shadow?: string;
  strength?: number;
  scale?: number;
};

export function Damask({
  className,
  id,
  highlight = "#ffffff",
  shadow = "#a98a5e",
  strength = 1,
  scale = 1,
}: DamaskProps) {
  const tile = 96 * scale;

  return (
    <svg
      className={cn("h-full w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={`${id}-hi`}
          width={tile}
          height={tile}
          patternUnits="userSpaceOnUse"
          viewBox="0 0 96 96"
        >
          <g
            fill="none"
            stroke={highlight}
            strokeWidth="1.6"
            strokeLinecap="round"
            transform="translate(-0.7 -0.7)"
          >
            <Motif id={`${id}-m-hi`} />
          </g>
        </pattern>

        <pattern
          id={`${id}-sh`}
          width={tile}
          height={tile}
          patternUnits="userSpaceOnUse"
          viewBox="0 0 96 96"
        >
          <g
            fill="none"
            stroke={shadow}
            strokeWidth="1.6"
            strokeLinecap="round"
            transform="translate(0.7 0.7)"
          >
            <Motif id={`${id}-m-sh`} />
          </g>
        </pattern>
      </defs>

      <rect
        width="100%"
        height="100%"
        fill={`url(#${id}-hi)`}
        opacity={0.55 * strength}
      />
      <rect
        width="100%"
        height="100%"
        fill={`url(#${id}-sh)`}
        opacity={0.28 * strength}
      />
    </svg>
  );
}
