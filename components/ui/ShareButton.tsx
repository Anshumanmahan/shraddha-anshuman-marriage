import { whatsappShareUrl } from "@/lib/share";
import { cn } from "@/lib/cn";

/* ==================================================================
   SHARE
   How this invitation actually travels: one relative forwarding it to
   the next.

   Deliberately quieter than Save the Date and Send Your Reply — those
   are what a guest came to do; this is what they might do afterwards.
   The glyph carries the meaning, so the label does not have to explain
   which app it opens.

   No WhatsApp green: the brand colour would fight the burgundy and gold
   and drag a corporate mark into a wedding card.
   ================================================================== */

export function ShareButton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "ink";
}) {
  return (
    <a
      href={whatsappShareUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 transition-colors duration-300",
        tone === "light"
          ? "border-gold-soft/30 text-gold-soft/75 hover:border-gold-soft/60 hover:text-gold-pale"
          : "border-gold/30 text-ink-soft hover:border-gold/60 hover:text-gold-deep",
        className,
      )}
    >
      <WhatsAppGlyph />
      <span className="eyebrow">Share with Family</span>
      <span className="sr-only"> — opens WhatsApp in a new tab</span>
    </a>
  );
}

/** A handset inside a speech bubble — read at a glance, no wordmark. */
function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 11.7a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.4-4.6A8.4 8.4 0 1 1 20.5 11.7Z" />
      <path d="M9.4 8.6c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.3 0 .5-.1.7l-.4.5c-.1.2-.2.3-.1.5a5 5 0 0 0 2.4 2.3c.2.1.4 0 .5-.1l.5-.5c.2-.2.4-.2.6-.1l1.5.8c.4.2.4.4.4.6v.5c0 .3-.1.5-.6.7a3 3 0 0 1-2 .1 9 9 0 0 1-5.2-5.1 3 3 0 0 1 0-2.5Z" />
    </svg>
  );
}
