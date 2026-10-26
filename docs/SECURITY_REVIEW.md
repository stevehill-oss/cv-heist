# Security review (Builds 1 and 2), 25/10/2026

- **No backend, no database, no forms, no tracking.** Static files only.
- **The vault is not access control.** The code (471) is in the shipped JavaScript by
  design. Nothing sensitive sits behind it; the dossier shows public profile details only.
- **The account login (added 26/10/2026) is not access control either.** The password
  (`password443`) is in the shipped JavaScript and the public repo, and is checked in the
  browser. The "lockout" is a joke, reset by a refresh. Only put public details behind it.
  Typed passwords are never stored or sent; only a signed-in flag goes in sessionStorage.
- **Headers** (in `vercel.json`, mirrored by `scripts/serve.mjs`, checked by an e2e test):
  CSP `default-src 'self'` with `frame-ancestors 'none'`, `object-src 'none'`;
  `X-Content-Type-Options: nosniff`; `X-Frame-Options: DENY`; strict Referrer-Policy;
  Permissions-Policy denying camera, mic, location, payment, USB; COOP same-origin.
- **CSP compromise:** `script-src` and `style-src` include `'unsafe-inline'` because Next.js
  static export inlines its bootstrap scripts. No user input is ever rendered as HTML.
- **QR SVG** is rendered with `dangerouslySetInnerHTML`, but the SVG comes from the `qrcode`
  library fed only by our own config or `window.location`. No user-controlled input.
- **External links** use `rel="noopener noreferrer"`.
- **Session storage** holds game progress only (no personal data). Access is wrapped in try/catch.
- **Search engines:** `robots: noindex` is set, so the page is reached by QR and links only.
- **Dependencies:** `npm audit --omit=dev` reported 0 vulnerabilities on 25/10/2026.
- **Not done yet (Build 4):** real-device scan tests, Lighthouse run, cross-browser beyond Chrome.
