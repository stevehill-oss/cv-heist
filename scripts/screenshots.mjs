// Captures every page at the target widths, plus each game stage, into
// docs/screenshots/. Also reports horizontal overflow and console errors.
// Needs the static server running: `npm run serve` in another terminal.
// Usage: node scripts/screenshots.mjs [baseUrl] [--quick]
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const base = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:4173";
const quick = process.argv.includes("--quick");
const out = "docs/screenshots";
mkdirSync(out, { recursive: true });

const pages = ["/", "/profile/", "/heist/", "/cv/", "/present/"];
const widths = quick ? [390, 1440] : [320, 360, 375, 390, 430, 768, 1024, 1440, 1920];
const problems = [];

const browser = await chromium.launch({ channel: "chrome" });

async function check(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) problems.push(`${label}: horizontal overflow ${overflow}px`);
}

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 800 : 900 }, deviceScaleFactor: 1, hasTouch: w < 768, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && problems.push(`${w}px console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`${w}px page error: ${e.message}`));
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const name = p === "/" ? "home" : p.replaceAll("/", "");
    await check(page, `${name}@${w}`);
    await page.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: true });
  }
  await ctx.close();
}

// Game stages at a phone width and desktop.
for (const w of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 844 : 900 }, hasTouch: w < 768, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${base}/heist/`, { waitUntil: "networkidle" });
  const shot = async (n) => {
    await page.waitForTimeout(300);
    await check(page, `game-${n}@${w}`);
    await page.screenshot({ path: `${out}/game-${n}-${w}.png`, fullPage: true });
  };
  await page.getByTestId("start-heist").click();
  await shot("1-logs");
  await page.getByTestId("log-02").click();
  await page.getByTestId("submit-log").click();
  await shot("1-wrong");
  await page.getByTestId("log-04").click();
  await page.getByTestId("submit-log").click();
  await shot("1-solved");
  await page.getByTestId("continue").click();
  await page.getByTestId("cipher-back").click();
  await shot("2-cipher");
  await page.getByTestId("submit-cipher").click();
  await page.getByTestId("continue").click();
  await page.locator("summary").click();
  await page.getByTestId("key-4").click();
  await page.getByTestId("key-7").click();
  await shot("3-vault");
  await page.getByTestId("key-1").click();
  await page.getByTestId("key-enter").click();
  await page.getByTestId("continue").click();
  await page.waitForTimeout(600);
  await shot("4-reveal");
  await ctx.close();
}

await browser.close();
console.log(problems.length ? `PROBLEMS:\n${problems.join("\n")}` : "No overflow or console errors found.");
