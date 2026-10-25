# The CV Heist

Networking site for a cybersecurity professional: a profile page and a vault-cracking game,
reached by two QR codes. Static site, free to host.

- Edit the candidate: `src/content/candidate.ts`
- Run locally: `npm install`, `npm run build`, `npm run serve` (http://localhost:4173)
- Tests: `npm test` (logic), `npm run test:e2e` (browser, needs a build first)
- Before the event: `npm run validate:release`, then `npm run qr`
- Docs: `docs/` (start with BUILD_PLAN.md and DEPLOYMENT.md)
