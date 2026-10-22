"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CeremonyIcon } from "@/components/motifs/EventIcons";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { EASE_SILK } from "@/lib/motion";
import type { Venue, WeddingEvent } from "@/wedding.config";
import { cn } from "@/lib/cn";

/* ==================================================================
   EVENT CARD
   One ceremony, attached to the timeline by an illuminated node.

   "Active" means the card is crossing the middle band of the screen —
   detected with IntersectionObserver, not a scroll listener, and
   allowed to turn off again so the journey reads as a moving present.
   ================================================================== */

type EventCardProps = {
  event: WeddingEvent;
  venue: Venue;
  /** Repeated on the card so a screenshot of one card still makes sense. */
  date: string;
  /** Which side of the rail this sits on, from `md` upwards. */
  side: "left" | "right";
};

export function EventCard({ event, venue, date, side }: EventCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const right = side === "right";

  return (
    <div ref={ref} className="relative py-5 md:grid md:grid-cols-2 md:py-7">
      {/* Node on the rail */}
      <TimelineNode icon={event.icon} active={active} />

      <motion.article
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.85, ease: EASE_SILK }}
        className={cn(
          "pl-[68px] md:pl-0",
          right ? "md:col-start-2 md:pl-16" : "md:col-start-1 md:pr-16 md:text-right",
        )}
      >
        <div
          className={cn(
            "frame-gold relative rounded-[2px] bg-ivory/80 px-5 py-6 backdrop-blur-[1px] transition-shadow duration-500 sm:px-7 sm:py-8",
            active
              ? "shadow-[0_26px_54px_-34px_rgba(58,15,29,0.5)]"
              : "shadow-[0_14px_34px_-30px_rgba(58,15,29,0.35)]",
          )}
        >
          <p className="eyebrow text-gold-deep/75">{date}</p>

          <h4 className="display mt-3 text-[clamp(1.45rem,6vw,2.15rem)] leading-tight text-burgundy">
            {event.title}
          </h4>

          {(event.time || event.subtitle) && (
            <div
              className={cn(
                "mt-4 flex flex-wrap items-center gap-x-3 gap-y-1",
                right ? "md:justify-start" : "justify-start md:justify-end",
              )}
            >
              {event.time && (
                <span className="title text-[0.92rem] tracking-[0.2em] text-maroon">
                  {event.time}
                </span>
              )}
              {event.time && event.subtitle && (
                <span aria-hidden="true" className="h-3 w-px bg-gold/50" />
              )}
              {event.subtitle && (
                <span className="eyebrow text-ink-soft">{event.subtitle}</span>
              )}
            </div>
          )}

          <div
            className={cn(
              "mt-5 flex items-center gap-3",
              right ? "md:justify-start" : "justify-start md:justify-end",
            )}
          >
            <span aria-hidden="true" className="h-px w-6 bg-gold/45" />
            <p className="text-[0.86rem] leading-snug text-ink-soft">
              {venue.name}
              <span className="block text-ink-faint">{venue.address}</span>
            </p>
          </div>

          {event.description && (
            <p className="mt-5 text-[0.92rem] leading-relaxed text-ink-soft">
              {event.description}
            </p>
          )}

          {event.image && (
            <PhotoFrame
              src={event.image}
              alt={event.title}
              label={`${event.title} photograph`}
              className="mt-6 aspect-16/10 w-full rounded-[2px]"
              sizes="(max-width: 768px) 82vw, 40vw"
            />
          )}
        </div>
      </motion.article>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TimelineNode({
  icon,
  active,
}: {
  icon: WeddingEvent["icon"];
  active: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[var(--rail)] top-9 z-[3] -translate-x-1/2 md:top-1/2 md:-translate-y-1/2"
    >
      <motion.div
        animate={{ scale: active ? 1.06 : 1 }}
        transition={{ duration: 0.6, ease: EASE_SILK }}
        className="relative grid h-11 w-11 place-items-center rounded-full sm:h-13 sm:w-13"
      >
        {/* Halo */}
        <motion.span
          className="absolute -inset-2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(176,141,87,0.34) 0%, rgba(176,141,87,0) 70%)",
          }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE_SILK }}
        />

        <motion.span
          className="absolute inset-0 rounded-full border"
          animate={{
            backgroundColor: active ? "#55172a" : "#f8f3e9",
            borderColor: active ? "#b08d57" : "rgba(176,141,87,0.5)",
          }}
          transition={{ duration: 0.55, ease: EASE_SILK }}
        />

        <motion.span
          className="relative h-[58%] w-[58%]"
          animate={{ color: active ? "#e3d2b0" : "#b08d57" }}
          transition={{ duration: 0.55, ease: EASE_SILK }}
        >
          <CeremonyIcon name={icon} />
        </motion.span>
      </motion.div>
    </div>
  );
}
