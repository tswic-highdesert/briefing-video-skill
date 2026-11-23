// List the live site's loaded font faces and every font / video / lottie URL it fetches,
// so you can download the exact files (curl them into ref/dl/).
//   node fonts.mjs <url>     (optional env: PLAYWRIGHT_MJS, CHROMIUM; see shoot.mjs)
// Note: a site's woff2 subsets can be latin-ext only. If basic Latin
// glyphs fall back, take the full variable font from github.com/google/fonts instead.
const { chromium } = await import(process.env.PLAYWRIGHT_MJS || "playwright");
const url = process.argv[2];
if (!url) { console.error("usage: node fonts.mjs <url>"); process.exit(1); }
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const urls = new Set();
p.on("response", r => { const u = r.url(); if (/\.(woff2?|ttf|otf|mp4|webm|json|lottie)(\?|$)/.test(u)) urls.add(u); });
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await p.evaluate(yy => scrollTo(0, yy), y); await p.waitForTimeout(300); }
await p.waitForTimeout(1500);
const ff = await p.evaluate(() => [...document.fonts].map(f => f.family + "|" + f.weight + "|" + f.style + "|" + f.status));
console.log(JSON.stringify({ ff: [...new Set(ff)], urls: [...urls] }, null, 1));
await b.close();
