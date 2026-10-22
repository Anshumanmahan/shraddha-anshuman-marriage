"use client";

import { Divider, Jaali, Mandala } from "@/components/motifs/Ornaments";
import { AvatarGuide } from "@/components/ui/AvatarGuide";
import { SaveTheDateButton } from "@/components/ui/SaveTheDateButton";
import { ShareButton } from "@/components/ui/ShareButton";
import { Reveal } from "@/components/ui/Reveal";
import { drawRule, fadeUp } from "@/lib/motion";
import { weddingConfig, venueList } from "@/wedding.config";

/* ==================================================================
   THE CLOSING
   The last thing a guest sees, and the note the whole invitation
   should rest on: both hosts, both names, the dates, and one clear
   way to answer.
   ================================================================== */

const cities = venueList.map((venue) => venue.city).join(" & ");

export function FinalSection() {
  return (
    <section
      id="closing"
      aria-labelledby="closing-heading"
      className="ground-deep grain grain-dark vignette relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-16 sm:px-8 md:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
      >
        <Mandala className="animate-slow-spin h-full w-full" tone="var(--color-gold-soft)" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-gold-soft opacity-[0.04]"
      >
        <Jaali id="closing-jaali" tone="var(--color-gold-soft)" />
      </div>

      <div className="relative z-[2] flex w-full max-w-2xl flex-col items-center text-center">
        <AvatarGuide who="both" tone="light" size="md" />

        <Reveal delay={0.12} variants={fadeUp}>
          <h2
            id="closing-heading"
            className="display mt-8 text-[clamp(2.1rem,10vw,4.4rem)] leading-[1.02] text-gold-pale"
          >
            {weddingConfig.bride.name}
            <span className="mx-3 align-middle text-[0.55em] italic text-gold-soft">
              &amp;
            </span>
            {weddingConfig.groom.name}
          </h2>
        </Reveal>

        <Reveal delay={0.2} variants={drawRule} className="mt-6 w-full max-w-[240px]">
          <Divider tone="var(--color-gold-soft)" className="w-full opacity-80" />
        </Reveal>

        <Reveal
          as="p"
          delay={0.26}
          className="display mt-7 max-w-[30ch] text-[clamp(1.05rem,4.4vw,1.4rem)] italic leading-relaxed text-gold-pale/85"
        >
          With love, joy and the blessings of our families, we invite you to
          celebrate with us.
        </Reveal>

        <Reveal delay={0.34} className="mt-9 flex flex-col items-center gap-3">
          <span className="title text-[clamp(0.82rem,3.6vw,1.05rem)] uppercase tracking-[0.34em] text-gold-soft">
            {weddingConfig.dates.display}
          </span>
          <span aria-hidden="true" className="h-px w-10 bg-gold-soft/40" />
          <span className="eyebrow text-gold-soft/65">{cities}</span>
        </Reveal>

        <Reveal
          delay={0.42}
          className="mt-10 flex w-full flex-col items-center gap-7 sm:flex-row sm:items-start sm:justify-center sm:gap-12"
        >
          <SaveTheDateButton tone="light" />

          <a href="#rsvp" className="btn btn-ghost-light">
            Send Your Reply
          </a>
        </Reveal>

        {/* Quieter, and below the two: passing the invitation on is what
            a guest might do after replying, not instead of it. */}
        <Reveal delay={0.5} className="mt-8">
          <ShareButton tone="light" />
        </Reveal>
      </div>

      <Reveal delay={0.5} className="relative z-[2] mt-12">
        <p className="eyebrow text-center text-gold-soft/35">
          {weddingConfig.monogram.left} &amp; {weddingConfig.monogram.right}
          <span className="mx-3">·</span>
          {new Date(weddingConfig.dates.firstCelebration).getFullYear()}
        </p>
      </Reveal>
    </section>
  );
}
