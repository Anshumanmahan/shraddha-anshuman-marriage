import { googleCalendarUrl } from "@/lib/calendar";
import { cn } from "@/lib/cn";

/* ==================================================================
   SAVE THE DATE
   One tap puts the celebration in the guest's Google Calendar.

   The link carries the whole event pre-filled, so there is nothing to
   download, nothing to open, and no file to find afterwards — it lands
   in whichever account they are already signed into, on the phone they
   are already holding.
   ================================================================== */

export function SaveTheDateButton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "ink";
}) {
  return (
    <a
      href={googleCalendarUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "btn",
        tone === "light" ? "btn-ghost-light" : "btn-ghost",
        className,
      )}
    >
      <CalendarIcon />
      Save the Date
      <span className="sr-only">
        {" "}
        — adds 20 and 21 November 2026 to your Google Calendar, opens in a new
        tab
      </span>
    </a>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
