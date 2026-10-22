"use client";

import Image from "next/image";
import { useState } from "react";
import { CornerFlourish, LotusCrest } from "@/components/motifs/Ornaments";
import { cn } from "@/lib/cn";

/* ==================================================================
   PHOTO FRAME
   Renders a photograph when one exists, and a composed ornamental
   panel when it does not — including when a supplied file fails to
   load. Guests never see a broken image icon.
   ================================================================== */

type PhotoFrameProps = {
  src: string | null;
  /** Inline preview so the photograph fades up instead of popping in. */
  blurDataURL?: string;
  alt: string;
  /** Shown inside the placeholder so it is obvious what belongs here. */
  label: string;
  tone?: "light" | "ink";
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Hide the label text — for decorative slots where a caption would jar. */
  quiet?: boolean;
};

export function PhotoFrame({
  src,
  blurDataURL,
  alt,
  label,
  tone = "ink",
  className,
  sizes = "(max-width: 768px) 92vw, 45vw",
  priority = false,
  quiet = false,
}: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        tone === "light" ? "frame-gold-dark" : "frame-gold",
        className,
      )}
    >
      {showPhoto ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <Placeholder label={label} tone={tone} quiet={quiet} />
      )}
    </div>
  );
}

function Placeholder({
  label,
  tone,
  quiet,
}: {
  label: string;
  tone: "light" | "ink";
  quiet: boolean;
}) {
  const light = tone === "light";
  const gold = light ? "var(--color-gold-soft)" : "var(--color-gold)";

  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{
        background: light
          ? "linear-gradient(150deg, rgba(85,23,42,0.55), rgba(41,10,20,0.85))"
          : "linear-gradient(150deg, #f2ead9 0%, #e7dbc3 52%, #ddcdb0 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{ backgroundImage: "var(--grain)" }}
      />

      {/* Corners */}
      <CornerFlourish
        tone={gold}
        className="absolute left-3 top-3 h-10 w-10 opacity-45"
      />
      <CornerFlourish
        tone={gold}
        className="absolute right-3 top-3 h-10 w-10 -scale-x-100 opacity-45"
      />
      <CornerFlourish
        tone={gold}
        className="absolute bottom-3 left-3 h-10 w-10 -scale-y-100 opacity-45"
      />
      <CornerFlourish
        tone={gold}
        className="absolute bottom-3 right-3 h-10 w-10 -scale-100 opacity-45"
      />

      <div className="relative z-1 flex flex-col items-center gap-3 px-6 text-center">
        <LotusCrest tone={gold} className="h-8 w-12 opacity-70" />
        {!quiet && (
          <span
            className="eyebrow"
            style={{
              color: light ? "var(--color-gold-soft)" : "var(--color-gold-deep)",
              opacity: 0.72,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
