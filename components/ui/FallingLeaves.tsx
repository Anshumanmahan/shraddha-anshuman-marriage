"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/* ==================================================================
   FALLING LEAVES
   A drift of gold leaves over the whole invitation.

   Deliberately CSS, not JavaScript: a dozen elements animating pure
   transform and opacity stay on the compositor, so this costs nothing
   on a phone and keeps running while the main thread is busy. There is
   no scroll listener and no per-frame work.

   Restraint is the whole trick — these sit at around a tenth of full
   opacity. They should be noticed on the second look, not the first.
   ================================================================== */

/** Fixed, not random: the server and the client must agree on the markup. */
const LEAVES = [
  { x: 4, size: 15, dur: 20, delay: 0, drift: 5, sway: 16, tilt: -30, op: 0.16 },
  { x: 14, size: 10, dur: 26, delay: 6, drift: -4, sway: 11, tilt: 20, op: 0.11 },
  { x: 24, size: 18, dur: 17, delay: 12, drift: 7, sway: 20, tilt: -15, op: 0.14 },
  { x: 33, size: 11, dur: 23, delay: 3, drift: -6, sway: 13, tilt: 35, op: 0.1 },
  { x: 42, size: 14, dur: 29, delay: 16, drift: 4, sway: 17, tilt: -22, op: 0.13 },
  { x: 51, size: 9, dur: 19, delay: 9, drift: -3, sway: 10, tilt: 28, op: 0.1 },
  { x: 59, size: 17, dur: 25, delay: 20, drift: 6, sway: 19, tilt: -18, op: 0.15 },
  { x: 68, size: 12, dur: 21, delay: 2, drift: -5, sway: 14, tilt: 24, op: 0.12 },
  { x: 76, size: 16, dur: 28, delay: 13, drift: 5, sway: 18, tilt: -32, op: 0.13 },
  { x: 84, size: 10, dur: 18, delay: 7, drift: -4, sway: 12, tilt: 16, op: 0.11 },
  { x: 91, size: 13, dur: 24, delay: 18, drift: 6, sway: 15, tilt: -26, op: 0.14 },
  { x: 97, size: 11, dur: 22, delay: 10, drift: -5, sway: 13, tilt: 30, op: 0.1 },
];

export function FallingLeaves({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce || !active) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "no-print pointer-events-none fixed inset-0 z-30 overflow-hidden",
        className,
      )}
    >
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="absolute top-0 block will-change-transform"
          style={{
            left: `${leaf.x}%`,
            width: leaf.size,
            height: leaf.size * 1.7,
            animation: `leaf-fall ${leaf.dur}s linear ${leaf.delay}s infinite`,
            ["--leaf-drift" as string]: `${leaf.drift}vw`,
          }}
        >
          <span
            className="block h-full w-full will-change-transform"
            style={{
              opacity: leaf.op,
              animation: `leaf-sway ${(leaf.dur / 5).toFixed(2)}s ease-in-out ${
                leaf.delay / 2
              }s infinite alternate`,
              ["--leaf-sway" as string]: `${leaf.sway}px`,
              ["--leaf-spin-from" as string]: `${leaf.tilt}deg`,
              ["--leaf-spin-to" as string]: `${-leaf.tilt * 1.4}deg`,
            }}
          >
            <Leaf />
          </span>
        </span>
      ))}
    </div>
  );
}

/** A single leaf: one blade, a midrib, and a few veins. */
function Leaf() {
  return (
    <svg viewBox="0 0 20 34" className="h-full w-full" focusable="false">
      <path
        d="M10 0 C17 9 20 20 10 34 C0 20 3 9 10 0 Z"
        fill="var(--color-gold)"
      />
      <path
        d="M10 3 V30"
        stroke="var(--color-gold-deep)"
        strokeWidth="0.9"
        opacity="0.5"
      />
      <path
        d="M10 10 L5.5 8 M10 10 L14.5 8 M10 17 L5 16 M10 17 L15 16 M10 24 L6.5 23.5 M10 24 L13.5 23.5"
        stroke="var(--color-gold-deep)"
        strokeWidth="0.7"
        opacity="0.4"
        fill="none"
      />
    </svg>
  );
}
