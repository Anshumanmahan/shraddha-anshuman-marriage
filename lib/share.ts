/**
 * lib/share.ts
 * ------------------------------------------------------------------
 * The message that travels ahead of the invitation.
 *
 * Written to read the same whether the couple sends it or a cousin
 * forwards it on — no "you're invited", which would be presumptuous
 * coming from a relative rather than from the family.
 *
 * The link sits on its own line so WhatsApp reliably detects it and
 * renders the preview card from the page's OpenGraph tags.
 * ------------------------------------------------------------------
 */

import { weddingConfig, venueList } from "@/wedding.config";

export function shareMessage(): string {
  const { groom, bride, dates, site } = weddingConfig;
  const cities = venueList.map((venue) => venue.city).join(" & ");

  return [
    `${bride.name} & ${groom.name} are getting married.`,
    "",
    `${dates.display} · ${cities}`,
    "",
    site.url,
  ].join("\n");
}

/**
 * `wa.me` opens the WhatsApp app on a phone and WhatsApp Web on a
 * desktop, with the message already composed — the guest only picks who
 * to send it to. Chosen over the native share sheet because it is one
 * step rather than two, and because for this guest list WhatsApp is not
 * one option among many; it is the channel.
 */
export function whatsappShareUrl(): string {
  return `https://wa.me/?text=${encodeURIComponent(shareMessage())}`;
}
