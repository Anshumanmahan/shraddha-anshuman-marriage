"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { WeddingDayChapter } from "@/components/experience/WeddingDayChapter";
import { weddingConfig } from "@/wedding.config";

/* ==================================================================
   THE WEDDING JOURNEY
   Three chapters, in order, on paper. The section is the spine of the
   whole invitation — everything factual about the celebrations lives
   here, and it all comes from wedding.config.ts.
   ================================================================== */

export function WeddingJourney() {
  const days = weddingConfig.days;

  return (
    <section
      id="journey"
      aria-labelledby="journey-heading"
      className="paper grain relative overflow-hidden py-24 md:py-32"
    >
      <div className="px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our Celebrations"
          title="The Wedding Journey"
          lede="Two days in Agra. We would love to have you at both of them."
          className="mx-auto max-w-2xl"
        />
      </div>

      <h2 id="journey-heading" className="sr-only">
        The wedding journey
      </h2>

      <div className="mt-20 md:mt-28">
        {days.map((day, i) => (
          <WeddingDayChapter
            key={day.id}
            day={day}
            index={i}
            isLast={i === days.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
