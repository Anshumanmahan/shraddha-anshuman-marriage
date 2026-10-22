/**
 * lib/calendar.ts
 * ------------------------------------------------------------------
 * Turns the wedding into something a guest's calendar understands.
 *
 * One all-day event spanning both days rather than an entry per
 * ceremony: a guest tapping "Save the Date" wants the days blocked out.
 * Every ceremony and time still goes into the description, so nothing
 * is lost.
 *
 * All-day events also sidestep timezones entirely — a guest in London
 * sees 20–21 November, not something shifted by five and a half hours.
 *
 * Google only: it is what the guest list actually uses, and a template
 * URL needs no download, no file to open and no explaining.
 * ------------------------------------------------------------------
 */

import { weddingConfig, getVenue } from "@/wedding.config";

/** `YYYYMMDD`, the format Google wants for an all-day event. */
function stamp(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

/** Google treats the end date as exclusive, so this is the day after. */
function dayAfter(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return stamp(date.toISOString().slice(0, 10));
}

export interface WeddingCalendarEvent {
  title: string;
  /** Inclusive first day, `YYYYMMDD`. */
  start: string;
  /** Exclusive last day, `YYYYMMDD`. */
  end: string;
  location: string;
  description: string;
}

/** The whole celebration, written out for a calendar entry. */
export function weddingCalendarEvent(): WeddingCalendarEvent {
  const { groom, bride, dates, site } = weddingConfig;

  const schedule = weddingConfig.days
    .map((day) => {
      const venue = getVenue(day.venueId);
      const events = day.events
        .map((event) => {
          const when = [event.time, event.subtitle].filter(Boolean).join(" · ");
          return `  • ${event.title}${when ? ` — ${when}` : ""}`;
        })
        .join("\n");
      return `${day.date} — ${venue.name}, ${venue.address}\n${events}`;
    })
    .join("\n\n");

  const description = [
    "With love, joy and the blessings of our families, we invite you to celebrate with us.",
    "",
    schedule,
    "",
    `Invitation: ${site.url}`,
  ].join("\n");

  const primary = getVenue(weddingConfig.days[0].venueId);

  return {
    title: `${bride.name} & ${groom.name} — Wedding Celebrations`,
    start: stamp(dates.firstCelebration),
    end: dayAfter(dates.weddingDay),
    location: `${primary.name}, ${primary.address}`,
    description,
  };
}

/* ------------------------------------------------------------------ */
/* Google Calendar                                                     */
/* ------------------------------------------------------------------ */

/** Opens Google Calendar with the event pre-filled, ready to save. */
export function googleCalendarUrl(): string {
  const event = weddingCalendarEvent();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.start}/${event.end}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
