"use client";

import { LotusCrest } from "@/components/motifs/Ornaments";
import { useCountdown } from "@/lib/useCountdown";
import { cn } from "@/lib/cn";

/* ==================================================================
   COUNTDOWN
   Set like a piece of stationery rather than a digital clock: serif
   numerals, letterspaced labels, hairline gold separators.

   The target is passed in — this component never knows a date.
   ================================================================== */

type CountdownProps = {
  targetMs: number;
  tone?: "light" | "ink";
  className?: string;
};

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

export function Countdown({ targetMs, tone = "light", className }: CountdownProps) {
  const { days, hours, minutes, seconds, isPast, ready } = useCountdown(targetMs);
  const light = tone === "light";

  if (ready && isPast) {
    return (
      <div className={cn("flex flex-col items-center text-center", className)}>
        <LotusCrest
          tone={light ? "var(--color-gold-soft)" : "var(--color-gold)"}
          className="h-10 w-16 opacity-85"
        />
        <p
          className={cn(
            "display mt-5 text-[clamp(1.4rem,6vw,2.2rem)] italic",
            light ? "text-gold-pale" : "text-burgundy",
          )}
        >
          The celebrations have begun.
        </p>
        <p
          className={cn(
            "eyebrow mt-4",
            light ? "text-gold-soft/70" : "text-ink-soft",
          )}
        >
          Thank you for being part of them
        </p>
      </div>
    );
  }

  /* Before hydration the values are unknown — hold the layout with rules
     rather than zeros, so nothing jumps and nothing mismatches. */
  const values = ready ? [days, hours, minutes, seconds] : [null, null, null, null];

  return (
    <div
      className={cn("w-full max-w-lg", className)}
      role="timer"
      aria-live="off"
      aria-label={
        ready
          ? `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds until the celebrations begin`
          : "Counting down to the celebrations"
      }
    >
      <div className="grid grid-cols-4">
        {UNITS.map((unit, i) => (
          <div
            key={unit}
            className={cn(
              "flex flex-col items-center px-1 sm:px-2",
              i > 0 && "border-l",
              light ? "border-gold-soft/25" : "border-gold/30",
            )}
          >
            <Digit value={values[i]} light={light} />
            <span
              className={cn(
                "eyebrow mt-3",
                light ? "text-gold-soft/65" : "text-ink-soft",
              )}
              style={{ fontSize: "0.56rem", letterSpacing: "0.3em" }}
            >
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * One numeral. The roll is a CSS animation replayed by changing the
 * React key, rather than an AnimatePresence pair.
 *
 * That matters here: the countdown ticks from first paint, including
 * while the envelope is still sealed, and a motion parent that has not
 * yet run its own variant will hold its children — leaving every
 * second's numeral stranded in the DOM. One keyed element per cell
 * cannot accumulate, and costs nothing.
 */
function Digit({ value, light }: { value: number | null; light: boolean }) {
  const text =
    value === null ? "––" : String(value).padStart(value > 99 ? 3 : 2, "0");

  return (
    <span
      className={cn(
        "display relative block h-[1.12em] w-full overflow-hidden text-center text-[clamp(2rem,10vw,3.4rem)] leading-[1.12] font-[400]",
        light ? "text-gold-pale" : "text-burgundy",
      )}
      aria-hidden="true"
    >
      <span
        key={text}
        className="animate-digit absolute inset-0 flex items-center justify-center"
      >
        {text}
      </span>
    </span>
  );
}
