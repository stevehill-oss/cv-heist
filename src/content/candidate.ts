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

const ABOUT = { status: "verified", source: "LinkedIn About section, pasted by Steve 26/10/2026" } as const;

export const candidate: CandidateProfile = {
  // Steve asked 26/10/2026 for the site to show "Daniel O." only.
  name: "Daniel O.",
  // His own words, from the opening line of his LinkedIn About section.
  headline: "Cyber Security Specialist",
  headlineStatus: "verified",
  location: null,
  // LinkedIn About section, pasted by Steve 26/10/2026. Blank line = new paragraph.
  summary:
    "Analytical Cyber Security Specialist with hands-on experience in conducting third-party risk assessments and delivering assurance across the TPRM lifecycle, ensuring suppliers' security postures align with organisational and industry standards. Skilled in supply chain risk management, assurance, and compliance, with a strong grasp of governance principles and regulatory expectations.\n\n" +
    "Technically proficient in cyber operations, leveraging Microsoft Sentinel and Microsoft Defender XDR for threat detection, SIEM monitoring, incident analysis, and response coordination. Supported by professional certifications including CompTIA Security+ and Microsoft Certified: Security Operations Analyst Associate (SC-200), demonstrating a solid foundation in both defensive security operations and strategic risk management.",
  linkedinUrl: "https://www.linkedin.com/in/daniel-ogunseye/",
  email: null,
  phone: null,
  website: null,
  cvStatus: "preview",
  cvPdfUrl: null,
  experience: [],
  // Every skill and certification below is named in his LinkedIn About section.
  skills: [
    { name: "Third-party risk management (TPRM)", group: "Risk and assurance", ...ABOUT },
    { name: "Supply chain risk management", group: "Risk and assurance", ...ABOUT },
    { name: "Security assurance", group: "Risk and assurance", ...ABOUT },
    { name: "Compliance", group: "Risk and assurance", ...ABOUT },
    { name: "Governance", group: "Risk and assurance", ...ABOUT },
    { name: "Microsoft Sentinel", group: "Security operations", ...ABOUT },
    { name: "Microsoft Defender XDR", group: "Security operations", ...ABOUT },
    { name: "SIEM monitoring", group: "Security operations", ...ABOUT },
    { name: "Threat detection", group: "Security operations", ...ABOUT },
    { name: "Incident analysis and response", group: "Security operations", ...ABOUT },
  ],
  certifications: [
    { name: "CompTIA Security+", issuer: "CompTIA", ...ABOUT },
    { name: "Security Operations Analyst Associate (SC-200)", issuer: "Microsoft", ...ABOUT },
  ],
  projects: [],
  education: [],
};

export const site: SiteConfig = {
  // Set once the free hosting address is known, e.g.
  // "https://stevehill-oss.github.io/cv-heist" or "https://cv-heist.vercel.app"
  siteUrl: "https://stevehill-oss.github.io/cv-heist",
};
