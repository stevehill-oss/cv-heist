// Content model for the candidate. Every display component reads from one
// CandidateProfile (see src/content/candidate.ts), so a detail changed there
// changes everywhere: profile, CV page, game, contact card and QR screen.

export type CvStatus = "preview" | "complete";

// Where a piece of content came from. Anything marked "placeholder" is shown
// with a visible "to be confirmed" treatment and blocks release validation.
export type ContentStatus = "verified" | "manual" | "placeholder";

export interface Sourced {
  status: ContentStatus;
  /** Where it was verified, e.g. "LinkedIn profile, checked 25/10/2026". */
  source?: string;
}

export interface Experience extends Sourced {
  role: string;
  organisation: string;
  /** Free text as written on the CV, e.g. "Mar 2022". */
  start: string;
  /** null means current role. */
  end: string | null;
  summary?: string;
}

export interface Skill extends Sourced {
  name: string;
  group?: string;
}

export interface Certification extends Sourced {
  name: string;
  issuer: string;
  year?: string;
}

export interface Project extends Sourced {
  title: string;
  description: string;
  url?: string;
}

export interface Education extends Sourced {
  qualification: string;
  institution: string;
  year?: string;
}

export interface CandidateProfile {
  name: string | null;
  headline: string;
  headlineStatus: ContentStatus;
  location: string | null;
  summary: string | null;
  linkedinUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  cvStatus: CvStatus;
  /** Path under /public (e.g. "/files/cv.pdf") or null when no file is ready. */
  cvPdfUrl: string | null;
  experience: Experience[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  education: Education[];
}

export interface SiteConfig {
  /**
   * The public address the QR codes point at, with no trailing slash,
   * e.g. "https://yourname.github.io/cv-heist". null while not yet hosted:
   * the QR screen then shows clearly labelled preview codes only.
   */
  siteUrl: string | null;
}

export const ROUTES = {
  home: "/",
  profile: "/profile",
  heist: "/heist",
  cv: "/cv",
  present: "/present",
  account: "/account",
} as const;

export function displayName(p: CandidateProfile): string {
  return p.name ?? "Name to be confirmed";
}

export function initials(p: CandidateProfile): string {
  if (!p.name) return "??";
  return p.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function cvLabels(p: CandidateProfile) {
  return p.cvStatus === "complete"
    ? { view: "View Full CV", download: "Download CV", short: "Full CV", document: "Curriculum Vitae" }
    : {
        view: "View Profile Preview",
        download: "Download Profile Summary",
        short: "CV Preview",
        document: "Professional Profile Preview",
      };
}

/** Only content that is safe to show as fact. Placeholders are never returned. */
export function publicItems<T extends Sourced>(items: T[]): T[] {
  return items.filter((i) => i.status !== "placeholder");
}

/** Everything that must be fixed before the site is used at an event. */
export function releaseBlockers(p: CandidateProfile, site: SiteConfig): string[] {
  const blockers: string[] = [];
  if (!p.name) blockers.push("Candidate name is not set.");
  if (!p.linkedinUrl) blockers.push("LinkedIn URL is not set.");
  else if (!/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^/?#\s]+\/?$/i.test(p.linkedinUrl))
    blockers.push(`LinkedIn URL does not look like a profile link: ${p.linkedinUrl}`);
  if (p.headlineStatus === "placeholder") blockers.push("Headline is still a placeholder.");
  if (!p.summary) blockers.push("Professional summary is empty.");
  if (!site.siteUrl) blockers.push("Site URL is not set, so final QR codes cannot be made.");
  else if (!/^https:\/\//.test(site.siteUrl) || site.siteUrl.endsWith("/"))
    blockers.push("Site URL must start with https:// and have no trailing slash.");
  if (p.cvStatus === "complete" && !p.cvPdfUrl) blockers.push("CV marked complete but no PDF is set.");
  const lists: Sourced[] = [...p.experience, ...p.skills, ...p.certifications, ...p.projects, ...p.education];
  const placeholders = lists.filter((i) => i.status === "placeholder").length;
  if (placeholders > 0) blockers.push(`${placeholders} list item(s) are still placeholders.`);
  return blockers;
}

export function absoluteUrl(site: SiteConfig, route: string): string | null {
  if (!site.siteUrl) return null;
  return `${site.siteUrl}${route === "/" ? "/" : `${route}/`}`;
}

/** Build a vCard 3.0 contact file from verified fields only. */
export function buildVCard(p: CandidateProfile, profileUrl: string | null): string | null {
  if (!p.name) return null;
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
  const parts = p.name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts[parts.length - 1]! : "";
  const first = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0]!;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(p.name)}`,
  ];
  if (p.headlineStatus !== "placeholder") lines.push(`TITLE:${esc(p.headline)}`);
  if (p.email) lines.push(`EMAIL;TYPE=INTERNET:${p.email}`);
  if (p.phone) lines.push(`TEL;TYPE=CELL:${p.phone}`);
  if (p.linkedinUrl) lines.push(`URL;TYPE=LinkedIn:${p.linkedinUrl}`);
  if (profileUrl) lines.push(`URL:${profileUrl}`);
  if (p.website) lines.push(`URL:${p.website}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
