"use client";

import { motion, useReducedMotion } from "motion/react";
import { GaneshaMotif } from "@/components/motifs/GaneshaMotif";
import { Divider, Mandala } from "@/components/motifs/Ornaments";
import { EASE_SILK } from "@/lib/motion";
import { weddingConfig } from "@/wedding.config";

/* ==================================================================
   THE BLESSING
   Ganesha, then the shloka line by line, then the invocation. The
   ground is the same burgundy the envelope sat on, so opening the
   invitation lands the guest in a continuous space rather than on a
   new page.

   The sequence is deliberately unhurried — but it is never a gate.
   Scrolling away at any moment is fine.
   ================================================================== */

const { shloka, blessing } = weddingConfig.invocation;

/** Beats of the sequence, in seconds. */
const BEAT = {
  ganesha: 0.15,
  rule: 1.1,
  shloka: [1.5, 2.3],
  blessing: [3.2, 3.9],
  hint: 4.7,
};

export function GaneshaIntro({ started }: { started: boolean }) {
  const reduce = useReducedMotion();
  /** Reduced motion still gets the order, just not the patience. */
  const t = (seconds: number) => (reduce ? seconds * 0.12 : seconds);
  const state = started ? "show" : "hidden";

  const sacred = (delay: number) => ({
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(5px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.5 : 1.5, ease: EASE_SILK, delay: t(delay) },
    },
  });

  return (
    <section
      id="invocation"
      aria-labelledby="invocation-heading"
      className="ground-deep grain grain-dark vignette relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24"
    >
      <h2 id="invocation-heading" className="sr-only">
        Invocation to Shree Ganesha
      </h2>

      {/* Slowly turning ground */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[135vmin] w-[135vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.075]"
      >
        <Mandala className="animate-slow-spin h-full w-full" tone="var(--color-gold-soft)" />
      </div>

      <div className="relative z-[2] flex w-full max-w-2xl flex-col items-center">
        {/* --- Ganesha --- */}
        <motion.div
          className="h-[min(46vh,300px)] w-[min(62vw,260px)]"
          variants={{
            hidden: { opacity: 0, scale: reduce ? 1 : 0.93, filter: "blur(8px)" },
            show: {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              transition: {
                duration: reduce ? 0.6 : 2.0,
                ease: EASE_SILK,
                delay: t(BEAT.ganesha),
              },
            },
          }}
          initial="hidden"
          animate={state}
        >
          <GaneshaMotif />
        </motion.div>

        {/* --- Rule --- */}
        <motion.div
          className="mt-10 w-full max-w-[240px] origin-center"
          variants={{
            hidden: { opacity: 0, scaleX: reduce ? 1 : 0.2 },
            show: {
              opacity: 1,
              scaleX: 1,
              transition: {
                duration: reduce ? 0.4 : 1.3,
                ease: EASE_SILK,
                delay: t(BEAT.rule),
              },
            },
          }}
          initial="hidden"
          animate={state}
        >
          <Divider tone="var(--color-gold-soft)" className="w-full opacity-80" />
        </motion.div>

        {/* --- Shloka, line by line --- */}
        <div className="mt-10 flex flex-col items-center text-center">
          {shloka.map((line, i) => (
            <motion.p
              key={line}
              lang="sa"
              className="deva text-gold-pale text-[clamp(1.02rem,4.5vw,1.55rem)]"
              variants={sacred(BEAT.shloka[i] ?? BEAT.shloka[0] + i * 0.8)}
              initial="hidden"
              animate={state}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* --- Hindi invocation --- */}
        <div className="mt-12 flex flex-col items-center text-center">
          {blessing.map((line, i) => (
            <motion.p
              key={line}
              lang="hi"
              className="deva text-gold-soft/85 text-[clamp(0.92rem,3.9vw,1.22rem)]"
              variants={sacred(BEAT.blessing[i] ?? BEAT.blessing[0] + i * 0.7)}
              initial="hidden"
              animate={state}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      {/* --- Onward --- */}
      <motion.div
        className="absolute inset-x-0 bottom-8 z-[2] flex flex-col items-center"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { duration: 1.1, ease: EASE_SILK, delay: t(BEAT.hint) },
          },
        }}
        initial="hidden"
        animate={state}
      >
        <span className="eyebrow text-gold-soft/55">Scroll</span>
        <span
          aria-hidden="true"
          className={`mt-3 block h-10 w-px bg-linear-to-b from-gold-soft/50 to-gold-soft/0 ${
            reduce ? "" : "animate-hint"
          }`}
        />
      </motion.div>
    </section>
  );
}
