import Link from "next/link";
import { candidate } from "@/content/candidate";
import { ROUTES, cvLabels, initials } from "@/lib/profile";
import { LinkedInIcon, QrIcon } from "./icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/50 bg-bg/70 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-4 sm:px-6">
        <Link href={ROUTES.home} className="mr-auto flex items-center gap-2.5 rounded-lg py-2 pr-2" aria-label="The CV Heist, home">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan/50 bg-cyan/10 font-mono text-[0.7rem] font-semibold text-cyan">
            {initials(candidate)}
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-wide min-[400px]:inline">
            CV<span className="text-cyan">/</span>HEIST
          </span>
        </Link>
        <Link href={ROUTES.profile} className="rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:text-ink sm:px-3">
          Profile
        </Link>
        <Link href={ROUTES.heist} className="rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:text-ink sm:px-3">
          Heist
        </Link>
        <Link href={ROUTES.cv} className="hidden rounded-lg px-3 py-2 text-sm text-ink-2 hover:text-ink sm:inline">
          {cvLabels(candidate).short}
        </Link>
        <Link href={ROUTES.present} className="grid h-10 w-10 place-items-center rounded-lg text-ink-2 hover:text-ink" aria-label="Show QR codes">
          <QrIcon />
        </Link>
        {candidate.linkedinUrl ? (
          <a
            href={candidate.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-10 w-10 place-items-center rounded-lg text-[#4ea3f5] hover:text-white"
            aria-label="LinkedIn profile (opens in a new tab)"
          >
            <LinkedInIcon />
          </a>
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-lg text-amber/70" title="LinkedIn link not set yet">
            <LinkedInIcon />
            <span className="sr-only">LinkedIn link not set yet</span>
          </span>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 max-w-6xl px-4 pb-10 text-xs text-ink-2 sm:px-6">
      <div className="flex flex-col gap-3 border-t border-line/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono tracking-wide">THE CV HEIST · the vault is a game, it guards nothing real</p>
        <div className="flex gap-4">
          <Link href={ROUTES.profile} className="hover:text-ink">Profile</Link>
          <Link href={ROUTES.heist} className="hover:text-ink">Play</Link>
          <Link href={ROUTES.cv} className="hover:text-ink">{cvLabels(candidate).short}</Link>
          <Link href={ROUTES.present} className="hover:text-ink">QR codes</Link>
        </div>
      </div>
    </footer>
  );
}
