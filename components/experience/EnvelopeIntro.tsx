"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Damask } from "@/components/motifs/Damask";
import {
  CornerFlourish,
  Divider,
  Jaali,
  LotusCrest,
} from "@/components/motifs/Ornaments";
import { Monogram } from "@/components/motifs/Monogram";
import { EASE_PAPER, EASE_SILK } from "@/lib/motion";
import { weddingConfig } from "@/wedding.config";

/* ==================================================================
   THE ENVELOPE
   Full bleed: the screen *is* the envelope, not a picture of one.
   Deep burgundy stock with an embossed damask, edge to edge; a wide
   shallow flap folding down to a wax seal; and the ivory invitation
   waiting inside. The contrast between dark paper and bright card is
   the whole point of the opening.

   Built in 3D — interior, card, front pocket, flap — with depth
   ordered by translateZ inside a preserve-3d stage rather than
   z-index, so the flap physically swings behind the paper as it opens.

   Three structural rules hold the illusion together:
   - Depth lives on plain wrapper elements, because motion overwrites
     `transform` on anything it animates.
   - The flap's rotation must compose *before* its depth offset
     (rotateX · translateZ), so the rotor and the lift are separate
     elements. Reverse that order and the flap opens in front of the
     envelope instead of behind it.
   - Every animated part drives itself from `state` rather than
     inheriting a variant label through the plain depth wrappers, and
     the small state-driven touches (the press, the label, the bloom)
     are CSS. Nothing here depends on propagation, so the depth
     wrappers are free to be plain elements.
   ================================================================== */

/* --- Geometry -------------------------------------------------------
   A real envelope flap is a rectangle with a shallow V along its
   bottom, not a triangle: the top corners are still paper. The flap's
   V and the pocket's inverted V are cut from the same two numbers, so
   the two shapes tile the screen with no seam and nothing behind them
   can ever leak through.

   SHOULDER  where the V begins at the left and right edges
   POINT     where the V meets, and where the seal sits
   ------------------------------------------------------------------ */
const SHOULDER = 31;
const POINT = 54;

/** The V's depth expressed inside each piece's own box, as a %. */
const FLAP_SHOULDER = (SHOULDER / POINT) * 100;
const POCKET_POINT = ((POINT - SHOULDER) / (100 - SHOULDER)) * 100;

const FLAP_CLIP = `polygon(0% 0%, 100% 0%, 100% ${FLAP_SHOULDER}%, 50% 100%, 0% ${FLAP_SHOULDER}%)`;
const POCKET_CLIP = `polygon(0% 0%, 50% ${POCKET_POINT}%, 100% 0%, 100% 100%, 0% 100%)`;

/** Depth of each layer, in px, within the envelope's 3D space. */
const Z = { back: 0, card: 3, pocket: 9, flap: 15, seal: 22 };

const STOCK_TOP = "#7c2a3d";
const STOCK_MID = "#66212f";
const STOCK_LOW = "#4d1724";
const CARD_TOP = "#fdf8ef";
const CARD_MID = "#f7eeda";
const CARD_LOW = "#f0e4ca";

/* --- Choreography -------------------------------------------------- */

const sealV: Variants = {
  closed: { opacity: 1, scale: 1, y: 0, rotate: 0 },
  open: {
    opacity: 0,
    scale: 1.55,
    y: -18,
    rotate: 8,
    transition: { duration: 0.85, ease: EASE_SILK, delay: 0.14 },
  },
};

const flapV: Variants = {
  closed: { rotateX: 0 },
  open: {
    rotateX: -176,
    transition: { duration: 1.45, ease: EASE_PAPER, delay: 0.36 },
  },
};

const cardV: Variants = {
  closed: { y: "0%", scale: 1 },
  open: {
    y: "-34%",
    scale: 1.04,
    transition: { duration: 1.4, ease: EASE_SILK, delay: 1.25 },
  },
};

const pocketV: Variants = {
  closed: { y: 0 },
  open: { y: 34, transition: { duration: 1.5, ease: EASE_SILK, delay: 1.25 } },
};

const stageV: Variants = {
  closed: { scale: 1 },
  open: { scale: 1.2, transition: { duration: 1.7, ease: EASE_SILK, delay: 1.7 } },
};

/** When the sections beneath begin, and when the overlay leaves. */
const REVEAL_AT = 2200;
const DISMISS_AT = 3400;

