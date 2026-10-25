# Test report, 25/10/2026

All results below were actually run on Steve's laptop (Windows 11, Chrome via Playwright).

| Check | Command | Result |
|---|---|---|
| Type check | `npm run typecheck` | Pass, 0 errors |
| Unit tests (game + profile logic) | `npm test` | 30 of 30 pass |
| End-to-end (390px, 320px, 1440px) | `npm run build && npm run test:e2e` | 54 of 54 pass |
| Overflow and console errors, 9 widths x 5 pages | `npm run screenshots` | None found |
| Release gate refuses placeholder config | `npm run validate:release` | Exits 1, lists 4 blockers (correct) |
| QR tool refuses missing site URL | `npm run qr` | Exits 1 (correct) |
| Preview QR generation | `npm run qr -- --preview http://localhost:4173` | Writes PREVIEW- files |
| Dependency audit | `npm audit --omit=dev` | 0 vulnerabilities |

## Unit tests cover
Correct log, each wrong log, empty submit, unknown id; letter shift both ways with wraparound;
TFWFO to SEVEN; dial normalisation; wrong and right cipher submissions; code derived as 471;
correct code; wrong code clears and counts; max 3 digits; short-code message; delete; full
flow to open; cannot skip; hint cap; reset; restore rejects junk; release blockers; placeholder
filtering; label switching by CV status; vCard escaping.

## End-to-end tests cover
Every route loads with status 200, no console errors, no sideways scroll; security headers;
404 page; landing doors; CV preview link and preview banner; LinkedIn placeholder on all
pages (no dead links); disabled download and contact explained; QR screen preview label and
correct routes; full game by tapping including a wrong log, wrong cipher, wrong code and a
hint; **keyboard-only** full game; refresh resumes; Quit resets; leaving and pressing Back
resumes; replay; feedback in a live region.

## Fix made during testing
- Next 16 static export wrote prefetch files to nested folders the browser does not request
  (404s). Added `scripts/postbuild.mjs`, which copies them to the expected names.
- One e2e test exceeded the 30s default under parallel load. Limit raised to 60s; it then
  passed in about 9s on all three sizes.

## Not verified
- Scanning QR codes with a real phone (none available to the session).
- Safari and Firefox (only Chrome was available).
- Screen reader run-through with NVDA or VoiceOver (semantics checked in code and by
  live-region and focus tests only).
- Lighthouse performance score.
