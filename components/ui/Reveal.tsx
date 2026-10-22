"use client";

import { motion, type Variants } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { VIEWPORT, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to hold before this element arrives. */
  delay?: number;
  variants?: Variants;
  as?: "div" | "section" | "li" | "p" | "span";
  once?: boolean;
  amount?: number;
};

/**
 * A variant's own `transition` outranks the `transition` prop, so a delay
 * has to be folded into the variant itself rather than passed alongside.
 */
function withDelay(variants: Variants, delay: number): Variants {
  const show = variants.show;
  if (!show || typeof show === "function") return variants;
  const { transition, ...rest } = show as Record<string, unknown>;
  return {
    ...variants,
    show: {
      ...rest,
      transition: { ...(transition as object), delay },
    },
  };
}

/**
 * Scroll-triggered arrival. Uses IntersectionObserver under the hood
 * (never a scroll listener) and fires once, so the page settles.
 *
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user">
 * in WeddingExperience — transforms are dropped, opacity is kept.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  as = "div",
  once = VIEWPORT.once,
  amount = VIEWPORT.amount,
}: RevealProps) {
  const Comp = motion[as];
  const resolved = useMemo(
    () => (delay ? withDelay(variants, delay) : variants),
    [variants, delay],
  );

  return (
    <Comp
      className={cn(className)}
      variants={resolved}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </Comp>
  );
}
