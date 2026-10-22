import Image from "next/image";
import { weddingConfig } from "@/wedding.config";
import { cn } from "@/lib/cn";

type MonogramProps = {
  className?: string;
  /** `seal` is the pressed medallion on the envelope; `open` sits flat. */
  variant?: "seal" | "open";
  /** `light` sits on a dark ground, `ink` on paper. Drawn fallback only. */
  tone?: "light" | "ink";
  priority?: boolean;
};

/**
 * The couple's mark — the supplied A&S medallion, cropped to its roundel
 * with transparent corners so it reads as a seal on any ground.
 *
 * Falls back to a drawn medallion if the artwork is ever missing, so
 * nothing renders as a broken image.
 */
export function Monogram({
  className,
  variant = "seal",
  tone = "light",
  priority = false,
}: MonogramProps) {
  const { logo } = weddingConfig;
  const sealed = variant === "seal";

  if (logo) {
    return (
      <div className={cn("relative aspect-square select-none", className)}>
        <Image
          src={logo.src}
          alt={logo.alt ?? "Shraddha and Anshuman monogram"}
          width={logo.width}
          height={logo.height}
          sizes="(max-width: 640px) 40vw, 320px"
          priority={priority}
          placeholder={logo.blurDataURL ? "blur" : "empty"}
          blurDataURL={logo.blurDataURL}
          className="h-full w-full object-contain"
          style={
            sealed
              ? {
                  filter:
                    "drop-shadow(0 10px 18px rgba(20,4,10,0.55)) drop-shadow(0 1px 0 rgba(224,200,148,0.35))",
                }
              : undefined
          }
        />
      </div>
    );
  }

  return <DrawnMonogram className={className} sealed={sealed} tone={tone} />;
}

/* ------------------------------------------------------------------ */

function DrawnMonogram({
  className,
  sealed,
  tone,
}: {
  className?: string;
  sealed: boolean;
  tone: "light" | "ink";
}) {
  const { monogram } = weddingConfig;
  const gold = "var(--color-gold-soft)";

  return (
    <div
      className={cn("relative aspect-square select-none", className)}
      style={{ containerType: "inline-size" }}
    >
      {sealed && (
        <>
          <div
            className="absolute inset-[6%] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 34% 28%, #8d2b42 0%, #6b1e33 38%, #4a1425 76%, #380f1c 100%)",
              boxShadow:
                "0 10px 30px -12px rgba(41,10,20,0.85), inset 0 1px 2px rgba(224,200,148,0.28), inset 0 -6px 14px rgba(20,4,10,0.55)",
            }}
          />
          <div
            className="absolute inset-[6%] rounded-full opacity-[0.13] mix-blend-overlay"
            style={{ backgroundImage: "var(--grain)" }}
          />
        </>
      )}

      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <g stroke={sealed || tone === "light" ? gold : "var(--color-gold)"}>
          <circle cx="100" cy="100" r="97" strokeWidth="0.9" opacity="0.5" />
          <circle cx="100" cy="100" r="86" strokeWidth="1.1" opacity="0.85" />
          <circle cx="100" cy="100" r="80" strokeWidth="0.6" opacity="0.45" />
          <circle cx="100" cy="100" r="63" strokeWidth="0.6" opacity="0.35" />
        </g>

        {Array.from({ length: 48 }, (_, i) => i * 7.5).map((a) => (
          <circle
            key={a}
            cx="100"
            cy="8.5"
            r="1"
            fill={sealed ? gold : "var(--color-gold)"}
            opacity="0.45"
            transform={`rotate(${a} 100 100)`}
          />
        ))}

        {Array.from({ length: 16 }, (_, i) => i * 22.5).map((a) => (
          <path
            key={`p${a}`}
            d="M100 66 Q105 76 100 86 Q95 76 100 66 Z"
            stroke={sealed ? gold : "var(--color-gold)"}
            strokeWidth="0.6"
            opacity="0.4"
            transform={`rotate(${a} 100 100)`}
          />
        ))}
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div
          className="display flex items-baseline leading-none"
          style={{
            fontSize: "34cqw",
            color: sealed
              ? "var(--color-gold-pale)"
              : tone === "light"
                ? "var(--color-gold-soft)"
                : "var(--color-gold-deep)",
            textShadow: sealed ? "0 1px 1px rgba(30,6,14,0.5)" : "none",
          }}
        >
          <span style={{ letterSpacing: "0.02em" }}>{monogram.left}</span>
          <span
            className="italic"
            style={{ fontSize: "0.62em", margin: "0 0.1em", opacity: 0.82 }}
          >
            &amp;
          </span>
          <span style={{ letterSpacing: "0.02em" }}>{monogram.right}</span>
        </div>
      </div>

      <span className="sr-only">Shraddha and Anshuman</span>
    </div>
  );
}
