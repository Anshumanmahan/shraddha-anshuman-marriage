/**
 * lib/rsvp.ts
 * ------------------------------------------------------------------
 * The single seam between the RSVP UI and wherever replies are stored.
 *
 * Components call `submitRSVP()` and nothing else — no fetch calls live
 * in the interface layer. To plug in a real backend, either:
 *
 *   1. set NEXT_PUBLIC_RSVP_ENDPOINT to a URL that accepts a JSON POST
 *      — the Google Apps Script web app in scripts/rsvp-sheet.gs is the
 *      one this project is set up for, but a Supabase edge function, a
 *      Next route handler or Formspree would all work, or
 *   2. write a new adapter below and return it from `resolveAdapter()`.
 *
 * Nothing else in the app has to change.
 * ------------------------------------------------------------------
 */

import { weddingConfig } from "@/wedding.config";

export type Attendance = "yes" | "no";

export interface RSVPPayload {
  name: string;
  attendance: Attendance;
  /** Only meaningful when attending. */
  guests?: number;
  phone?: string;
  message?: string;
}

export interface RSVPRecord extends RSVPPayload {
  submittedAt: string;
  /** Which invitation the reply came from — the sheet's Event column. */
  event: string;
}

/** An error safe to show a guest — never a raw stack or status code. */
export class RSVPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RSVPError";
  }
}

const GENERIC_FAILURE =
  "We could not record your reply just now. Please try once more in a moment.";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type RSVPErrors = Partial<Record<keyof RSVPPayload, string>>;

/** Loose on purpose — guests write phone numbers a dozen different ways. */
const PHONE = /^[+]?[\d\s()-]{7,20}$/;

export function validateRSVP(payload: RSVPPayload, maxGuests: number): RSVPErrors {
  const errors: RSVPErrors = {};

  const name = payload.name.trim();
  if (name.length < 2) errors.name = "Please tell us your name.";
  else if (name.length > 80) errors.name = "That name is a little too long.";

  if (payload.attendance === "yes") {
    const guests = payload.guests ?? 1;
    if (!Number.isInteger(guests) || guests < 1 || guests > maxGuests) {
      errors.guests = `Please choose between 1 and ${maxGuests}.`;
    }

    const phone = (payload.phone ?? "").trim();
    if (!phone) errors.phone = "A number helps us reach you.";
    else if (!PHONE.test(phone)) errors.phone = "That does not look like a phone number.";
  }

  if ((payload.message ?? "").length > 600) {
    errors.message = "Please keep your note under 600 characters.";
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/* Adapters                                                            */
/* ------------------------------------------------------------------ */

export interface RSVPAdapter {
  readonly id: string;
  send(record: RSVPRecord): Promise<void>;
}

/**
 * Google Apps Script web apps do not answer CORS preflight requests.
 * Sending `application/json` triggers one, and the reply never arrives —
 * so for those endpoints the body goes as text/plain, which the browser
 * treats as a simple request and sends straight through. Apps Script
 * reads the raw body either way (`e.postData.contents`), so nothing is
 * lost. Every other endpoint gets a normal JSON content type.
 */
function contentTypeFor(endpoint: string): string {
  try {
    const { hostname } = new URL(endpoint);
    if (hostname === "script.google.com" || hostname.endsWith(".googleusercontent.com")) {
      return "text/plain;charset=utf-8";
    }
  } catch {
    // A malformed endpoint will fail at fetch() with a clear message.
  }
  return "application/json";
}

/**
 * How long to wait before giving up. Generous: an Apps Script web app
 * that has gone cold can take the better part of ten seconds to answer,
 * and a guest on hotel wifi deserves more room than that. The point is
 * only that the wait ends — without this, a request that never settles
 * leaves the button reading "Sending…" for good, with no way back.
 */
const TIMEOUT_MS = 25_000;

/** POSTs the reply as JSON to a configured endpoint. */
function httpAdapter(endpoint: string): RSVPAdapter {
  return {
    id: "http",
    async send(record) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": contentTypeFor(endpoint) },
          body: JSON.stringify(record),
          redirect: "follow", // Apps Script answers with a 302 to its runner
          signal: controller.signal,
        });
      } catch (error) {
        const timedOut =
          error instanceof DOMException && error.name === "AbortError";
        throw new RSVPError(
          timedOut
            ? "That took longer than expected. Please try sending your reply again."
            : "We could not reach the internet. Please check your connection and try again.",
        );
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) throw new RSVPError(GENERIC_FAILURE);
    },
  };
}

const STORAGE_KEY = "wedding.rsvp.replies";

/**
 * Development fallback. Keeps replies in localStorage so the whole flow —
 * including the confirmation state — can be exercised before a backend
 * exists. Replaced the moment NEXT_PUBLIC_RSVP_ENDPOINT is set.
 */
function localAdapter(): RSVPAdapter {
  return {
    id: "local",
    async send(record) {
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const existing: RSVPRecord[] = raw ? JSON.parse(raw) : [];
        existing.push(record);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch {
        // A full or blocked storage quota must not fail the guest's RSVP.
      }

      if (process.env.NODE_ENV !== "production") {
        console.info(
          "[RSVP] No NEXT_PUBLIC_RSVP_ENDPOINT configured — reply stored locally only.",
          record,
        );
      }
    },
  };
}

/**
 * NEXT_PUBLIC_RSVP_ENDPOINT sends replies onward; without it they stay
 * in the guest's own browser so the flow can still be exercised.
 */
function resolveAdapter(): RSVPAdapter {
  const endpoint = process.env.NEXT_PUBLIC_RSVP_ENDPOINT;
  return endpoint ? httpAdapter(endpoint) : localAdapter();
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function submitRSVP(payload: RSVPPayload): Promise<void> {
  const record: RSVPRecord = {
    name: payload.name.trim(),
    attendance: payload.attendance,
    guests: payload.attendance === "yes" ? (payload.guests ?? 1) : undefined,
    phone: payload.attendance === "yes" ? payload.phone?.trim() : undefined,
    message: payload.message?.trim() || undefined,
    submittedAt: new Date().toISOString(),
    event: weddingConfig.rsvp.event,
  };

  try {
    await resolveAdapter().send(record);
  } catch (error) {
    if (error instanceof RSVPError) throw error;
    throw new RSVPError(GENERIC_FAILURE);
  }
}

/** True once this browser has already replied — used to soften repeat visits. */
export function hasRepliedLocally(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}
