import { defineConfig, devices } from "@playwright/test";

// Uses the installed Google Chrome (channel: "chrome"), so no browser download
// is needed. Run `npm run build` first: tests hit the exported static site.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  timeout: 60_000,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", channel: "chrome", trace: "off" },
  webServer: { command: "node scripts/serve.mjs 4173", url: "http://localhost:4173/", reuseExistingServer: true },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome", viewport: { width: 390, height: 844 } } },
    { name: "small", use: { ...devices["Pixel 7"], channel: "chrome", viewport: { width: 320, height: 568 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
});
