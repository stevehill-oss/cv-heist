# Deployment (free, no domain purchase)

## LIVE: GitHub Pages, chosen by Steve 25/10/2026
- Address: https://stevehill-oss.github.io/cv-heist/
- Source: https://github.com/stevehill-oss/cv-heist (public, `main` branch)
- Built site: `gh-pages` branch. Redeploy after any change: `npm run deploy:pages`
- Commits use GitHub's no-reply email so Steve's work email stays out of the public history.
- Final QR codes: `qr-codes/professional.png|svg` and `qr-codes/heist.png|svg`.
- No security headers on Pages (see Option B limitation below).
- The GitHub token expires around 16/11/2026. The site stays up after that; only
  redeploys need a renewed token.

The build output in `out/` is plain static files. Any free static host works. Two options:

## Option A: Vercel Hobby (free) - recommended
- Address looks like `https://<project-name>.vercel.app` (pick a name, e.g. the candidate's).
- Uses `vercel.json`, so the security headers are applied.
- Steps: push the repo to GitHub, sign in to vercel.com with GitHub, "Add New Project",
  import the repo, deploy. No settings needed.
- The Hobby plan is for personal, non-commercial use, which this is.

## Option B: GitHub Pages (free)
- Address looks like `https://<github-user>.github.io/cv-heist`.
- Build with the sub-folder: `BASE_PATH=/cv-heist npm run build`, then publish `out/`.
- Add an empty `out/.nojekyll` file (Pages otherwise hides folders starting with `_`).
- Limitation: GitHub Pages cannot send custom HTTP headers, so the CSP and frame headers
  in `vercel.json` will not apply. The site still works.
- Note: the address carries the GitHub account name. Under Steve's account it would read
  `stevehill-oss.github.io`, so the candidate's own GitHub account is better.

## After it is live
1. Set `site.siteUrl` in `src/content/candidate.ts` to the live address (https, no trailing slash).
2. Rebuild and redeploy.
3. `npm run validate:release` must pass.
4. `npm run qr` writes the final print codes to `qr-codes/`.
5. Scan both codes with a real phone before printing.

## Local preview
```
npm install
npm run build
npm run serve      # http://localhost:4173
```
To test on a phone on the same Wi-Fi, open `http://<laptop-ip>:4173` (Windows may ask to
allow Node through the firewall).
