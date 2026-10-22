"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { BrideArt, GroomArt } from "@/components/motifs/AvatarArt";
import { EASE_SILK } from "@/lib/motion";
import { weddingConfig } from "@/wedding.config";
import { cn } from "@/lib/cn";

/* ==================================================================
   AVATAR GUIDE
   Anshuman and Shraddha walk the guest through the invitation.

   Two kinds of appearance:
   - <AvatarGuide>     stands in the flow, at a moment that is about them
   - <AvatarCompanion> hugs a section's edge and travels with the scroll

   Both keep a slow walking idle — a short bob on one period and a
   longer sway on another, so the cycle never looks mechanical.

   Neither is ever wrapped in <Reveal>: a variant-driven parent takes
   over its motion children, which would freeze the walk. They handle
   their own arrival instead.

   The illustrations are full-length, so everything here is sized by
   *height*. The two drawings differ in width; matching heights is
   what keeps the pair standing at the same scale.
   ================================================================== */

export type AvatarWho = "bride" | "groom" | "both";
type Tone = "light" | "ink";
type Size = "xs" | "sm" | "md" | "lg";

/** Heights, matched to the `h-*` utilities below. */
const SIZE: Record<Size, { cls: string; px: number }> = {
  xs: { cls: "h-20 sm:h-24", px: 96 },
  sm: { cls: "h-28 sm:h-36", px: 144 },
  md: { cls: "h-40 sm:h-52", px: 208 },
  lg: { cls: "h-56 sm:h-72", px: 288 },
};

/* ------------------------------------------------------------------ */
/* The figure itself                                                   */
/* ------------------------------------------------------------------ */

function Figure({
  person,
  tone,
  size,
  priority,
}: {
  person: "bride" | "groom";
  tone: Tone;
  size: Size;
  priority: boolean;
}) {
  const config = person === "bride" ? weddingConfig.bride : weddingConfig.groom;
  const { avatar } = config;
  const { cls, px } = SIZE[size];

  return (
    <span className={cn("relative flex items-end justify-center", cls)}>
      {/* The pool of shadow that keeps the figure standing on something. */}
      <span
        aria-hidden="true"
        className="absolute bottom-[1%] left-1/2 h-[5%] w-[80%] -translate-x-1/2 rounded-[50%] blur-[6px]"
        style={{
          background:
            tone === "light"
              ? "radial-gradient(ellipse, rgba(205,176,131,0.30), rgba(205,176,131,0))"
              : "radial-gradient(ellipse, rgba(58,15,29,0.24), rgba(58,15,29,0))",
        }}
      />

      {avatar ? (
        <Image
          src={avatar.src}
          alt=""
          width={avatar.width}
          height={avatar.height}
          sizes={`${px * 2}px`}
          priority={priority}
          placeholder={avatar.blurDataURL ? "blur" : "empty"}
          blurDataURL={avatar.blurDataURL}
          className="relative h-full w-auto max-w-none object-contain"
        />
      ) : (
        <DrawnFallback person={person} tone={tone} />
      )}
    </span>
  );
}

/** Used only if the illustrations go missing — never a broken image. */
function DrawnFallback({ person, tone }: { person: "bride" | "groom"; tone: Tone }) {
  const Art = person === "bride" ? BrideArt : GroomArt;
  return (
    <span
      className={cn(
        "relative flex aspect-square h-full items-end justify-center overflow-hidden rounded-full",
        tone === "light" ? "frame-gold-dark" : "frame-gold",
      )}
      style={{
        color: tone === "light" ? "var(--color-gold-soft)" : "var(--color-gold-deep)",
        background:
          tone === "light"
            ? "radial-gradient(circle at 50% 22%, rgba(176,141,87,0.20), rgba(58,15,29,0.55))"
            : "radial-gradient(circle at 50% 22%, rgba(248,243,233,1), rgba(228,216,193,0.85))",
      }}
    >
      <Art className="h-[92%] w-auto" />
    </span>
  );
}

/** The walking idle. Two periods, deliberately coprime-ish. */
function Walker({
  children,
  active,
  phase = 0,
}: {
  children: React.ReactNode;
  active: boolean;
  phase?: number;
}) {
  if (!active) return <span className="block">{children}</span>;

  return (
    <motion.span
      className="block will-change-transform"
      animate={{ y: [0, -6, 0, -5, 0], rotate: [-1.6, 1.6, -1.6] }}
      transition={{
        y: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: phase },
        rotate: {
          duration: 6.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: phase,
        },
      }}
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Inline — stands in the flow                                         */
/* ------------------------------------------------------------------ */

export function AvatarGuide({
  who,
  tone = "ink",
  size = "md",
  caption = false,
  className,
  priority = false,
}: {
  who: AvatarWho;
  tone?: Tone;
  size?: Size;
  caption?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  const one = (person: "bride" | "groom", phase: number) => (
    <span className="flex flex-col items-center">
      <Walker active={!reduce} phase={phase}>
        <Figure person={person} tone={tone} size={size} priority={priority} />
      </Walker>
      {caption && (
        <span
          className={cn(
            "eyebrow mt-4 block text-center",
            tone === "light" ? "text-gold-soft/80" : "text-ink-soft",
          )}
        >
          {person === "bride" ? weddingConfig.bride.name : weddingConfig.groom.name}
        </span>
      )}
    </span>
  );

  return (
    <motion.span
      className={cn("pointer-events-none block select-none", className)}
      aria-hidden="true"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: EASE_SILK }}
    >
      {who === "both" ? (
        <span className="flex items-end justify-center gap-2 sm:gap-5">
          {one("bride", 0)}
          {one("groom", 0.9)}
        </span>
      ) : (
        one(who, 0)
      )}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Companion — hugs a section edge and travels with the scroll         */
/* ------------------------------------------------------------------ */

export function AvatarCompanion({
  who,
  side,
  tone = "ink",
  size = "xs",
  /** How far the figure travels inwards, in % of its own width. */
  travel = 26,
  /** Vertical drift across the section, in % of its own height. */
  rise = 14,
  className,
}: {
  who: "bride" | "groom";
  side: "left" | "right";
  tone?: Tone;
  size?: Size;
  travel?: number;
  rise?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  /* Progress across the figure's own passage through the viewport —
     0 as it appears from below, 1 as it leaves the top. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const eased = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001,
  });

  /* The figure is anchored flush to its edge and only ever travels
     *inwards*, so no part of it can leave the page. Anchoring plus a
     one-directional range is what guarantees that — clamping after the
     fact would still let a wide figure hang off a narrow screen. */
  const sign = side === "left" ? 1 : -1;
  const x = useTransform(eased, [0, 1], ["0%", `${sign * travel}%`]);
  const y = useTransform(eased, [0, 1], [`${rise}%`, `${-rise}%`]);
  const rotate = useTransform(eased, [0, 1], [sign * -3, sign * 3]);
  const opacity = useTransform(eased, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute bottom-[14%] z-[1] select-none",
        side === "left" ? "left-1" : "right-1",
        className,
      )}
    >
      <motion.span
        className="block will-change-transform"
        style={reduce ? { opacity: 0.85 } : { x, y, rotate, opacity }}
      >
        <Walker active={!reduce} phase={side === "left" ? 0 : 1.3}>
          <Figure person={who} tone={tone} size={size} priority={false} />
        </Walker>
      </motion.span>
    </span>
  );
}
