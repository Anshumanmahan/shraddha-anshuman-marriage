import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { weddingConfig } from "@/wedding.config";

/* ==================================================================
   SOCIAL PREVIEW
   The card that appears when the link is pasted into WhatsApp. It is
   the first thing most guests will ever see of this invitation, so it
   is composed rather than cropped from the page.

   Satori is not a browser: only simple, well-supported CSS here —
   linear gradients, explicit edges, no shorthand `inset` — and it
   cannot decode WebP, so the medallion is read from the PNG copy that
   `npm run assets` emits alongside it. Paths are written out in full
   so Turbopack traces three files rather than the whole project.

   No RSVP or family detail on this surface — it is public.
   ================================================================== */

export const alt = weddingConfig.site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#cdb083";
const GOLD_PALE = "#e3d2b0";
const GOLD_DEEP = "#b08d57";

export default async function OpengraphImage() {
  const [logo, serif, serifBold] = await Promise.all([
    readFile(
      path.join(process.cwd(), "assets", "og", "monogram.png"),
    ).catch(() => null),
    readFile(
      path.join(process.cwd(), "assets", "fonts", "CormorantGaramond-400.ttf"),
    ),
    readFile(
      path.join(process.cwd(), "assets", "fonts", "CormorantGaramond-600.ttf"),
    ),
  ]);

  const logoSrc = logo
    ? `data:image/png;base64,${logo.toString("base64")}`
    : null;

  const edge = (offset: number, weight: number, opacity: number) => ({
    position: "absolute" as const,
    top: offset,
    right: offset,
    bottom: offset,
    left: offset,
    border: `${weight}px solid ${GOLD_DEEP}`,
    opacity,
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, #6b1e33 0%, #4a1425 54%, #2d0b16 100%)",
          color: GOLD_PALE,
          position: "relative",
          fontFamily: "Cormorant Garamond",
        }}
      >
        <div style={edge(26, 2, 0.55)} />
        <div style={edge(38, 1, 0.28)} />

        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} width={164} height={164} alt="" />
        ) : null}

        <div
          style={{
            fontSize: 25,
            letterSpacing: 13,
            textTransform: "uppercase",
            color: GOLD,
            marginTop: 32,
          }}
        >
          The Wedding Of
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 94,
            fontWeight: 600,
            marginTop: 14,
            color: GOLD_PALE,
          }}
        >
          <span>{weddingConfig.groom.name}</span>
          <span style={{ fontSize: 60, color: GOLD, marginLeft: 26, marginRight: 26 }}>
            &amp;
          </span>
          <span>{weddingConfig.bride.name}</span>
        </div>

        <div
          style={{
            width: 300,
            height: 1,
            backgroundColor: GOLD_DEEP,
            opacity: 0.75,
            marginTop: 34,
          }}
        />

        <div
          style={{
            fontSize: 29,
            letterSpacing: 9,
            textTransform: "uppercase",
            color: GOLD,
            marginTop: 30,
          }}
        >
          {weddingConfig.dates.display}
        </div>

        <div
          style={{
            fontSize: 21,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: GOLD,
            opacity: 0.62,
            marginTop: 14,
          }}
        >
          Agra
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant Garamond", data: serif, weight: 400, style: "normal" },
        {
          name: "Cormorant Garamond",
          data: serifBold,
          weight: 600,
          style: "normal",
        },
      ],
    },
  );
}
