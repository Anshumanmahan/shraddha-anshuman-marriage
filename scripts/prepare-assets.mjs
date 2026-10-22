/**
 * scripts/prepare-assets.mjs
 * ------------------------------------------------------------------
 * Turns the supplied artwork in ./Avatars&Logos into web-ready assets
 * under ./public/assets. Re-runnable — drop new source files in and
 * run `npm run assets`.
 *
 * Two jobs it does that matter:
 *
 * 1. The avatar PNGs arrived with a *painted* transparency checkerboard
 *    rather than real alpha (sharp reports isOpaque: true). A flood fill
 *    from the borders removes only the connected background, so cream
 *    fabric and pearls inside the figure are never touched.
 *
 * 2. The logo is a circular medallion on an ivory square. It gets
 *    cropped to the medallion and masked to an ellipse, so it can sit
 *    on the burgundy grounds as well as on paper.
 * ------------------------------------------------------------------
 */

import sharp from "sharp";
import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const SRC = "Avatars&Logos";
const OUT = "public/assets";

/** A handful of pixels, inlined, so nothing ever pops in. */
async function blurDataURL(buffer) {
  const tiny = await sharp(buffer)
    .resize({ width: 12, height: 12, fit: "inside" })
    .webp({ quality: 40, alphaQuality: 60 })
    .toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

/* --- Background detection ------------------------------------------ */

/** The painted checkerboard is neutral and light; the artwork is not. */
const isChecker = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 14 && (r + g + b) / 3 >= 150;
};

/**
 * Marks every background pixel reachable from the image border.
 * Connectivity is what keeps the bride's cream lehenga opaque — it is
 * light, but it is fenced in by the figure's dark outline.
 */
function backgroundMask(data, W, H, C) {
  const bg = new Uint8Array(W * H);
  const stack = [];

  const consider = (x, y) => {
    const p = y * W + x;
    if (bg[p]) return;
    const i = p * C;
    if (!isChecker(data[i], data[i + 1], data[i + 2])) return;
    bg[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < W; x++) {
    consider(x, 0);
    consider(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    consider(0, y);
    consider(W - 1, y);
  }

  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p / W) | 0;
    if (x > 0) consider(x - 1, y);
    if (x < W - 1) consider(x + 1, y);
    if (y > 0) consider(x, y - 1);
    if (y < H - 1) consider(x, y + 1);
  }

  return bg;
}

/**
 * Grows the background by one pixel. Anti-aliased pixels where the
 * checkerboard met the figure's outline are neither one thing nor the
 * other; left alone they read as a grey halo.
 */
function dilate(bg, W, H) {
  const grown = Uint8Array.from(bg);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (bg[p]) continue;
      const touching =
        (x > 0 && bg[p - 1]) ||
        (x < W - 1 && bg[p + 1]) ||
        (y > 0 && bg[p - W]) ||
        (y < H - 1 && bg[p + W]);
      if (touching) grown[p] = 1;
    }
  }
  return grown;
}

/* --- Avatars -------------------------------------------------------- */

