import type { CandidateProfile, SiteConfig } from "@/lib/profile";

// ---------------------------------------------------------------------------
// THE ONE FILE TO EDIT. Every page reads the candidate from here.
//
// Rules:
// - Only enter details the candidate has confirmed. Never guess.
// - Mark each list item's status: "verified" (checked against LinkedIn or the
//   CV, say where in `source`), "manual" (supplied by the candidate directly)
//   or "placeholder" (never shown publicly, blocks release).
// - When the real CV arrives: put the PDF in public/files/, set cvPdfUrl to
//   "/files/<name>.pdf" and cvStatus to "complete". Nothing else changes and
//   the QR codes stay the same.
// - Run `npm run validate:release` before the event. It fails until the name,
//   LinkedIn URL, summary and site URL are real.
// ---------------------------------------------------------------------------

export const candidate: CandidateProfile = {
  // From the LinkedIn address Steve supplied 26/10/2026 (/in/daniel-ogunseye).
  // Confirm the spelling with Daniel before printing.
  name: "Daniel Ogunseye",
  headline: "Cybersecurity Professional",
  headlineStatus: "manual",
  location: null,
  summary: null,
  linkedinUrl: "https://www.linkedin.com/in/daniel-ogunseye/",
  email: null,
  phone: null,
  website: null,
  cvStatus: "preview",
  cvPdfUrl: null,
  experience: [],
  skills: [],
  certifications: [],
  projects: [],
  education: [],
};

export const site: SiteConfig = {
  // Set once the free hosting address is known, e.g.
  // "https://stevehill-oss.github.io/cv-heist" or "https://cv-heist.vercel.app"
  siteUrl: "https://stevehill-oss.github.io/cv-heist",
};
