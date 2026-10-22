/**
 * scripts/check-flows.mjs
 * ------------------------------------------------------------------
 * Drives the interactive parts of the invitation the way a guest
 * would, and checks reduced motion. Dev-only.
 * ------------------------------------------------------------------
 */

import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://localhost:3000";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, pass, detail = "") =>
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
});

/* ---------------- RSVP: yes ---------------- */
{
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: "networkidle0" });
  await wait(400);

  await page.click('button[aria-label^="Tap to open"]');
  await wait(4000);

  check(
    "envelope releases scroll",
    !(await page.evaluate(() => document.documentElement.hasAttribute("data-sealed"))),
  );
  check(
    "content no longer inert",
    !(await page.evaluate(() => document.querySelector("main")?.hasAttribute("inert"))),
  );
  check(
    "no overlay left blocking taps",
    await page.evaluate(() => {
      const o = document.querySelector(".fixed.inset-0.z-50");
      return !o || getComputedStyle(o).pointerEvents === "none";
    }),
  );

  await page.evaluate(() => document.getElementById("rsvp").scrollIntoView());
  await wait(1200);

  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /yes, i/i.test(x.textContent || ""),
    );
    b.click();
  });
  await wait(700);

  check("RSVP form appears", (await page.$("#rsvp-name")) !== null);

  /* Empty submit should be refused, not sent. */
  await page.evaluate(() => document.querySelector("#rsvp-name").form.requestSubmit());
  await wait(500);
  const invalidCount = await page.$$eval('[aria-invalid="true"]', (e) => e.length);
  check("validation blocks an empty reply", invalidCount > 0, `${invalidCount} fields flagged`);

  await page.type("#rsvp-name", "Aarav Sharma");
  await page.select("#rsvp-guests", "3");
  await page.type("#rsvp-phone", "+91 98765 43210");
  await page.type("#rsvp-message", "So happy for you both.");
  await page.evaluate(() => document.querySelector("#rsvp-name").form.requestSubmit());
  await wait(1800);

  const done = await page.evaluate(() => document.body.innerText.includes("Thank You"));
  check("RSVP submits and confirms", done);

  const stored = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("wedding.rsvp.replies") || "[]");
    } catch {
      return [];
    }
  });
  check(
    "reply recorded by the adapter",
    stored.length === 1 && stored[0].name === "Aarav Sharma" && stored[0].guests === 3,
    JSON.stringify(stored[0] ?? null),
  );
  check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await page.close();
}

/* ---------------- RSVP: declining ---------------- */
{
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle0" });
  await wait(300);
  await page.click('button[aria-label^="Tap to open"]');
  await wait(4000);
  await page.evaluate(() => document.getElementById("rsvp").scrollIntoView());
  await wait(1000);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /sorry, i/i.test(x.textContent || ""),
    );
    b.click();
  });
  await wait(700);
  const noPhone = (await page.$("#rsvp-phone")) === null;
  check("declining asks for fewer details", noPhone);

  await page.type("#rsvp-name", "Meera");
  await page.evaluate(() => document.querySelector("#rsvp-name").form.requestSubmit());
  await wait(1600);
  check(
    "declining confirms too",
    await page.evaluate(() => document.body.innerText.includes("Thank you for letting us know")),
  );
  await page.close();
}

/* ---------------- Reduced motion ---------------- */
{
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.goto(URL, { waitUntil: "networkidle0" });
  await wait(400);
  await page.click('button[aria-label^="Tap to open"]');
  await wait(1500);

  check(
    "reduced motion still opens the envelope",
    await page.evaluate(() => !document.documentElement.hasAttribute("data-sealed")),
  );

  await page.evaluate(() => document.getElementById("closing").scrollIntoView());
  await wait(1600);
  /* Only text matters here. The mandala and jaali grounds are meant to
     sit at 4-7% opacity, and they are aria-hidden. */
  const hidden = await page.evaluate(() => {
    const els = [...document.querySelectorAll("#closing *")];
    return els
      .filter((e) => {
        if (e.closest("[aria-hidden='true']")) return false;
        const own = [...e.childNodes].some(
          (n) => n.nodeType === 3 && n.textContent.trim(),
        );
        if (!own) return false;
        return +getComputedStyle(e).opacity < 0.5;
      })
      .map((e) => `${e.tagName}:${e.textContent.trim().slice(0, 22)}@${getComputedStyle(e).opacity}`);
  });
  check("reduced motion leaves text visible", hidden.length === 0, hidden.slice(0, 4).join(" | "));
  await page.close();
}

/* ---------------- Avatars stay on the page ---------------- */
{
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle0" });
  await wait(300);
  await page.click('button[aria-label^="Tap to open"]');
  await wait(4000);

  /* Walk the whole page and watch every avatar at every scroll position:
     the companions move with the scroll, so a single sample proves
     nothing. */
  const worst = await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const vw = document.documentElement.clientWidth;
    let over = 0;
    let culprit = null;

    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += Math.round(innerHeight / 2)) {
      window.scrollTo(0, y);
      await sleep(180);
      for (const img of document.querySelectorAll('img[src*="avatars"]')) {
        const r = img.getBoundingClientRect();
        if (r.width === 0) continue;
        const spill = Math.max(-r.left, r.right - vw, 0);
        if (spill > over) {
          over = spill;
          culprit = `${img.src.split("/").pop()} at y=${y} left=${Math.round(r.left)} right=${Math.round(r.right)}`;
        }
      }
    }
    return { over: Math.round(over), culprit };
  });

  check(
    "avatars never leave the page",
    worst.over <= 1,
    worst.culprit ? `${worst.over}px — ${worst.culprit}` : "none",
  );
  await page.close();
}

/* ---------------- Maps link ---------------- */
{
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle0" });
  await wait(300);
  const links = await page.$$eval('a[href*="google.com/maps"]', (as) =>
    as.map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
  );
  check(
    "the venue links out to maps safely",
    links.length === 1 && links.every((l) => l.target === "_blank" && l.rel.includes("noopener")),
    links.map((l) => decodeURIComponent(l.href.split("query=")[1] ?? "")).join(" | "),
  );
  await page.close();
}

await browser.close();

console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
