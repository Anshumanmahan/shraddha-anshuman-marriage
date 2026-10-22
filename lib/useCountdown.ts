"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** The target has passed. */
  isPast: boolean;
  /** False during SSR and the first paint, so markup never mismatches. */
  ready: boolean;
}

const IDLE: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isPast: false,
  ready: false,
};

function partsFrom(targetMs: number, now: number): CountdownParts {
  const delta = targetMs - now;
  if (delta <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, ready: true };
  }
  const totalSeconds = Math.floor(delta / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
    ready: true,
  };
}

/**
 * Counts down to an absolute instant.
 *
 * Each tick recomputes from `Date.now()` rather than decrementing, so a
 * throttled background tab or a sleeping phone catches up instantly on
 * return instead of drifting.
 */
export function useCountdown(targetMs: number): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(IDLE);

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return;

    const tick = () => setParts(partsFrom(targetMs, Date.now()));
    tick();

    const id = window.setInterval(tick, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [targetMs]);

  return parts;
}
