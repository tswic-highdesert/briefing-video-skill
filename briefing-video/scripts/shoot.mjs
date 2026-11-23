// Capture a brand site to theme a brief from: the live site is the source of truth, old refs go stale.
// Needs Playwright (npm i playwright && npx playwright install chromium):
//   node shoot.mjs <url> [outdir=ref/live]
// Optional env: PLAYWRIGHT_MJS=/path/to/playwright/index.mjs (if not resolvable from here),
//               CHROMIUM=/path/to/chromium (use a system browser instead of Playwright's).
// Writes a 1920x1080 screenshot every 900 px of scroll (s00.png, s01.png, ...) and prints the
// computed fonts, the most-used text and background colours, every video/canvas/iframe source,
// and the h1-h3 type specs as JSON. Compare those against references/style.md.
import { mkdirSync } from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MJS || "playwright");
const url = process.argv[2];
if (!url) { console.error("usage: node shoot.mjs <url> [outdir=ref/live]"); process.exit(1); }
const out = process.argv[3] || "ref/live";
mkdirSync(out, { recursive: true });
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(2500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < H; y += 900) {
  await p.evaluate(yy => window.scrollTo(0, yy), y);
  await p.waitForTimeout(1200); // let scroll-triggered animations land
  await p.screenshot({ path: `${out}/s${String(i++).padStart(2, "0")}.png` });
}
const info = await p.evaluate(() => {
  const cs = el => getComputedStyle(el);
  const fonts = new Set(), colors = {}, bgs = {};
  for (const el of document.querySelectorAll("*")) {
    const s = cs(el); fonts.add(s.fontFamily);
    colors[s.color] = (colors[s.color] || 0) + 1;
    if (s.backgroundColor !== "rgba(0, 0, 0, 0)") bgs[s.backgroundColor] = (bgs[s.backgroundColor] || 0) + 1;
  }
  const vids = [...document.querySelectorAll("video, canvas, iframe")].map(v => ({ tag: v.tagName, src: v.currentSrc || v.src || "", poster: v.poster || "", cls: v.className, w: v.clientWidth, h: v.clientHeight }));
  const heads = [...document.querySelectorAll("h1,h2,h3")].map(h => ({ t: h.innerText.slice(0, 80), f: cs(h).fontFamily, s: cs(h).fontSize, w: cs(h).fontWeight, c: cs(h).color }));
  return { title: document.title, H: document.documentElement.scrollHeight, fonts: [...fonts],
    colors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 14),
    bgs: Object.entries(bgs).sort((a, b) => b[1] - a[1]).slice(0, 14), vids, heads };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
