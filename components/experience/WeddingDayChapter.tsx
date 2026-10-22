"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Divider, LotusCrest } from "@/components/motifs/Ornaments";
import { AvatarCompanion, AvatarGuide } from "@/components/ui/AvatarGuide";
import { EventCard } from "@/components/experience/EventCard";
import { Reveal } from "@/components/ui/Reveal";
import { drawRule, fadeUp } from "@/lib/motion";
import { getVenue, type WeddingDay } from "@/wedding.config";

/* ==================================================================
   A DAY OF THE JOURNEY
   Each day is its own chapter with its own rail, so the headings sit
   in clear air instead of having a line run through them. A dotted
   connector between chapters keeps the journey continuous.
   ================================================================== */

export function WeddingDayChapter({
  day,
  index,
  isLast,
}: {
  day: WeddingDay;
  index: number;
  isLast: boolean;
}) {
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const venue = getVenue(day.venueId);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.78", "end 0.62"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
  const dotTop = useTransform(drawn, [0, 1], ["0%", "100%"]);
  const dotOpacity = useTransform(drawn, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);

  /* The couple step in for the wedding day itself — once, not everywhere. */
  const showAvatars = day.id === "day-21";

  return (
    <section
      aria-labelledby={`${day.id}-heading`}
      className="relative overflow-hidden"
    >
      {index > 0 && <ChapterConnector />}

      {/* Shraddha keeps the guest company down the first chapter; the
          couple step in together for the wedding day itself. */}
      {!showAvatars && (
        <AvatarCompanion
          who={day.venueId === "agra" ? "bride" : "groom"}
          side={day.venueId === "agra" ? "left" : "right"}
          size="xs"
          className="bottom-[22%] hidden sm:block"
        />
      )}

      {/* ---- Chapter head ---- */}
      <header className="flex flex-col items-center px-5 text-center">
        {showAvatars && (
          <AvatarGuide who="both" tone="ink" size="md" className="mb-8" />
        )}

        <Reveal>
          <LotusCrest className="h-8 w-12 opacity-75" />
        </Reveal>

        <Reveal as="span" delay={0.06} className="eyebrow mt-5 text-gold-deep/85">
          {day.dateShort}
        </Reveal>

        <Reveal delay={0.1} variants={fadeUp}>
          <h3
            id={`${day.id}-heading`}
            className="display mt-4 text-[clamp(1.9rem,8.2vw,3.4rem)] leading-[1.02] text-burgundy"
          >
            {day.chapter}
          </h3>
        </Reveal>

        <Reveal delay={0.16} variants={drawRule} className="mt-6 w-full max-w-[200px]">
          <Divider className="w-full opacity-75" />
        </Reveal>

        <Reveal as="p" delay={0.2} className="title mt-6 text-[0.82rem] uppercase tracking-[0.32em] text-maroon">
          {day.date}
        </Reveal>

        <Reveal as="p" delay={0.26} className="mt-3 text-[0.86rem] leading-relaxed text-ink-soft">
          {venue.name}
          <span className="mx-2 text-gold/60">·</span>
          {venue.address}
        </Reveal>

        <Reveal as="p" delay={0.32} className="display mt-6 max-w-[34ch] text-[1.05rem] italic leading-relaxed text-ink-faint">
          {day.chapterLine}
        </Reveal>
      </header>

      {/* ---- Rail + events ---- */}
      <div
        ref={railRef}
        className="relative mx-auto mt-12 w-full max-w-5xl px-5 [--rail:22px] sm:px-8 md:mt-16 md:[--rail:50%]"
      >
        {/* Unlit rail */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-[calc(var(--rail)+1.25rem)] w-px -translate-x-1/2 bg-gold/20 sm:left-[calc(var(--rail)+2rem)] md:left-[var(--rail)]"
        />

        {/* Lit rail — draws as the guest descends */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-[calc(var(--rail)+1.25rem)] w-px -translate-x-1/2 sm:left-[calc(var(--rail)+2rem)] md:left-[var(--rail)]"
        >
          <motion.span
            className="block h-full w-full origin-top bg-linear-to-b from-gold-deep via-gold to-gold/30"
            style={reduce ? undefined : { scaleY: drawn }}
          />
        </span>

        {/* Leading edge */}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute left-[calc(var(--rail)+1.25rem)] z-[2] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(176,141,87,0.55)] sm:left-[calc(var(--rail)+2rem)] md:left-[var(--rail)]"
            style={{ top: dotTop, opacity: dotOpacity }}
          />
        )}

        <div className="relative">
          {day.events.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              venue={venue}
              date={day.date}
              side={i % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>
      </div>

      {!isLast && <div className="h-6" />}
    </section>
  );
}

/** The dotted thread that keeps one day tied to the next. */
function ChapterConnector() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center py-14 md:py-20">
      <span className="block h-14 w-px bg-linear-to-b from-gold/0 via-gold/45 to-gold/45" />
      <span className="my-2 block h-2 w-2 rotate-45 border border-gold/70" />
      <span className="block h-14 w-px bg-linear-to-b from-gold/45 via-gold/45 to-gold/0" />
    </div>
  );
}
