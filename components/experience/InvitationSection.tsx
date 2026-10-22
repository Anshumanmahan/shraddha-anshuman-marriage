"use client";

import { CornerFlourish, Divider, LotusCrest } from "@/components/motifs/Ornaments";
import { AvatarGuide } from "@/components/ui/AvatarGuide";
import { Reveal } from "@/components/ui/Reveal";
import { drawRule, fadeUp, scaleIn } from "@/lib/motion";
import { weddingConfig, venueList } from "@/wedding.config";

/* ==================================================================
   THE INVITATION
   The card itself — the words a printed invitation would carry, set
   inside a bordered plate. Nothing factual is invented here: the
   dates and cities come straight from the configuration.
   ================================================================== */

const cities = venueList.map((venue) => venue.city).join(" & ");

export function InvitationSection() {
  return (
    <section
      id="invitation"
      aria-labelledby="invitation-heading"
      className="relative overflow-hidden bg-parchment px-5 py-24 sm:px-8 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: "var(--grain)" }}
      />

      <Reveal
        variants={scaleIn}
        className="relative z-[2] mx-auto w-full max-w-2xl"
      >
        <article className="frame-gold relative rounded-[2px] bg-ivory px-6 py-14 text-center shadow-[0_40px_90px_-60px_rgba(58,15,29,0.6)] sm:px-12 sm:py-20">
          <CornerFlourish className="absolute left-3 top-3 h-11 w-11 opacity-55 sm:left-5 sm:top-5 sm:h-14 sm:w-14" />
          <CornerFlourish className="absolute right-3 top-3 h-11 w-11 -scale-x-100 opacity-55 sm:right-5 sm:top-5 sm:h-14 sm:w-14" />
          <CornerFlourish className="absolute bottom-3 left-3 h-11 w-11 -scale-y-100 opacity-55 sm:bottom-5 sm:left-5 sm:h-14 sm:w-14" />
          <CornerFlourish className="absolute bottom-3 right-3 h-11 w-11 -scale-100 opacity-55 sm:bottom-5 sm:right-5 sm:h-14 sm:w-14" />

          <Reveal className="flex justify-center">
            <LotusCrest className="h-9 w-14 opacity-80" />
          </Reveal>

          <Reveal as="p" delay={0.08} className="eyebrow mt-6 text-gold-deep/85">
            The Invitation
          </Reveal>

          <h2 id="invitation-heading" className="sr-only">
            The invitation
          </h2>

          <Reveal
            as="p"
            delay={0.14}
            variants={fadeUp}
            className="display mx-auto mt-8 max-w-[26ch] text-[clamp(1.15rem,4.6vw,1.7rem)] italic leading-[1.6] text-ink"
          >
            With the blessings of our families, and with hearts full of joy, we
            ask you to be beside us as we begin our life together.
          </Reveal>

          <Reveal delay={0.22} variants={drawRule} className="mt-10 flex justify-center">
            <Divider className="w-[200px] opacity-80" />
          </Reveal>

          <Reveal delay={0.28} variants={fadeUp}>
            <p className="display mt-9 text-[clamp(1.9rem,8vw,3.1rem)] leading-tight text-burgundy">
              {weddingConfig.bride.name}
              <span className="mx-2 align-middle text-[0.62em] italic text-gold sm:mx-3">
                &amp;
              </span>
              {weddingConfig.groom.name}
            </p>
          </Reveal>

          <Reveal delay={0.36} className="mt-9 flex flex-col items-center gap-2">
            <span className="eyebrow text-ink-soft">
              {weddingConfig.dates.display}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-gold/45"
            />
            <span className="eyebrow text-ink-soft">{cities}</span>
          </Reveal>
        </article>

        {/* Below the card, not beside it: at phone widths the card fills
            the measure, and anything alongside it sits behind the paper. */}
        <AvatarGuide who="both" tone="ink" size="sm" className="mt-12" />
      </Reveal>
    </section>
  );
}
