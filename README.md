# Anshuman & Shraddha — Wedding Invitation

A cinematic, single-page wedding invitation. The guest opens a full-screen
envelope, receives Ganesha's blessing, and is then walked through the
celebrations by the couple themselves.

**20 — 21 November 2026 · Agra**

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## Where the content lives

Everything factual is in **`wedding.config.ts`** — names, parents, dates,
venues, ceremony timings, the shloka, and the R.S.V.P. family list. No
component hardcodes a fact. Edit that one file and the whole invitation
follows.

A few things worth knowing:

| Field | Note |
| --- | --- |
| `countdownTarget` | The countdown never knows a date; it is passed one. Change it here. |
| `countdownTimeZoneOffset` | `+05:30`, so the countdown is right for guests abroad. |
| `venues.*.googleMapsUrl` | Set for both. See *Venue map links* below. |
| `invocation.shloka` / `.blessing` | Reproduced exactly as supplied. Please do not re-space or "correct" the Devanagari. |
| `music.tracks` | Gathered from `./songs` by `npm run assets`. An empty list hides the control. |

Anything not yet supplied is `null` and renders as a composed ornamental
placeholder — never a broken image, never invented text.

---

## Artwork

Source files live in `Avatars&Logos/`. They are **not** used directly;
`npm run assets` turns them into web-ready assets under `public/assets/`
and writes `data/generated-assets.ts` with intrinsic sizes and inline blur
previews.

```bash
npm run assets       # re-run after dropping in new artwork
```

The script does three things that are easy to get wrong:

- **Avatars.** The supplied PNGs had a transparency checkerboard *painted
  into the pixels* rather than real alpha. A flood fill from the borders
  removes only the connected background, so the bride's cream lehenga and
  the groom's ivory sherwani stay opaque.
- **Ganesha.** The artwork came as a lit figure on black. The black becomes
  graded transparency, and the glow is un-premultiplied so the halo bleeds
  into the burgundy ground instead of dimming it.
- **Logo.** Cropped to the roundel and masked to an ellipse, so the
  medallion sits equally well on paper and on burgundy.

Results: 2.1 MB → 97 KB (groom), 2.3 MB → 146 KB (bride).

---

## Music

Drop audio into `./songs` and run `npm run assets`. Files are copied to
`public/assets/music/` under web-safe names, bitrate junk is stripped out
of the titles, and the playlist is written into `data/generated-assets.ts`.

Playback starts on the tap that opens the envelope — that tap is the user
gesture browsers require, so `start()` is called synchronously from the
click handler. A track is chosen at random and the rest follow shuffled,
so two guests rarely hear the same song first. If a browser refuses
anyway, the floating control stays put to be tapped, and it never becomes
an error.

---

## Collecting replies in a Google Sheet

Replies land in a spreadsheet you can share with the whole family, and new
rows appear as guests submit — no inbox to wade through, and everyone
watching the sheet sees the same thing at the same time.

**1.** Create a Google Sheet. Leave it empty; the script writes its own
header row the first time a reply arrives.

**2.** In that sheet: **Extensions → Apps Script**. Delete the placeholder
and paste in the contents of [`scripts/rsvp-sheet.gs`](scripts/rsvp-sheet.gs).
Save.

**3.** **Deploy → New deployment → Web app.** Two settings matter:

| Setting | Value |
| --- | --- |
| Execute as | **Me** |
| Who has access | **Anyone** |

It has to be *Anyone*. "Anyone with a Google account" makes each guest sign
in, and most will not. Authorise when prompted — the "unverified app"
warning is expected for your own script (Advanced → Go to project).

**4.** Copy the web app URL and put it in `.env.local` at the project root:

```bash
NEXT_PUBLIC_RSVP_ENDPOINT=https://script.google.com/macros/s/AKfy…/exec
```

**5.** Restart the dev server and send a test RSVP. A row should appear.

Then **Share** the sheet with whoever needs to see the replies — Viewer
access is enough, and their view updates live.

### Two things that would otherwise bite

Apps Script does not answer CORS preflight requests, so an ordinary JSON
`POST` is rejected before it is ever sent. The adapter detects Apps Script
URLs and sends the body as `text/plain`, which the browser treats as a
simple request and lets through unchallenged; Apps Script reads it
identically from `e.postData.contents`. This is already handled — it is
only worth knowing if you ever change the endpoint.

`NEXT_PUBLIC_` variables are baked in when the site is built. Setting one
locally does nothing for the deployed site: add it to your host's
environment variables and redeploy.

Whenever you edit the Apps Script, use **Deploy → Manage deployments →
Edit → New version**. Creating a fresh deployment instead gives you a new
URL and quietly leaves the old one wired up.

### Somewhere else instead

Any URL accepting a JSON `POST` works in the same variable — Formspree, a
Supabase edge function, a Next route handler. The body is:

```json
{
  "name": "…",
  "attendance": "yes",
  "guests": 3,
  "phone": "…",
  "message": "…",
  "submittedAt": "2026-08-27T16:08:01.826Z"
}
```

With nothing configured, replies stay in the guest's own browser — enough
to exercise the flow, but nothing reaches you. Every network detail lives
behind `submitRSVP()` in `lib/rsvp.ts`; no component makes a request.

---

## Venue map links

Both venues have `googleMapsUrl` set, using Google's documented
`?api=1&query=` form with the full postal address:

- Grand Mercure Agra — Fatehabad Rd, Tajganj, Agra, Uttar Pradesh 282001
- Surya Officers Mess — Nehru Road, Cantt, Lucknow, Uttar Pradesh 226002

These open the Maps app on a phone and resolve to the venue. They are
precise *search* links rather than place-ID links, which means they cannot
rot if Google renumbers a place. If you would rather pin an exact pin:
open the venue in Google Maps → Share → Copy link, and paste it over the
value in `wedding.config.ts`. Nothing else changes.

---

## Before it goes out

Set the real domain in `wedding.config.ts` → `site.url`. It is the base for
the WhatsApp/social preview image, which is generated at build time by
`app/opengraph-image.tsx` and needs an absolute URL.

The invitation is marked `noindex` — findable by the link you send, not by
search. Remove `robots` in `app/layout.tsx` if you would rather it were
public.

---

## Layout

```
wedding.config.ts              every fact, in one place
data/generated-assets.ts       written by `npm run assets` — do not edit
lib/
  rsvp.ts                      the only seam to a backend
  useCountdown.ts              recomputes from the clock, so it never drifts
  motion.ts                    shared easing and variants
components/
  experience/                  the sections, in page order
  motifs/                      drawn ornaments — damask, mandala, jaali, icons
  ui/                          avatars, reveals, photo frames, music
scripts/                       dev tools; not part of the site or its build
```

The page is one continuous document. All sections render from the start —
so link previews, search engines and screen readers see the whole
invitation — and the envelope simply sits over them until it is opened.

---

## Checks

```bash
npm run typecheck
npm run lint
npm run build

npm run check:flows   # drives RSVP, reduced motion, and the map links
npm run shots -- --w 390 --h 844 --out shots/390
```

`check:flows` and `shots` drive the locally installed Chrome through
`puppeteer-core`. They are development tools — nothing they need is
shipped, and neither runs during `npm run build`.

Reduced motion is honoured throughout: parallax and drift stop, the
envelope still opens, and every word stays on the page.

## Deploys

Pushing to `main` builds and deploys automatically via Vercel.
Live at https://anshuman-shraddha.vercel.app
