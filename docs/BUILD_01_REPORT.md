# Build 1 report, 25/10/2026

Builds 1 and 2 were done in one session at Steve's request (event within 3 days).
Build 2 has its own report.

## Completed
- Next.js 16 static site, TypeScript, Tailwind 4 design tokens (brief's palette), Space
  Grotesk, Inter and JetBrains Mono.
- One content file `src/content/candidate.ts`; content model with verified, manual and
  placeholder status in `src/lib/profile.ts`. Preview and complete CV modes switch by config.
- Landing page with THE PROFESSIONAL and THE HACKER doors.
- Profile: hero, tilt-on-hover identity card (no photo), introduction, skills, experience,
  projects, credentials (shown only when present), CV preview card, save contact, share,
  game link. Empty sections show designed "awaiting confirmation" blocks, no invented content.
- Game intro with SVG vault, headline, supporting line, Start, profile, CV and LinkedIn links.
- `/cv` preview page labelled "Professional Profile Preview" and "Full CV to be added".
  PDF download hidden until real details exist.
- `/present` QR screen with both codes, marked preview until a public address is set.
- `scripts/generate-qr.mjs` (refuses to make final codes without an https site URL).
- `scripts/validate-release.mjs` release gate.
- Mobile header, footer, 404 page, security headers, skip link, reduced-motion support.

## Tests and screenshots
See TEST_REPORT.md and VISUAL_QA.md. 30 unit and 54 end-to-end tests pass.

## Outstanding candidate information
Name, LinkedIn URL, summary, and any skills, roles, certifications. See CONTENT_STATUS.md.

## Known limitations
No real-phone QR scan, no Safari or Firefox run, no screen reader run, no Lighthouse run.
