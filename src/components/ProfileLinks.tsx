import Link from "next/link";
import type { ReactNode } from "react";
import { candidate } from "@/content/candidate";
import { ROUTES, cvLabels } from "@/lib/profile";
import { ArrowRight, FileIcon, LinkedInIcon } from "./icons";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Marks content that is not confirmed yet. Never styled to look like fact. */
export function Tbc({ children = "To be confirmed" }: { children?: ReactNode }) {
  return (
    <span className="tbc">
      <span aria-hidden="true">◌</span>
      {children}
    </span>
  );
}

/**
 * The only place a LinkedIn link is rendered. Without a configured URL it
 * shows a clearly labelled placeholder instead of a dead button.
 */
export function LinkedInLink({ className = "", label = "Connect on LinkedIn" }: { className?: string; label?: string }) {
  if (!candidate.linkedinUrl) {
    return (
      <span className={`btn tbc-block !text-amber !font-mono !text-sm ${className}`} data-testid="linkedin-placeholder">
        <LinkedInIcon /> LinkedIn link not set yet
      </span>
    );
  }
  return (
    <a
      href={candidate.linkedinUrl}
      className={`btn btn-linkedin ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="linkedin-link"
    >
      <LinkedInIcon /> {label}
      <span className="sr-only"> (opens LinkedIn in a new tab)</span>
    </a>
  );
}

export function CvLink({ className = "btn btn-secondary" }: { className?: string }) {
  return (
    <Link href={ROUTES.cv} className={className} data-testid="cv-link">
      <FileIcon /> {cvLabels(candidate).view}
    </Link>
  );
}

export function CvDownload({ className = "btn btn-secondary" }: { className?: string }) {
  const labels = cvLabels(candidate);
  if (!candidate.cvPdfUrl) {
    return (
      <p className="text-sm text-ink-2" data-testid="cv-download-unavailable">
        {candidate.cvStatus === "complete" ? "CV download" : "Profile summary download"} will appear here once the
        details are confirmed.
      </p>
    );
  }
  return (
    <a href={`${basePath}${candidate.cvPdfUrl}`} className={className} download data-testid="cv-download">
      <FileIcon /> {labels.download}
    </a>
  );
}

export function ProfileLink({ className = "btn btn-secondary", label = "Professional Profile" }: { className?: string; label?: string }) {
  return (
    <Link href={ROUTES.profile} className={className}>
      {label} <ArrowRight />
    </Link>
  );
}