async function prepareAvatar(name) {
  const file = path.join(SRC, `${name}.png`);
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const bg = dilate(backgroundMask(data, W, H, C), W, H);

  let minX = W;
  let minY = H;
  let maxX = -1;
  let maxY = -1;

  for (let p = 0; p < W * H; p++) {
    if (bg[p]) {
      data[p * C + 3] = 0;
      continue;
    }
    const x = p % W;
    const y = (p / W) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  if (maxX < 0) throw new Error(`${name}: no figure found`);

  const pad = 4;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(W - left, maxX - minX + 1 + pad * 2);
  const height = Math.min(H - top, maxY - minY + 1 + pad * 2);

  const out = path.join(OUT, "avatars", `${name}.webp`);
  const rendered = await sharp(data, { raw: { width: W, height: H, channels: C } })
    .extract({ left, top, width, height })
    .resize({ height: 1100, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 })
    .toBuffer();
  await writeFile(out, rendered);
  const meta = await sharp(rendered).metadata();
  meta.size = rendered.length;
  const blur = await blurDataURL(rendered);

  console.log(
    `  ${name}: ${W}x${H} -> ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(0)} KB  ${out}`,
  );
  return { width: meta.width, height: meta.height, blur };
}

/* --- Ganesha -------------------------------------------------------- */

/**
 * The Ganesha artwork arrives as a lit figure on a black field.
 *
 * A hard cut-out would drop the golden halo and leave the deity looking
 * pasted onto the page. Instead the black is turned into transparency by
 * luminance — pure black goes to nothing, the glow keeps a proportional
 * alpha — while everything the flood fill cannot reach (the figure and
 * anything enclosed by it) stays fully opaque. The halo then bleeds into
 * the burgundy ground the way it bled into the black.
 */
async function prepareGanesha() {
  const file = path.join(SRC, "ganesha.jpeg");
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const luma = (i) =>
    0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

  /* Reachable-from-the-edge darkness is background; the same darkness
     inside the figure's outline is not. */
  const bg = new Uint8Array(W * H);
  const stack = [];
  const consider = (x, y) => {
    const p = y * W + x;
    if (bg[p]) return;
    if (luma(p * C) > 120) return;
    bg[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < W; x++) {
    consider(x, 0);
    consider(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    consider(0, y);
    consider(W - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p / W) | 0;
    if (x > 0) consider(x - 1, y);
    if (x < W - 1) consider(x + 1, y);
    if (y > 0) consider(x, y - 1);
    if (y < H - 1) consider(x, y + 1);
  }

  /* Alpha ramp across the halo, then un-premultiply.
     A glow painted on black is already colour × coverage, so lifting
     alpha alone leaves dark pixels that dim whatever is behind them —
     which showed up as a faint rectangle around the deity on the
     burgundy ground. Dividing the colour back out turns those into
     genuinely light pixels at low alpha, and the halo composites the
     way light should. */
  const LO = 10;
  const HI = 82;
  for (let p = 0; p < W * H; p++) {
    if (!bg[p]) continue;
    const i = p * C;
    const t = Math.min(1, Math.max(0, (luma(i) - LO) / (HI - LO)));
    data[i + 3] = Math.round(255 * t);
    if (t <= 0) continue;
    const k = 1 / Math.max(t, 0.08);
    data[i] = Math.min(255, Math.round(data[i] * k));
    data[i + 1] = Math.min(255, Math.round(data[i + 1] * k));
    data[i + 2] = Math.min(255, Math.round(data[i + 2] * k));
  }

  /* Crop to the deity and its glow. Row/column densities keep the stray
     sparkle in the corner out of the bounding box. */
  const rows = new Int32Array(H);
  const cols = new Int32Array(W);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (luma((y * W + x) * C) < 90) continue;
      rows[y]++;
      cols[x]++;
    }
  }
  const span = (counts, limit) => {
    const floor = Math.max(10, Math.round(limit * 0.03));
    let lo = -1;
    let hi = -1;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] < floor) continue;
      if (lo < 0) lo = i;
      hi = i;
    }
    return [lo, hi];
  };
  const [y0, y1] = span(rows, W);
  const [x0, x1] = span(cols, H);
  if (x1 < 0 || y1 < 0) throw new Error("ganesha: nothing found");

  /* Generous padding so the halo is not clipped. */
  const padX = Math.round((x1 - x0) * 0.16);
  const padY = Math.round((y1 - y0) * 0.12);
  const left = Math.max(0, x0 - padX);
  const top = Math.max(0, y0 - padY);
  const width = Math.min(W - left, x1 - x0 + 1 + padX * 2);
  const height = Math.min(H - top, y1 - y0 + 1 + padY * 2);

  const out = path.join(OUT, "ganesha", "ganesha.webp");
  await mkdir(path.join(OUT, "ganesha"), { recursive: true });
  const rendered = await sharp(data, { raw: { width: W, height: H, channels: C } })
    .extract({ left, top, width, height })
    .resize({ height: 1000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 })
    .toBuffer();
  await writeFile(out, rendered);
  const meta = await sharp(rendered).metadata();
  const blur = await blurDataURL(rendered);

  console.log(
    `  ganesha: ${W}x${H} -> ${meta.width}x${meta.height}  ${(
      rendered.length / 1024
    ).toFixed(0)} KB  ${out}`,
  );
  return { width: meta.width, height: meta.height, blur };
}

/* --- Music ---------------------------------------------------------- */

/**
 * Copies whatever is in ./songs into public/assets/music under web-safe
 * names, and reads a display title back out of each filename. Dropping a
 * new track into the folder and re-running is the whole workflow.
 */
