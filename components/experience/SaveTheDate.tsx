"use client";

import { Divider, Jaali, LotusCrest } from "@/components/motifs/Ornaments";
import { AvatarGuide } from "@/components/ui/AvatarGuide";
import { Reveal } from "@/components/ui/Reveal";
import { Countdown } from "@/components/experience/Countdown";
import { drawRule, fadeUp, scaleIn } from "@/lib/motion";
import { countdownTargetMs, weddingConfig } from "@/wedding.config";

/* ==================================================================
   SAVE THE DATE
   The second dark beat of the film. Deep ground, one big date, and a
   countdown that never shows a negative number.
   ================================================================== */

export function SaveTheDate() {
  return (
    <section
      id="save-the-date"
      aria-labelledby="save-the-date-heading"
      className="ground-deep grain grain-dark vignette relative overflow-hidden px-5 py-24 sm:px-8 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-gold-soft opacity-[0.055]"
      >
        <Jaali id="std-jaali" tone="var(--color-gold-soft)" />
      </div>

      <div className="relative z-[2] mx-auto flex max-w-3xl flex-col items-center text-center">
        <Reveal className="flex justify-center">
          <LotusCrest tone="var(--color-gold-soft)" className="h-9 w-14 opacity-75" />
        </Reveal>

        <Reveal as="span" delay={0.06} className="eyebrow mt-6 text-gold-soft/75">
          Save the Date
        </Reveal>

        <Reveal delay={0.12} variants={fadeUp}>
          <h2
            id="save-the-date-heading"
            className="display mt-6 text-[clamp(2.3rem,11vw,5.2rem)] leading-[0.95] text-gold-pale"
          >
            20 <span className="text-gold-soft/60">—</span> 21
          </h2>
          <p className="title mt-4 text-[clamp(0.85rem,3.4vw,1.15rem)] uppercase tracking-[0.4em] text-gold-soft/85">
            November 2026
          </p>
        </Reveal>

        <Reveal delay={0.2} variants={drawRule} className="mt-9 w-full max-w-[240px]">
          <Divider tone="var(--color-gold-soft)" className="w-full opacity-80" />
        </Reveal>

        <Reveal delay={0.26} variants={fadeUp}>
          <p className="display mt-8 text-[clamp(1.5rem,6.4vw,2.6rem)] text-gold-pale/95">
            {weddingConfig.groom.name}
            <span className="mx-2 align-middle text-[0.6em] italic text-gold-soft sm:mx-3">
              &amp;
            </span>
            {weddingConfig.bride.name}
          </p>
        </Reveal>

        <Reveal delay={0.34} variants={scaleIn} className="mt-14 flex w-full justify-center">
          <Countdown targetMs={countdownTargetMs} tone="light" />
        </Reveal>

        <AvatarGuide who="both" tone="light" size="md" className="mt-16" />
      </div>
    </section>
  );
}
