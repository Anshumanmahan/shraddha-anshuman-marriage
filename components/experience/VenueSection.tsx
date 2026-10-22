"use client";

import { CeremonyIcon } from "@/components/motifs/EventIcons";
import { AvatarGuide } from "@/components/ui/AvatarGuide";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, scaleIn } from "@/lib/motion";
import { daysAtVenue, venueList, venueMapsUrl, type Venue } from "@/wedding.config";
import { cn } from "@/lib/cn";

/* ==================================================================
   THE VENUE
   One place, with the days that happen there and a single
   unambiguous way to get directions. No embedded map — a full-width
   iframe would dominate the page and cost more than it gives.
   ================================================================== */

export function VenueSection() {
  return (
    <section
      id="venues"
      aria-labelledby="venues-heading"
      className="relative overflow-hidden bg-parchment px-5 py-24 sm:px-8 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: "var(--grain)" }}
      />

      <div className="relative z-[2] mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Where To Find Us"
          title="The Venue"
          lede="Everything you need to reach us, in one place."
          className="mx-auto max-w-2xl"
        />
        <h2 id="venues-heading" className="sr-only">
          The venue
        </h2>

        <div className="mt-16 flex flex-col gap-14 md:mt-24 md:gap-20">
          {venueList.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function VenueCard({ venue, flip }: { venue: Venue; flip: boolean }) {
  const days = daysAtVenue(venue.id);
  const mapsUrl = venueMapsUrl(venue);

  return (
    <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <Reveal
        variants={scaleIn}
        className={cn("relative", flip && "md:order-2")}
      >
        <PhotoFrame
          src={venue.image?.src ?? null}
          blurDataURL={venue.image?.blurDataURL}
          alt={venue.image?.alt ?? `${venue.name}, ${venue.address}`}
          label={`${venue.name} — venue photograph`}
          className="aspect-4/3 w-full rounded-[2px] shadow-[0_36px_70px_-48px_rgba(58,15,29,0.6)]"
          sizes="(max-width: 768px) 92vw, 46vw"
        />

        {/* Both hosts stand at the venue, anchored to the photograph so
            they keep its corner at every width. */}
        <AvatarGuide
          who="both"
          tone="ink"
          size="xs"
          className="absolute -bottom-2 right-1"
        />
      </Reveal>

      <div className={cn(flip && "md:order-1")}>
        <Reveal as="span" className="eyebrow text-gold-deep/85">
          {venue.city}
        </Reveal>

        <Reveal delay={0.06} variants={fadeUp}>
          <h3 className="display mt-4 text-[clamp(1.75rem,7vw,2.8rem)] leading-tight text-burgundy">
            {venue.name}
          </h3>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
            {venue.address}
          </p>
        </Reveal>

        <Reveal delay={0.18} className="mt-7">
          <p className="eyebrow text-ink-faint">Happening Here</p>
          <ul className="mt-5 flex flex-col gap-4">
            {days.map((day) => (
              <li key={day.id}>
                <p className="title text-[0.78rem] uppercase tracking-[0.28em] text-maroon">
                  {day.date}
                </p>
                <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {day.events.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center gap-2 text-[0.9rem] text-ink"
                    >
                      <span className="h-4 w-4 shrink-0 text-gold">
                        <CeremonyIcon name={event.icon} />
                      </span>
                      {event.title}
                      {event.time && (
                        <span className="text-ink-faint">· {event.time}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.24} className="mt-9">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <MapPin />
            View Venue on Map
            <span className="sr-only"> — {venue.name}, opens in a new tab</span>
          </a>
        </Reveal>
      </div>
    </article>
  );
}

function MapPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}