type EnvelopeIntroProps = {
  /**
   * Fires synchronously inside the tap itself. Anything that needs the
   * browser to see a user gesture — starting the music, above all — has
   * to happen here rather than on a later timer.
   */
  onOpenTap?: () => void;
  /** Fires while the overlay is still fading, so the page can begin. */
  onReveal: () => void;
  /** Fires once the overlay has gone. */
  onDismissed: () => void;
};

export function EnvelopeIntro({
  onOpenTap,
  onReveal,
  onDismissed,
}: EnvelopeIntroProps) {
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pressed, setPressed] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const held = timers.current;
    return () => held.forEach(window.clearTimeout);
  }, []);

  const open = useCallback(() => {
    if (opening) return;
    setOpening(true);

    /* Still inside the gesture. The music has to be started from here:
       a timer would lose the user activation and iOS would refuse it. */
    onOpenTap?.();

    // Reduced motion still gets the moment of opening — just not the flight.
    const reveal = reduce ? 140 : REVEAL_AT;
    const dismiss = reduce ? 560 : DISMISS_AT;

    timers.current.push(
      window.setTimeout(onReveal, reveal),
      window.setTimeout(() => {
        setVisible(false);
        onDismissed();
      }, dismiss),
    );
  }, [opening, reduce, onOpenTap, onReveal, onDismissed]);

  const state = opening ? "open" : "closed";

  return (
    <>
      {visible && (
        <motion.div
          /* Stops taking input the moment it starts leaving, so the fading
             overlay can never swallow a tap meant for the page beneath.
             No AnimatePresence here on purpose: an exit transition would
             inherit the long opening delay and keep a full-screen layer
             mounted for seconds after it had already gone invisible. */
          className={`fixed inset-0 z-50 overflow-hidden bg-oxblood ${
            opening ? "pointer-events-none" : ""
          }`}
          /* The seal's size drives the label above it and the names
             below it. Sizing in vmin rather than vw keeps it generous
             on a laptop without swamping a phone, and deriving the
             text offsets from it means they cannot collide at any
             aspect ratio. */
          style={{ "--seal": "clamp(128px, 30vmin, 260px)" } as React.CSSProperties}
          initial={{ opacity: 1 }}
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{
            duration: reduce ? 0.4 : 1.0,
            ease: EASE_SILK,
            delay: opening && !reduce ? 2.3 : 0,
          }}
        >
          <motion.div
            className="stage-3d h-full w-full"
            variants={stageV}
            initial="closed"
            animate={reduce ? "closed" : state}
          >
            <div className="preserve-3d relative h-full w-full">
              {/* ---- Inside of the envelope, seen once the flap lifts ---- */}
              <Layer z={Z.back} className="inset-0">
                <Interior />
              </Layer>

              {/* ---- The card waiting inside ---- */}
              <Layer z={Z.card} className="inset-x-[4%] bottom-[6%] top-[7%]">
                <motion.div
                  className="h-full w-full"
                  variants={cardV}
                  initial="closed"
                  animate={state}
                >
                  <InnerCard />
                </motion.div>
              </Layer>

              {/* ---- Front pocket ---- */}
              <Layer
                z={Z.pocket}
                className="inset-x-0 bottom-0"
                style={{ top: `${SHOULDER}%` }}
              >
                <motion.div
                  className="h-full w-full"
                  variants={pocketV}
                  initial="closed"
                  animate={state}
                >
                  <Pocket />
                </motion.div>
              </Layer>

              {/* ---- Flap: rotor carries rotation, lift carries depth ---- */}
              <motion.div
                className="preserve-3d absolute inset-x-0 top-0"
                style={{ height: `${POINT}%`, transformOrigin: "top center" }}
                variants={flapV}
                initial="closed"
                animate={state}
              >
                <div
                  className="preserve-3d absolute inset-0"
                  style={{ transform: `translateZ(${Z.flap}px)` }}
                >
                  <FlapFace />
                  <FlapLiner />
                </div>
              </motion.div>

              {/* ---- Wax seal, at the point of the flap ---- */}
              <Layer z={Z.seal} className="inset-0">
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${POINT}%`, width: "var(--seal)" }}
                >
                  {/* Instruction, riding just above the seal */}
                  <div
                    className={`absolute bottom-[calc(100%+1.4rem)] left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-500 ${
                      opening ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <span className="eyebrow text-gold-pale/85">Tap to Open</span>
                  </div>

                  <motion.div variants={sealV} initial="closed" animate={state}>
                    <div
                      className={`relative transition-transform duration-200 ${
                        pressed && !opening ? "scale-[0.93]" : "scale-100"
                      }`}
                    >
                      {/* Halo */}
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute -inset-[28%] rounded-full ${
                          opening || reduce ? "" : "animate-halo"
                        }`}
                        style={{
                          background:
                            "radial-gradient(circle, rgba(232,205,152,0.32) 0%, rgba(232,205,152,0) 68%)",
                        }}
                      />
                      {/* Pale wax the medallion is pressed into */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-[-9%] rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle at 36% 28%, #fdf6e6 0%, #f0e1c2 58%, #dcc79e 100%)",
                          boxShadow:
                            "0 16px 38px -14px rgba(20,4,10,0.75), inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -6px 12px rgba(150,118,78,0.35)",
                        }}
                      />
                      <div
                        className={
                          !opening && !reduce ? "animate-seal-breathe" : undefined
                        }
                      >
                        <Monogram variant="seal" className="w-full" priority />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Layer>
            </div>
          </motion.div>

          {/* ---- The light as the card comes out ---- */}
          {opening && !reduce && (
            <div
              aria-hidden="true"
              className="animate-bloom pointer-events-none absolute inset-0 z-30"
              style={{
                background:
                  "radial-gradient(circle at 50% 46%, rgba(255,249,236,0.95) 0%, rgba(255,246,226,0.35) 38%, rgba(255,246,226,0) 68%)",
              }}
            />
          )}

          {/* ---- Hit area. Deliberately outside the 3D stage. ---- */}
          <button
            type="button"
            onClick={open}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") setPressed(true);
            }}
            onKeyUp={() => setPressed(false)}
            onBlur={() => setPressed(false)}
            disabled={opening}
            aria-label="Tap to open the wedding invitation of Shraddha and Anshuman"
            className="absolute inset-0 z-20 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-8 focus-visible:outline-gold-soft disabled:cursor-default"
          />
        </motion.div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Envelope parts                                                      */
/* ------------------------------------------------------------------ */

/** Positions a layer at a fixed depth. Never animated — see file header. */
function Layer({
  z,
  className,
  style,
  children,
}: {
  z: number;
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ ...style, transform: `translateZ(${z}px)` }}
    >
      {children}
    </div>
  );
}

/** Embossed burgundy stock, used by both the flap and the pocket. */
function Stock({ id, gradient }: { id: string; gradient: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div className="absolute inset-0 opacity-[0.5]">
        <Damask id={id} highlight="#a8505f" shadow="#38101b" strength={1.15} />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.09] mix-blend-overlay"
        style={{ backgroundImage: "var(--grain)" }}
      />
    </>
  );
}

/** Outside of the flap — the V that folds down to the seal. */
function FlapFace() {
  return (
    <div
      className="backface-hidden absolute inset-0"
      style={{ clipPath: FLAP_CLIP }}
    >
      <Stock
        id="flap-damask"
        gradient={`linear-gradient(178deg, ${STOCK_TOP} 0%, ${STOCK_MID} 58%, ${STOCK_LOW} 100%)`}
      />

      {/* Fold edges */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d={`M0 ${FLAP_SHOULDER} L50 100 L100 ${FLAP_SHOULDER}`}
          fill="none"
          stroke="var(--color-gold-soft)"
          strokeWidth="1.4"
          opacity="0.85"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M0 ${FLAP_SHOULDER - 3.5} L50 ${96.5} L100 ${FLAP_SHOULDER - 3.5}`}
          fill="none"
          stroke="var(--color-gold-soft)"
          strokeWidth="1"
          opacity="0.34"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Shadow the flap casts on the pocket below */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[24%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,4,10,0) 0%, rgba(20,4,10,0.3) 100%)",
        }}
      />

      <CornerFlourish
        tone="var(--color-gold-soft)"
        className="absolute left-4 top-4 h-12 w-12 opacity-55 sm:h-16 sm:w-16"
      />
      <CornerFlourish
        tone="var(--color-gold-soft)"
        className="absolute right-4 top-4 h-12 w-12 -scale-x-100 opacity-55 sm:h-16 sm:w-16"
      />

      {/* One ornament high on the flap. The names sit below the seal,
          where the eye lands after the tap. */}
      <div className="absolute inset-x-0 top-[15%] flex flex-col items-center px-[18%] text-center">
        <LotusCrest tone="var(--color-gold-soft)" className="h-9 w-14 opacity-65" />
        <span
          className="eyebrow mt-5 text-gold-pale/70"
          style={{ letterSpacing: "0.42em" }}
        >
          The Wedding Of
        </span>
      </div>
    </div>
  );
}

