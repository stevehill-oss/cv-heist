# Content status

Source of truth: `src/content/candidate.ts`. Last checked 26/10/2026.

| Field | Status | Source |
|---|---|---|
| Name "Daniel O." | Manual | Steve asked 26/10/2026 for the site to show "Daniel O." only |
| Headline "Cyber Security Specialist" | Verified | His own words, first line of his LinkedIn About |
| LinkedIn URL | Set | https://www.linkedin.com/in/daniel-ogunseye/ (supplied by Steve 26/10/2026) |
| Summary | Verified | LinkedIn About section, pasted by Steve 26/10/2026, word for word |
| Skills (10) | Verified | Each one is named in the About section |
| Certifications: CompTIA Security+, SC-200 | Verified | Named in the About section; no years given |
| Location, email, phone, website | Missing | Not supplied |
| Experience, projects | Empty | Not supplied |
| Education | Empty | Not supplied |
| CV PDF | Not supplied | `cvStatus: "preview"` |
| Photo | Not used | Brief forbids using the LinkedIn photo without permission |
| Public site URL | Set | https://stevehill-oss.github.io/cv-heist (live 25/10/2026) |

Nothing was taken from the LinkedIn profile itself. One read of the public page on 26/10/2026
was refused (HTTP 999, LinkedIn's anti-bot wall), and the brief rules out scraping. The About
text was pasted in by Steve instead. Roles with dates still need pasting in.

## How to fill it in
1. Ask the candidate for: full name, LinkedIn profile URL, a 2 to 4 sentence summary, and
   (optional) skills, roles with dates, certifications. Pasted text from their own LinkedIn
   "About" and "Experience" sections is ideal.
2. Enter each item in `candidate.ts` with `status: "manual"` (supplied by the candidate)
   or `"verified"` with a `source`.
3. Run `npm run validate:release`. It lists anything still missing.
