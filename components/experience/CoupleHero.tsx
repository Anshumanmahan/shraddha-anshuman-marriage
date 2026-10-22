"use client";

import Image from "next/image";
import { useState } from "react";
import { BrideArt, GroomArt } from "@/components/motifs/AvatarArt";
import { CornerFlourish, Divider, LotusCrest } from "@/components/motifs/Ornaments";
import { Antics, RisingPetals } from "@/components/ui/CoupleAntics";
import { Reveal } from "@/components/ui/Reveal";
import { drawRule, fadeUp, scaleIn } from "@/lib/motion";
import { weddingConfig, type Person } from "@/wedding.config";

/* ==================================================================
   THE COUPLE
   The tonal turn of the whole piece: out of the sacred burgundy and
   into ivory, where the invitation becomes personal.

   The two portraits are a matched pair: same frame, same size, same
   baseline. They are the couple side by side, so any stagger between
   them reads as a mistake rather than as composition.

   The names sit in a single horizontal band with WEDS between them —
   the way the line is set on a printed Indian wedding card — with
   each set of parents beneath their own child. The band holds its
   three columns all the way down to 375px; only the type scales.
   ================================================================== */

const { groom, bride } = weddingConfig;

export function CoupleHero() {
  return (
    <section
      id="couple"
      aria-labelledby="couple-heading"
      className="paper grain relative overflow-hidden px-5 pb-24 pt-20 sm:px-8 md:pb-32 md:pt-28"
    >
      {/* Carries the burgundy down into the paper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-wine to-wine/0 md:h-40"
      />

      <div className="relative z-[2] mx-auto max-w-5xl">
        <Reveal className="flex flex-col items-center text-center">
          <LotusCrest className="h-8 w-12 opacity-70" />
          <span className="eyebrow mt-5 text-gold-deep/85">
            Together With Our Families
          </span>
          <h2 id="couple-heading" className="sr-only">
            Shraddha weds Anshuman
          </h2>
        </Reveal>

        {/* ---- Portraits ---- */}
        <div className="relative mx-auto mt-12 grid max-w-3xl grid-cols-2 items-start gap-x-5 sm:gap-x-10 md:mt-16 md:gap-x-14">
          <RisingPetals className="inset-x-[36%] bottom-0 top-[18%]" />

          <Reveal variants={scaleIn} className="mx-auto w-full max-w-[300px]">
            <PortraitFrame person={bride} role="bride" lean={1} />
          </Reveal>
          <Reveal
            variants={scaleIn}
            delay={0.14}
            className="mx-auto w-full max-w-[300px]"
          >
            <PortraitFrame person={groom} role="groom" lean={-1} antic={1.8} />
          </Reveal>
        </div>

        {/* ---- Names, horizontally, with WEDS between ----
             One grid, two rows: the names share a baseline with WEDS,
             and each set of parents sits directly under its own name. */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-[1fr_auto_1fr] items-baseline gap-x-2 sm:gap-x-5 md:mt-16 md:gap-x-9">
          <Reveal
            variants={fadeUp}
            className="col-start-1 row-start-1 display min-w-0 text-center text-[clamp(1.45rem,7.2vw,3.4rem)] leading-[1.05] text-burgundy"
          >
            {bride.name}
          </Reveal>

          <Reveal
            variants={scaleIn}
            delay={0.16}
            className="col-start-2 row-start-1 flex flex-col items-center self-center"
          >
            <span
              aria-hidden="true"
              className="block h-5 w-px bg-linear-to-b from-gold/0 to-gold/60 sm:h-8"
            />
            <span
              className="title my-2.5 text-[clamp(0.58rem,2.5vw,0.85rem)] uppercase text-gold-deep sm:my-3.5"
              style={{ letterSpacing: "0.28em", textIndent: "0.28em" }}
            >
              Weds
            </span>
            <span
              aria-hidden="true"
              className="block h-5 w-px bg-linear-to-b from-gold/60 to-gold/0 sm:h-8"
            />
          </Reveal>

          <Reveal
            variants={fadeUp}
            delay={0.1}
            className="col-start-3 row-start-1 display min-w-0 text-center text-[clamp(1.45rem,7.2vw,3.4rem)] leading-[1.05] text-burgundy"
          >
            {groom.name}
          </Reveal>

          <Reveal delay={0.16} className="col-start-1 row-start-2 mt-4">
            <Lineage person={bride} />
          </Reveal>

          <Reveal delay={0.22} className="col-start-3 row-start-2 mt-4">
            <Lineage person={groom} />
          </Reveal>
        </div>

        <Reveal delay={0.2} variants={drawRule} className="mt-12 flex justify-center md:mt-16">
          <Divider className="w-[220px] opacity-80" />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Grandparents above parents, the way the senior generation is named
 * first on a printed card. The two sides carry a different number of
 * lines, so each column simply runs as long as it needs to.
 */
function Lineage({ person }: { person: Person }) {
  const line =
    "text-center text-[0.62rem] uppercase leading-relaxed tracking-[0.12em] text-ink-soft sm:text-[0.74rem] sm:tracking-[0.18em]";

  return (
    <div className="flex flex-col gap-1.5">
      {person.grandparents.map((g) => (
        <p key={g.names} className={line}>
          <span className="text-gold-deep">{g.prefix}</span> {g.names}
        </p>
      ))}
      <p className={line}>
        <span className="text-gold-deep">{person.parentsPrefix}</span>{" "}
        {person.parents}
      </p>
    </div>
  );
}

/**
 * A photograph when one exists; otherwise the illustrated avatar standing
 * on parchment; and failing both, drawn line art. The frame never changes,
 * so dropping in a photograph later leaves the composition untouched.
 */
function PortraitFrame({
  person,
  role,
  lean,
  antic = 0,
}: {
  person: Person;
  role: "bride" | "groom";
  /** Which way this figure leans when it hops — towards the other. */
  lean: 1 | -1;
  /** Offsets the hop so the pair never move in lockstep. */
  antic?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(person.portrait) && !failed;
  const Art = role === "bride" ? BrideArt : GroomArt;

  return (
    <div className="frame-gold relative aspect-3/4 w-full overflow-hidden rounded-[2px] bg-parchment shadow-[0_30px_60px_-40px_rgba(58,15,29,0.55)]">
      {showPhoto ? (
        <Image
          src={person.portrait as string}
          alt={person.name}
          fill
          sizes="(max-width: 640px) 44vw, (max-width: 1024px) 40vw, 360px"
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 70% at 50% 22%, #fbf6ec 0%, #efe4cf 55%, #e0d0b0 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
            style={{ backgroundImage: "var(--grain)" }}
          />
          <CornerFlourish className="absolute left-2 top-2 h-8 w-8 opacity-40" />
          <CornerFlourish className="absolute right-2 top-2 h-8 w-8 -scale-x-100 opacity-40" />

          {person.avatar ? (
            /* A definite box, not shrink-to-fit. Sized by height only:
               the two illustrations were normalised to a common canvas
               height, so equal heights put bride and groom at exactly
               the same scale despite their different widths. */
            <Antics
              lean={lean}
              delay={antic}
              className="absolute inset-x-[4%] bottom-[3%] top-[7%] flex items-end justify-center"
            >
              <Image
                src={person.avatar.src}
                alt={person.avatar.alt ?? person.name}
                width={person.avatar.width}
                height={person.avatar.height}
                sizes="(max-width: 640px) 44vw, (max-width: 1024px) 40vw, 360px"
                placeholder={person.avatar.blurDataURL ? "blur" : "empty"}
                blurDataURL={person.avatar.blurDataURL}
                className="h-full w-auto max-w-none object-contain"
              />
            </Antics>
          ) : (
            <span className="absolute inset-x-[14%] bottom-0 top-[10%] text-gold-deep/70">
              <Art className="h-full w-full" />
            </span>
          )}
        </>
      )}
    </div>
  );
}
