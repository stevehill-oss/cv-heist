# Content status

Source of truth: `src/content/candidate.ts`. Last checked 25/10/2026.

| Field | Status | Source |
|---|---|---|
| Name | Missing | Not supplied |
| Headline "Cybersecurity Professional" | Manual | From the brief |
| LinkedIn URL | Missing | Not supplied |
| Summary | Missing | Not supplied |
| Location, email, phone, website | Missing | Not supplied |
| Experience, skills, projects | Empty | Not supplied |
| Certifications, education | Empty | Not supplied |
| CV PDF | Not supplied | `cvStatus: "preview"` |
| Photo | Not used | Brief forbids using the LinkedIn photo without permission |
| Public site URL | Set | https://stevehill-oss.github.io/cv-heist (live 25/10/2026) |

Nothing was taken from LinkedIn: no URL was supplied, and LinkedIn blocks automated reading.

## How to fill it in
1. Ask the candidate for: full name, LinkedIn profile URL, a 2 to 4 sentence summary, and
   (optional) skills, roles with dates, certifications. Pasted text from their own LinkedIn
   "About" and "Experience" sections is ideal.
2. Enter each item in `candidate.ts` with `status: "manual"` (supplied by the candidate)
   or `"verified"` with a `source`.
3. Run `npm run validate:release`. It lists anything still missing.
