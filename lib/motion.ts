import type { Variants } from "motion/react";

/* ==================================================================
   MOTION VOCABULARY
   One easing curve does most of the work. Everything decelerates the
   way heavy paper does — quick to leave, slow to settle.
   ================================================================== */

export const EASE_SILK: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_PAPER: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** Default viewport rule for scroll reveals — fire once, fairly early. */
export const VIEWPORT = { once: true, amount: 0.28 } as const;
export const VIEWPORT_EARLY = { once: true, amount: 0.12 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_SILK },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease: EASE_SILK } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.05, ease: EASE_SILK },
  },
};

/** A rule or divider drawing itself outward from the centre. */
export const drawRule: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: EASE_SILK },
  },
};

/** Parent that lets children arrive one after another. */
export const stagger = (delayChildren = 0, staggerChildren = 0.12): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Line-by-line arrival used by the shloka. Deliberately unhurried. */
export const sacredLine: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.6, ease: EASE_SILK },
  },
};
