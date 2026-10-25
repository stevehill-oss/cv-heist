// Makes the two QR codes (Professional -> /profile/, Hacker -> /heist/) as
// print-quality SVG and 1200px PNG in qr-codes/.
//
// Final codes use `site.siteUrl` from src/content/candidate.ts:
//   npm run qr
// Preview codes for any address (files are prefixed PREVIEW-, never print them):
//   npm run qr -- --preview http://192.168.1.20:4173
import { mkdirSync, writeFileSync } from "node:fs";
import QRCode from "qrcode";
import { site } from "../src/content/candidate.ts";
import { ROUTES, absoluteUrl } from "../src/lib/profile.ts";

const previewIdx = process.argv.indexOf("--preview");
const preview = previewIdx !== -1;
const base = preview ? process.argv[previewIdx + 1] : site.siteUrl;

if (!base) {
  console.error("No site URL. Set site.siteUrl in src/content/candidate.ts, or use --preview <url> for test codes.");
  process.exit(1);
}
if (!preview && !/^https:\/\/[^/]+/.test(base)) {
  console.error(`Final codes need an https:// address. Got: ${base}`);
  process.exit(1);
}

mkdirSync("qr-codes", { recursive: true });
const prefix = preview ? "PREVIEW-" : "";
const opts = { errorCorrectionLevel: "Q", margin: 4, color: { dark: "#000000", light: "#ffffff" } };

for (const [name, route] of [["professional", ROUTES.profile], ["heist", ROUTES.heist]]) {
  const url = absoluteUrl({ siteUrl: base.replace(/\/$/, "") }, route);
  writeFileSync(`qr-codes/${prefix}${name}.svg`, await QRCode.toString(url, { ...opts, type: "svg" }));
  await QRCode.toFile(`qr-codes/${prefix}${name}.png`, url, { ...opts, width: 1200 });
  console.log(`${prefix}${name}: ${url}`);
}
console.log(preview ? "Preview codes written to qr-codes/. Do not print these." : "Final codes written to qr-codes/.");
