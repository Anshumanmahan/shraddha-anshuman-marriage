"use client";

import { MotionConfig } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EnvelopeIntro } from "@/components/experience/EnvelopeIntro";
import { GaneshaIntro } from "@/components/experience/GaneshaIntro";
import { CoupleHero } from "@/components/experience/CoupleHero";
import { InvitationSection } from "@/components/experience/InvitationSection";
import { SaveTheDate } from "@/components/experience/SaveTheDate";
import { WeddingJourney } from "@/components/experience/WeddingJourney";
import { VenueSection } from "@/components/experience/VenueSection";
import { RSVPSection } from "@/components/experience/RSVPSection";
import { FamilyBlessings } from "@/components/experience/FamilyBlessings";
import { FinalSection } from "@/components/experience/FinalSection";
import { FallingLeaves } from "@/components/ui/FallingLeaves";
import { MusicToggle, type MusicHandle } from "@/components/ui/MusicToggle";

/* ==================================================================
   WEDDING EXPERIENCE
   One continuous invitation. The sections are rendered from the start
   so the page is complete for search engines, link previews and
   screen readers; the envelope simply sits over them until it is
   opened.

   Scroll is *held* while sealed, not hijacked — the moment the
   envelope goes, the page behaves like any other page.
   ================================================================== */

export function WeddingExperience() {
  const [revealed, setRevealed] = useState(false);
  const [envelopeGone, setEnvelopeGone] = useState(false);

  /* A reload should return the guest to the envelope, not drop them
     halfway down the page behind it. */
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (envelopeGone) delete root.dataset.sealed;
    else root.dataset.sealed = "true";
    return () => {
      delete root.dataset.sealed;
    };
  }, [envelopeGone]);

  const music = useRef<MusicHandle>(null);

  /* Called from inside the tap on the seal, so the browser still counts
     it as a user gesture and lets the music begin. */
  const onOpenTap = useCallback(() => music.current?.start(), []);
  const onReveal = useCallback(() => setRevealed(true), []);
  const onDismissed = useCallback(() => setEnvelopeGone(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <EnvelopeIntro
        onOpenTap={onOpenTap}
        onReveal={onReveal}
        onDismissed={onDismissed}
      />

      {/* Sealed content is inert, so a keyboard never wanders behind
          the envelope. */}
      <main inert={!envelopeGone ? true : undefined}>
        <GaneshaIntro started={revealed} />
        <CoupleHero />
        <InvitationSection />
        <SaveTheDate />
        <WeddingJourney />
        <VenueSection />
        <RSVPSection />
        <FamilyBlessings />
        <FinalSection />
      </main>

      <FallingLeaves active={envelopeGone} />
      <MusicToggle ref={music} visible={envelopeGone} />
    </MotionConfig>
  );
}
