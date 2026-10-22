/**
 * scripts/shoot.mjs
 * ------------------------------------------------------------------
 * Screenshots the invitation with the locally installed Chrome, for
 * design review. Dev-only: not part of the site or its build.
 *
 * Usage:
 *   node scripts/shoot.mjs [--w 390] [--h 844] [--out dir] [--url u]
 *
 * Captures the envelope, each step of the opening, then each section
 * down the page. Also reports layout faults that are easy to miss by
 * eye: horizontal overflow, text smaller than 12px, tap targets under
 * 44px, and anything spilling outside the viewport.
 * ------------------------------------------------------------------
 */

import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(`--${flag}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const WIDTH = Number(arg("w", 390));
const HEIGHT = Number(arg("h", 844));
const OUT = arg("out", `shots/${WIDTH}`);
const URL = arg("url", "http://localhost:3000");
const SEQUENCE = process.argv.includes("--sequence");

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 2,
    isMobile: WIDTH < 768,
    hasTouch: WIDTH < 768,
  },
  args: ["--force-color-profile=srgb", "--hide-scrollbars"],
});

const page = await browser.newPage();
const problems = [];
page.on("console", (m) => {
  if (m.type() === "error") problems.push(`console: ${m.text().slice(0, 160)}`);
});
page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 160)}`));

await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(600);

const shot = async (name) => {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  console.log(`  ${file}`);
};

/* --- The envelope, and the opening --- */
await shot("01-envelope");

if (SEQUENCE) {
  await page.click('button[aria-label^="Tap to open"]');
  for (const [i, ms] of [500, 500, 500, 500, 700].entries()) {
    await wait(ms);
    await shot(`02-opening-${i + 1}`);
  }
} else {
  await page.click('button[aria-label^="Tap to open"]');
  await wait(4200);
}

await wait(600);

/* --- Down the page --- */
const sections = await page.$$eval("main > section", (els) =>
  els.map((el) => el.id || "section"),
);

for (const [i, id] of sections.entries()) {
  await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId) ?? document.querySelectorAll("main > section")[0];
    el?.scrollIntoView({ block: "start", behavior: "instant" });
  }, id);
  await wait(1400); // let reveals finish
  await shot(`${String(i + 3).padStart(2, "0")}-${id}`);
}

/* --- Layout audit --- */
const audit = await page.evaluate(() => {
  const out = { overflow: null, tinyText: [], smallTargets: [], spills: [] };
  const vw = document.documentElement.clientWidth;

  if (document.documentElement.scrollWidth > vw + 1) {
    out.overflow = { scrollWidth: document.documentElement.scrollWidth, vw };
  }

  for (const el of document.querySelectorAll("main *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    if (r.right > vw + 1.5 || r.left < -1.5) {
      const cs = getComputedStyle(el);
      if (cs.position !== "absolute" && cs.position !== "fixed") {
        out.spills.push({
          tag: el.tagName,
          cls: String(el.className).slice(0, 46),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    }

    const text = el.childNodes.length &&
      [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (text) {
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 11.5) {
        out.tinyText.push({
          size: +size.toFixed(1),
          text: el.textContent.trim().slice(0, 34),
        });
      }
    }
  }

  for (const el of document.querySelectorAll("button, a[href], input, select, textarea")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.height < 40 || r.width < 40) {
      out.smallTargets.push({
        tag: el.tagName,
        label: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }

  out.tinyText = out.tinyText.slice(0, 8);
  out.spills = out.spills.slice(0, 8);
  return out;
});

console.log(`\n--- audit @ ${WIDTH}px ---`);
console.log(JSON.stringify(audit, null, 1));
if (problems.length) console.log("problems:", problems.slice(0, 8));

await browser.close();