async function prepareMusic() {
  const dir = "songs";
  let files;
  try {
    files = (await readdir(dir)).filter((f) => /\.(mp3|m4a|ogg|aac)$/i.test(f));
  } catch {
    console.log("  music: no ./songs folder — skipping");
    return [];
  }
  if (files.length === 0) {
    console.log("  music: no audio files found");
    return [];
  }

  const out = path.join(OUT, "music");
  await mkdir(out, { recursive: true });

  /* Background music does not need a mastering bitrate. Anything above
     ~160kbps is re-encoded to 128 CBR: inaudible through a phone on a
     wedding page, and less than half the bytes on someone data plan.
     CBR rather than VBR because a random start point seeks more
     accurately in a constant-bitrate stream. */
  const probe = (file, field) => {
    try {
      return parseFloat(
        execFileSync("ffprobe", ["-v","error","-show_entries","format=" + field,
          "-of","default=noprint_wrappers=1:nokey=1", file], { encoding: "utf8" }).trim(),
      );
    } catch {
      return 0;
    }
  };
  const bitrateOf = (file) => probe(file, "bit_rate");

  const tracks = [];
  for (const file of files.sort()) {
    const ext = path.extname(file).toLowerCase();
    const stem = path.basename(file, ext);

    /* Filenames arrive carrying download cruft — bitrates, underscores,
       stray numbering. Neither the URL nor the title should show it. */
    const cleaned = stem
      .replace(/[_]+/g, " ")
      .replace(/\b\d+\s*kbps\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const slug = cleaned
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const title = cleaned.replace(/\b[a-z]/g, (c) => c.toUpperCase());

    const from = path.join(dir, file);
    const to = path.join(out, slug + ext);
    const before = (await stat(from)).size;
    const bitrate = bitrateOf(from);

    if (bitrate > 160_000 && ext === ".mp3") {
      execFileSync("ffmpeg", ["-y","-loglevel","error","-i",from,
        "-codec:a","libmp3lame","-b:a","128k","-ar","44100", to]);
    } else {
      await copyFile(from, to);
    }

    const after = (await stat(to)).size;
    const note =
      after < before
        ? ` (${Math.round(bitrate / 1000)}k -> 128k, ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB)`
        : ` (${(after / 1048576).toFixed(1)}MB)`;

    /* Duration is recorded here so the player never has to download a
       byte just to discover how long the track is. That is what lets
       preload stay at "none" while still starting partway through. */
    tracks.push({
      src: `/assets/music/${slug}${ext}`,
      title,
      duration: Math.round(probe(to, "duration")),
    });
    console.log(`  music: ${slug}${ext}  "${title}"${note}`);
  }
  return tracks;
}

/* --- Venues --------------------------------------------------------- */

/** Straight photographic conversion: resize, strip metadata, encode. */
async function prepareVenue(name, file) {
  const out = path.join(OUT, "venues", `${name}.webp`);
  await mkdir(path.join(OUT, "venues"), { recursive: true });

  const rendered = await sharp(path.join(SRC, file))
    .rotate() // honour EXIF orientation before resizing
    .resize({ width: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();
  await writeFile(out, rendered);

  const meta = await sharp(rendered).metadata();
  const blur = await blurDataURL(rendered);
  console.log(
    `  ${name}: -> ${meta.width}x${meta.height}  ${(rendered.length / 1024).toFixed(0)} KB  ${out}`,
  );
  return { width: meta.width, height: meta.height, blur };
}

/* --- Logo ----------------------------------------------------------- */

async function prepareLogo() {
  const file = path.join(SRC, "logo.png");
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  /* The paper the medallion was drawn on, read from a corner. */
  const paper = [data[0], data[1], data[2]];
  const differs = (i) =>
    Math.max(
      Math.abs(data[i] - paper[0]),
      Math.abs(data[i + 1] - paper[1]),
      Math.abs(data[i + 2] - paper[2]),
    ) > 40;

  /* Row/column densities rather than an outright bounding box: the page
     also carries a faint vignette and a stray sparkle, and a plain bbox
     stretches to swallow both. A row only counts as part of the
     medallion if a real run of pixels on it is off-paper. */
  const rows = new Int32Array(H);
  const cols = new Int32Array(W);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!differs((y * W + x) * C)) continue;
      rows[y]++;
      cols[x]++;
    }
  }

  const span = (counts, limit) => {
    const floor = Math.max(12, Math.round(limit * 0.04));
    let lo = -1;
    let hi = -1;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] < floor) continue;
      if (lo < 0) lo = i;
      hi = i;
    }
    return [lo, hi];
  };

  const [minY, maxY] = span(rows, W);
  const [minX, maxX] = span(cols, H);
  if (maxX < 0 || maxY < 0) throw new Error("logo: nothing found on the page");

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  /* An ellipse a shade larger than the crop, so the gold rim survives.
     Built as raw pixels rather than SVG: exact dimensions, and the
     falloff is ours to control. */
  const mask = Buffer.alloc(width * height * 4);
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const rx = width / 2 + 1;
  const ry = height / 2 + 1;
  const feather = 1.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      /* Distance in pixels outside the rim, softened over `feather`. */
      const outside = (d - 1) * Math.min(rx, ry);
      const a = Math.round(255 * Math.min(1, Math.max(0, 1 - outside / feather)));
      const i = (y * width + x) * 4;
      mask[i] = 255;
      mask[i + 1] = 255;
      mask[i + 2] = 255;
      mask[i + 3] = a;
    }
  }

  const cropped = await sharp(data, { raw: { width: W, height: H, channels: C } })
    .extract({ left: minX, top: minY, width, height })
    .png()
    .toBuffer();

  /* Two passes: sharp resizes before it composites, so masking and
     scaling cannot share a pipeline. */
  const masked = await sharp(cropped)
    .composite([
      {
        input: mask,
        raw: { width, height, channels: 4 },
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  /* Satori — which renders the social preview — cannot decode WebP, so
     the medallion is also emitted as a small PNG for build-time use. */
  await mkdir(path.join("assets", "og"), { recursive: true });
  await sharp(masked)
    .resize({ width: 320, height: 320, fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(path.join("assets", "og", "monogram.png"));

  const out = path.join(OUT, "logo", "monogram.webp");
  const rendered = await sharp(masked)
    .resize({ width: 560, height: 560, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 })
    .toBuffer();
  await writeFile(out, rendered);
  const meta = await sharp(rendered).metadata();
  meta.size = rendered.length;
  const blur = await blurDataURL(rendered);

  console.log(
    `  logo: medallion at ${minX},${minY} ${width}x${height} -> ${meta.width}x${meta.height}  ${(
      meta.size / 1024
    ).toFixed(0)} KB  ${out}`,
  );
  return { width: meta.width, height: meta.height, blur };
}

/* --- Run ------------------------------------------------------------ */

await mkdir(path.join(OUT, "avatars"), { recursive: true });
await mkdir(path.join(OUT, "logo"), { recursive: true });

console.log("Preparing wedding assets…");
const groom = await prepareAvatar("groom");
const bride = await prepareAvatar("bride");
const logo = await prepareLogo();
const ganesha = await prepareGanesha();
const venueAgra = await prepareVenue("grand-mercure", "grand_mercure.jpg");
const venueLucknow = await prepareVenue("surya-mess", "surya_mess.jpeg");
const tracks = await prepareMusic();

/* Sizes and blur previews are emitted rather than pasted in, so that
   re-running this script can never leave the config out of date. */
const entry = (src, a) =>
  JSON.stringify(
    { src, width: a.width, height: a.height, blurDataURL: a.blur },
    null,
    2,
  ).replace(/\n/g, "\n  ");

const manifest = `/**
 * GENERATED by \`npm run assets\` — do not edit by hand.
 * Intrinsic sizes and inline blur previews for the supplied artwork.
 */

export interface GeneratedAsset {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
}

export const generatedAssets: Record<
  "groom" | "bride" | "logo" | "ganesha" | "venueAgra" | "venueLucknow",
  GeneratedAsset
> = {
  groom: ${entry("/assets/avatars/groom.webp", groom)},
  bride: ${entry("/assets/avatars/bride.webp", bride)},
  logo: ${entry("/assets/logo/monogram.webp", logo)},
  ganesha: ${entry("/assets/ganesha/ganesha.webp", ganesha)},
  venueAgra: ${entry("/assets/venues/grand-mercure.webp", venueAgra)},
  venueLucknow: ${entry("/assets/venues/surya-mess.webp", venueLucknow)},
};

export interface GeneratedTrack {
  src: string;
  title: string;
  /** Seconds, measured at build time. */
  duration: number;
}

/** Every file found in ./songs, in a stable order. */
export const generatedTracks: GeneratedTrack[] = ${JSON.stringify(tracks, null, 2)};
`;

await mkdir("data", { recursive: true });
await writeFile("data/generated-assets.ts", manifest, "utf8");

console.log("\nWrote data/generated-assets.ts");
console.log(`  groom  ${groom.width} x ${groom.height}`);
console.log(`  bride  ${bride.width} x ${bride.height}`);
console.log(`  logo    ${logo.width} x ${logo.height}`);
console.log(`  ganesha ${ganesha.width} x ${ganesha.height}`);
console.log(`  venues  ${venueAgra.width}x${venueAgra.height}, ${venueLucknow.width}x${venueLucknow.height}`);
console.log(`  tracks  ${tracks.length}`);
