import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Favicon — the monogram, drawn large enough to read in a tab. */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const serif = await readFile(
    path.join(process.cwd(), "assets/fonts/CormorantGaramond-600.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#55172a",
          color: "#e3d2b0",
          fontFamily: "Cormorant Garamond",
          fontSize: 42,
          borderRadius: 12,
          border: "2px solid #b08d57",
        }}
      >
        A
        <span style={{ fontSize: 26, color: "#cdb083", margin: "0 1px" }}>
          &
        </span>
        S
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: serif,
          weight: 600,
          style: "normal",
        },
      ],
    },
  );
}
