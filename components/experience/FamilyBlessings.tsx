"use client";

import { Divider, LotusCrest } from "@/components/motifs/Ornaments";
import { AvatarCompanion } from "@/components/ui/AvatarGuide";
import { Reveal } from "@/components/ui/Reveal";
import { drawRule, fadeUp } from "@/lib/motion";
import { weddingConfig } from "@/wedding.config";

/* ==================================================================
   FAMILY BLESSINGS
   The names on the invitation, set with the room they deserve. This
   list is factual — transcribed from the card and never reordered.
   ================================================================== */

export function FamilyBlessings() {
  const { heading, members } = weddingConfig.family;

  return (
    <section
      id="blessings"
      aria-labelledby="blessings-heading"
      className="relative overflow-hidden bg-parchment px-5 py-24 sm:px-8 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: "var(--grain)" }}
      />

      {/* Sits in the section's bottom padding, clear of the names. */}
      <AvatarCompanion who="groom" side="right" size="xs" className="bottom-2" />

      <div className="relative z-[2] mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal>
          <LotusCrest className="h-9 w-14 opacity-75" />
        </Reveal>

        <Reveal delay={0.06} variants={fadeUp}>
          <h2
            id="blessings-heading"
            className="display mt-6 text-[clamp(1.8rem,7.5vw,3rem)] leading-tight text-burgundy"
          >
            {heading}
          </h2>
        </Reveal>

        <Reveal delay={0.12} variants={drawRule} className="mt-6 w-full max-w-[200px]">
          <Divider className="w-full opacity-75" />
        </Reveal>

        <Reveal as="p" delay={0.18} className="eyebrow mt-8 text-ink-faint">
          R.S.V.P.
        </Reveal>

        <ul className="mt-8 flex w-full flex-col items-center gap-6">
          {members.map((member, i) => (
            <Reveal
              as="li"
              key={member}
              delay={0.2 + i * 0.06}
              amount={0.2}
              className="w-full"
            >
              <p className="display text-[clamp(1.02rem,4.4vw,1.35rem)] leading-snug text-ink">
                {member}
              </p>
              {i < members.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-auto mt-6 block h-px w-10 bg-gold/35"
                />
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
