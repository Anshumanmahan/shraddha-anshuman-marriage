"use client";

import { Divider } from "@/components/motifs/Ornaments";
import { Reveal } from "@/components/ui/Reveal";
import { drawRule, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  /** One quiet line of context beneath the rule. */
  lede?: string;
  tone?: "light" | "ink";
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "ink",
  align = "center",
  className,
}: SectionHeadingProps) {
  const light = tone === "light";

  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && (
        <Reveal
          as="span"
          className={cn(
            "eyebrow",
            light ? "text-gold-soft/75" : "text-gold-deep/80",
          )}
        >
          {eyebrow}
        </Reveal>
      )}

      <Reveal
        as="div"
        delay={0.08}
        variants={fadeUp}
        className={cn(
          "display mt-4 text-[clamp(2rem,7vw,3.4rem)]",
          light ? "text-gold-pale" : "text-burgundy",
        )}
      >
        <h2>{title}</h2>
      </Reveal>

      <Reveal
        delay={0.18}
        variants={drawRule}
        className={cn(
          "mt-5 w-full",
          align === "center" ? "max-w-[220px]" : "max-w-[160px]",
        )}
      >
        <Divider
          tone={light ? "var(--color-gold-soft)" : "var(--color-gold)"}
          className="w-full"
        />
      </Reveal>

      {lede && (
        <Reveal
          as="p"
          delay={0.26}
          className={cn(
            "mt-5 max-w-[46ch] text-[0.95rem] leading-relaxed text-balance-tight",
            light ? "text-gold-pale/70" : "text-ink-soft",
          )}
        >
          {lede}
        </Reveal>
      )}
    </div>
  );
}
