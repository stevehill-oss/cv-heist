// Fails (exit 1) until the site is safe to use at an event: real name,
// real LinkedIn URL, summary, public site URL, no placeholder list items.
// Usage: npm run validate:release
import { candidate, site } from "../src/content/candidate.ts";
import { releaseBlockers } from "../src/lib/profile.ts";

const blockers = releaseBlockers(candidate, site);
if (blockers.length) {
  console.error("NOT READY FOR RELEASE:");
  for (const b of blockers) console.error(`  - ${b}`);
  process.exit(1);
}
console.log("Release check passed.");
