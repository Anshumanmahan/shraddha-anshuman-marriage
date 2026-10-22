"use client";

import { Fragment } from "react";

import { Divider, LotusCrest } from "@/components/motifs/Ornaments";
import { AvatarGuide } from "@/components/ui/AvatarGuide";
import { Reveal } from "@/components/ui/Reveal";
import { drawRule, fadeUp } from "@/lib/motion";
import { weddingConfig, type FamilySide } from "@/wedding.config";

/* ==================================================================
   FAMILY BLESSINGS
   The names on the invitation, set with the room they deserve, in two
   halves — one per family, each headed by its own avatar. Side by side
   from tablet width up, with a thin gold rule between them; stacked on
   a phone. The lists are factual — transcribed as supplied and never
   reordered.
   ================================================================== */

export function FamilyBlessings() {
  const { heading, sides } = weddingConfig.family;

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

      <div className="relative z-[2] mx-auto flex max-w-5xl flex-col items-center text-center">
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

        <div className="mt-10 grid w-full divide-y divide-gold/30 md:mt-14 md:grid-cols-2 md:divide-x md:divide-y-0">
          {sides.map((side, i) => (
            <FamilyHalf key={side.who} side={side} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FamilyHalf({ side, index }: { side: FamilySide; index: number }) {
  const headingId = `blessings-${side.who}`;

  return (
    <div
      aria-labelledby={headingId}
      role="group"
      className="flex flex-col items-center py-12 first:pt-0 last:pb-0 md:px-8 md:py-0 lg:px-12"
    >
      <AvatarGuide who={side.who} tone="ink" size="sm" />

      <Reveal delay={0.08} variants={fadeUp}>
        <h3
          id={headingId}
          className="title mt-6 text-[0.8rem] uppercase tracking-[0.3em] text-maroon"
        >
          {side.label}
        </h3>
      </Reveal>

      <ul className="mt-8 flex w-full flex-col items-center gap-5">
        {side.members.map((member, i) => (
          <Reveal
            as="li"
            key={member}
            delay={0.14 + index * 0.08 + i * 0.05}
            amount={0.2}
            className="w-full"
          >
            <p className="display mx-auto max-w-[32ch] text-balance text-[clamp(1rem,4.2vw,1.25rem)] leading-snug text-ink">
              <MemberName text={member} />
            </p>
            {i < side.members.length - 1 && (
              <span
                aria-hidden="true"
                className="mx-auto mt-5 block h-px w-10 bg-gold/35"
              />
            )}
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

/**
 * A couple ("Mr. A & Smt B") wraps only at the ampersand, so neither
 * person's name is ever split across two lines. A list of names — the
 * cousins' line, with commas — wraps normally.
 */
function MemberName({ text }: { text: string }) {
  if (text.includes(",")) return <>{text}</>;
  const people = text.split(" & ");
  return (
    <>
      {people.map((person, i) => (
        <Fragment key={person}>
          <span className="whitespace-nowrap">{person}</span>
          {i < people.length - 1 && " & "}
        </Fragment>
      ))}
    </>
  );
}
