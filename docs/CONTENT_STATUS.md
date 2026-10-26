# Content status

Source of truth: `src/content/candidate.ts`. Last checked 25/10/2026.

| Field | Status | Source |
|---|---|---|
| Name "Daniel Ogunseye" | Manual | Read from the LinkedIn address Steve supplied 26/10/2026. Spelling to confirm with Daniel |
| Headline "Cybersecurity Professional" | Manual | From the brief |
| LinkedIn URL | Set | https://www.linkedin.com/in/daniel-ogunseye/ (supplied by Steve 26/10/2026) |
| Summary | Missing | Not supplied |
| Location, email, phone, website | Missing | Not supplied |
| Experience, skills, projects | Empty | Not supplied |
| Certifications, education | Empty | Not supplied |
| CV PDF | Not supplied | `cvStatus: "preview"` |
| Photo | Not used | Brief forbids using the LinkedIn photo without permission |
| Public site URL | Set | https://stevehill-oss.github.io/cv-heist (live 25/10/2026) |

Nothing was taken from the LinkedIn profile itself. One read of the public page on 26/10/2026
was refused (HTTP 999, LinkedIn's anti-bot wall), and the brief rules out scraping. Summary,
roles and skills need pasting in from Daniel's own profile.

## How to fill it in
1. Ask the candidate for: full name, LinkedIn profile URL, a 2 to 4 sentence summary, and
   (optional) skills, roles with dates, certifications. Pasted text from their own LinkedIn
   "About" and "Experience" sections is ideal.
2. Enter each item in `candidate.ts` with `status: "manual"` (supplied by the candidate)
   or `"verified"` with a `source`.
3. Run `npm run validate:release`. It lists anything still missing.
