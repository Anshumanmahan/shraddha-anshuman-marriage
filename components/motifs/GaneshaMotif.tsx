import Image from "next/image";
import { weddingConfig } from "@/wedding.config";
import { cn } from "@/lib/cn";

/* ==================================================================
   THE CEREMONIAL PLATE
   Ganesha, seated inside a temple arch of our own drawing, on a lotus
   base, under a mandala of rays.

   The artwork's black field was turned into graded transparency by the
   asset script, so its golden halo bleeds into the burgundy ground
   rather than sitting on a black rectangle. The arch, the rays and the
   lotus are the same gold line-art used everywhere else — which is
   what stops a supplied illustration from reading as an import.
   ================================================================== */

const GOLD = "var(--color-gold-soft)";

export function GaneshaMotif({ className }: { className?: string }) {
  const art = weddingConfig.invocation.ganeshaArtwork;

  return (
    <div className={cn("relative aspect-[320/440]", className)}>
      {/* Halo, carrying the artwork's own light out into the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[42%] h-[86%] w-[104%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(232,190,108,0.26) 0%, rgba(214,160,80,0.10) 42%, rgba(176,141,87,0) 72%)",
        }}
      />

      {/* Arch, rays and lotus */}
      <svg
        viewBox="0 0 320 440"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="gan-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0c894" stopOpacity="0.95" />
            <stop offset="68%" stopColor="#b08d57" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#b08d57" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Radiance */}
        <g stroke={GOLD} strokeWidth="0.5">
          {Array.from({ length: 36 }, (_, i) => i * 10).map((a) => (
            <path
              key={a}
              d="M160 46 V22"
              transform={`rotate(${a} 160 200)`}
              opacity={a % 30 === 0 ? 0.5 : 0.22}
            />
          ))}
        </g>
        <g stroke={GOLD} strokeWidth="0.6" opacity="0.26">
          <circle cx="160" cy="200" r="150" />
          <circle cx="160" cy="200" r="142" strokeDasharray="1 7" />
        </g>

        {/* Temple arch */}
        <path
          d="M54 392 V196 A106 106 0 0 1 266 196 V392"
          stroke="url(#gan-arch)"
          strokeWidth="1.5"
        />
        <path
          d="M68 392 V198 A92 92 0 0 1 252 198 V392"
          stroke={GOLD}
          strokeWidth="0.7"
          opacity="0.45"
        />

        {/* Finial */}
        <g stroke={GOLD} strokeWidth="1">
          <path d="M160 74 C152 84 152 96 160 104 C168 96 168 84 160 74 Z" />
          <path d="M160 66 V74" strokeLinecap="round" />
          <circle cx="160" cy="62" r="2.4" fill={GOLD} stroke="none" />
        </g>

        {/* Lotus base */}
        <g stroke={GOLD} strokeWidth="0.9">
          {[-56, -28, 0, 28, 56].map((a, i) => (
            <path
              key={a}
              d="M160 348 C150 362 150 382 160 396 C170 382 170 362 160 348 Z"
              opacity={i === 2 ? 0.9 : 0.55}
              transform={`rotate(${a} 160 398)`}
            />
          ))}
          <path d="M100 402 H220" opacity="0.65" />
          <path d="M116 410 H204" strokeWidth="0.5" opacity="0.38" />
        </g>
        <circle cx="160" cy="402" r="2" fill={GOLD} />
      </svg>

      {/* The deity */}
      {art ? (
        <Image
          src={art.src}
          alt={art.alt ?? "Shree Ganesha"}
          width={art.width}
          height={art.height}
          sizes="(max-width: 768px) 66vw, 420px"
          priority
          placeholder={art.blurDataURL ? "blur" : "empty"}
          blurDataURL={art.blurDataURL}
          className="absolute bottom-[13%] left-1/2 h-[70%] w-auto -translate-x-1/2 object-contain"
        />
      ) : (
        <span
          className="deva absolute inset-x-0 top-[38%] text-center leading-none"
          style={{ fontSize: "26%", color: "var(--color-gold-pale)" }}
          aria-hidden="true"
        >
          ॐ
        </span>
      )}

      {!art && <span className="sr-only">Shree Ganesha — invocation</span>}
    </div>
  );
}
