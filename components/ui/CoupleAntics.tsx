"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ==================================================================
   COUPLE ANTICS
   The two figures are single flat illustrations, so nothing about
   them can be posed — no waving an arm, no victory sign. Character
   has to come from how they *move*.

   So each one holds still, then every few seconds gives a small
   delighted hop and leans towards the other, and marigold petals
   drift up through the gap between them. Long calm stretches with a
   short burst is what reads as alive rather than as a loop.
   ================================================================== */

/**
 * A long, mostly-still cycle with one hop near the end.
 * `times` keeps roughly the first two-thirds motionless.
 */
const HOP_TIMES = [0, 0.58, 0.65, 0.71, 0.78, 0.85, 1];

export function Antics({
  children,
  /** +1 leans right, -1 leans left. Point each figure at the other. */
  lean,
  /** Offsets the cycle so the two never hop in lockstep. */
  delay = 0,
  className,
}: {
  children: ReactNode;
  lean: 1 | -1;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn("will-change-transform", className)}
      style={{ transformOrigin: "50% 100%" }}
      animate={{
        y: [0, 0, -15, 1, -7, 0, 0],
        rotate: [0, 0, lean * 4.5, lean * -1.5, lean * 2.5, 0, 0],
        scaleX: [1, 1, 0.985, 1.02, 0.995, 1, 1],
      }}
      transition={{
        duration: 7.4,
        repeat: Infinity,
        ease: "easeInOut",
        times: HOP_TIMES,
        delay,
      }}
      whileHover={{ y: -12, scale: 1.04, transition: { duration: 0.35 } }}
      whileTap={{ y: -6, scale: 0.99, transition: { duration: 0.15 } }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

/** Fixed, not random — the server and the client must agree. */
const PETALS = [
  { x: 8, drift: 14, size: 11, delay: 0, dur: 7.6, spin: 140 },
  { x: 34, drift: -18, size: 8, delay: 1.9, dur: 9.1, spin: -110 },
  { x: 58, drift: 12, size: 13, delay: 3.4, dur: 8.2, spin: 95 },
  { x: 78, drift: -10, size: 9, delay: 0.9, dur: 10.2, spin: -150 },
  { x: 20, drift: 20, size: 7, delay: 5.2, dur: 8.8, spin: 120 },
  { x: 66, drift: -14, size: 10, delay: 6.4, dur: 9.6, spin: -90 },
];

/** Marigold petals drifting up through the gap between the two. */
export function RisingPetals({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {PETALS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 block"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 1.5 }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: ["0%", "-680%"],
            x: [0, p.drift, p.drift * 0.3, p.drift * 0.9],
            rotate: [0, p.spin],
            opacity: [0, 0.75, 0.7, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeOut",
            delay: p.delay,
            times: undefined,
          }}
        >
          <svg viewBox="0 0 20 30" className="h-full w-full" focusable="false">
            <path
              d="M10 0 C16 9 19 18 10 30 C1 18 4 9 10 0 Z"
              fill="var(--color-gold)"
              opacity="0.55"
            />
            <path
              d="M10 3 C13 10 14 18 10 26"
              stroke="var(--color-gold-deep)"
              strokeWidth="0.7"
              fill="none"
              opacity="0.45"
            />
          </svg>
        </motion.span>
      ))}
    </div>
  );
}