/** Inside of the flap — the patterned liner good stationery hides. */
function FlapLiner() {
  return (
    <div
      className="backface-hidden absolute inset-0 overflow-hidden"
      style={{
        clipPath: FLAP_CLIP,
        transform: "rotateX(180deg)",
        background: "linear-gradient(180deg,#3f1220 0%,#2f0c18 60%,#240811 100%)",
      }}
    >
      <div className="absolute inset-0 text-gold-soft opacity-[0.22]">
        <Jaali id="flap-jaali" tone="var(--color-gold-soft)" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: "var(--grain)" }}
      />
    </div>
  );
}

/** Front pocket — carries the names and the invitation line. */
function Pocket() {
  return (
    <div className="absolute inset-0" style={{ clipPath: POCKET_CLIP }}>
      <Stock
        id="pocket-damask"
        gradient={`linear-gradient(180deg, ${STOCK_MID} 0%, ${STOCK_MID} 34%, ${STOCK_LOW} 100%)`}
      />

      {/* The side flaps folded in behind, and the shadow the flap casts */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d={`M0 0 L50 ${POCKET_POINT} L100 0`}
          fill="none"
          stroke="var(--color-gold-soft)"
          strokeWidth="1"
          opacity="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Below the seal, offset from the V's point by the seal's own
          radius so the two can never overlap. */}
      <div
        className="absolute inset-x-0 mx-auto flex max-w-2xl flex-col items-center px-7 text-center"
        style={{ top: `calc(${POCKET_POINT}% + var(--seal) * 0.62 + 1.4rem)` }}
      >
        <span className="display text-[clamp(1.8rem,9.5vw,3.3rem)] leading-[1.06] text-gold-pale">
          {weddingConfig.bride.name}
        </span>
        <span className="display text-[clamp(1rem,4.6vw,1.7rem)] italic leading-tight text-gold-soft">
          &amp;
        </span>
        <span className="display text-[clamp(1.8rem,9.5vw,3.3rem)] leading-[1.06] text-gold-pale">
          {weddingConfig.groom.name}
        </span>

        <Divider
          tone="var(--color-gold-soft)"
          className="mt-7 w-[52vw] max-w-[260px] opacity-70"
        />
        <span
          className="title mt-6 text-[clamp(0.7rem,3.3vw,0.92rem)] uppercase text-gold-soft/90"
          style={{ letterSpacing: "0.4em", textIndent: "0.4em" }}
        >
          You Are Invited
        </span>
        <span className="eyebrow mt-6 text-gold-pale/55">
          {weddingConfig.dates.displayShort}
        </span>
      </div>

      <CornerFlourish
        tone="var(--color-gold-soft)"
        className="absolute bottom-4 left-4 h-12 w-12 -scale-y-100 opacity-55 sm:h-16 sm:w-16"
      />
      <CornerFlourish
        tone="var(--color-gold-soft)"
        className="absolute bottom-4 right-4 h-12 w-12 -scale-100 opacity-55 sm:h-16 sm:w-16"
      />
    </div>
  );
}

