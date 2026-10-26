# Build plan

| Build | Scope | Status |
|---|---|---|
| 1 | Design system, landing, profile, game intro, CV preview, QR routes and tool | Done 25/10/2026 |
| 2 | Playable game: state machine, 3 puzzles, hints, progress, replay, reveal | Done 25/10/2026 |
| 3 | Cinematic polish: vault, puzzles, profile | Not started |
| 4 | Event readiness: final QR, business card, vCard, share, metadata, deploy | Partly done early (vCard, share, headers, QR tool); card layout and deploy not started |
| 5 | Real CV integration | Blocked until the CV is supplied |
| 2b | Locked account (`/account`, password `password443`, riddle hints, playful lockout), game stage 04, timer, rank, brag share text | Done 26/10/2026 |

## Before the event (minimum)
1. Candidate details into `src/content/candidate.ts`. Name and LinkedIn done 26/10; summary,
   roles and skills still needed.
2. ~~Deploy free, set `site.siteUrl`~~ Done 25/10: live on GitHub Pages. Redeploy with
   `npm run deploy:pages` after step 1.
3. `npm run validate:release` passes.
4. ~~`npm run qr`~~ Done: final codes in `qr-codes/`. Scan both on a real phone.
5. Optional: put `/present` on the candidate's phone home screen to show the QR live.
