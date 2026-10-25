# The CV Heist: project spec (condensed)

The full brief ("CLAUDE CODE: THE CV HEIST, Master Project Brief") was pasted into the
Claude Code session on 25/10/2026 by Steve Hill on behalf of the candidate. This file
records what it requires and the decisions taken since. Read it at the start of every build.

## Purpose
A mobile-first networking site for a cybersecurity professional, reached by two QR codes:
- **/profile** (The Professional): profile, CV preview or full CV, LinkedIn.
- **/heist** (The Hacker): a 45 to 90 second puzzle ending in a vault that reveals the dossier.
Visitors must always reach the profile and LinkedIn without playing.

## Hard rules from the brief
- Never invent employment, qualifications, certifications, awards or achievements.
- LinkedIn URL lives in one config file. Missing URL = visible placeholder + release check fails.
- No LinkedIn scraping that bypasses login or bot controls. No LinkedIn photo without permission.
- Two modes, switched by config only: `cvStatus: "preview"` (now) and `"complete"` (Build 5).
- QR codes point at permanent routes, never at a PDF. No print QR codes with placeholder URLs.
- No database, no tracking, no lead capture in the first builds.
- Never claim a test that was not run.

## Puzzle design (as specified)
1. Four logs. LOG 04 (guest got 200 on /vault/cv) is the breach. Fragment **4**.
2. Caesar cipher TFWFO, shift back one = SEVEN. Fragment **7**.
3. Count of successful guest vault requests = **1**. Code **471**.
Reveal copy, preview mode: "ACCESS GRANTED / YOU'VE CRACKED MY PROFILE. / The full CV is
coming. The LinkedIn connection is ready now." Complete mode: "CONGRATULATIONS. YOU'VE STOLEN
MY CV. / The only file I'm happy for you to take."

## Decisions made in this project
- 25/10/2026: Steve asked for Builds 1 and 2 together (event within 3 days), placeholders
  for name and LinkedIn until the candidate supplies them.
- 25/10/2026: **No paid domain, no spend.** Site is a static export so it runs on a free host
  (GitHub Pages or Vercel Hobby). `BASE_PATH` env var supports GitHub Pages sub-folder hosting.
- Next.js 16.4.3 static export, React 19.3, Tailwind 4.3, Vitest 5, Playwright 1.64 using the
  installed Chrome (no browser download). No animation library: CSS and SVG only.
- Profile PDF download is hidden until real details exist (brief section E allows this).