/** The dark inside of the envelope, revealed as the flap lifts. */
function Interior() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-oxblood">
      <div className="absolute inset-0 text-gold-soft opacity-[0.12]">
        <Jaali id="interior-jaali" tone="var(--color-gold-soft)" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 20%, rgba(0,0,0,0.5), transparent 72%)",
        }}
      />
    </div>
  );
}

/** The card waiting inside. */
function InnerCard() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[3px]"
      style={{
        background: `linear-gradient(170deg, ${CARD_TOP} 0%, ${CARD_MID} 55%, ${CARD_LOW} 100%)`,
        boxShadow:
          "0 30px 70px -30px rgba(20,4,10,0.8), inset 0 0 0 1px rgba(176,141,87,0.4)",
      }}
    >
      <div className="absolute inset-0 opacity-[0.3]">
        <Damask id="card-damask" scale={0.75} />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: "var(--grain)" }}
      />
      <div className="frame-gold absolute inset-4 rounded-[2px] sm:inset-6" />

      <div className="absolute inset-x-0 top-[8%] flex flex-col items-center px-10 text-center">
        <div className="w-[26vw] max-w-[130px]">
          <Monogram variant="open" tone="ink" className="w-full" />
        </div>
        <span className="eyebrow mt-6 text-gold-deep/80">
          Together With Our Families
        </span>
        <Divider className="mt-6 w-[40vw] max-w-[200px] opacity-70" />
      </div>
    </div>
  );
}
