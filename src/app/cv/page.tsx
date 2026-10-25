import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "@/components/icons";
import { CvDownload, LinkedInLink, Tbc } from "@/components/ProfileLinks";
import { candidate } from "@/content/candidate";
import { ROUTES, cvLabels, publicItems } from "@/lib/profile";

export const metadata: Metadata = { title: "CV" };

function Block({ title, empty, children }: { title: string; empty: boolean; children?: ReactNode }) {
  return (
    <section className="border-t border-line/70 py-6 first:border-t-0 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-6">
      <h2 className="eyebrow !text-cyan">{title}</h2>
      <div className="mt-3 sm:mt-0">{empty ? <Tbc /> : children}</div>
    </section>
  );
}

export default function CvPage() {
  const p = candidate;
  const labels = cvLabels(p);
  const experience = publicItems(p.experience);
  const skills = publicItems(p.skills);
  const certs = publicItems(p.certifications);
  const education = publicItems(p.education);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href={ROUTES.profile} className="btn btn-ghost !px-0"><ArrowLeft /> Back to profile</Link>
        <span className="eyebrow">{labels.document}</span>
      </div>

      {p.cvStatus === "preview" && (
        <div className="no-print mt-4 rounded-2xl border border-amber/40 bg-amber/[0.07] p-4 text-sm text-amber" role="note" data-testid="preview-banner">
          <strong className="font-display">This is a profile preview, not the full CV.</strong> Full CV to be added.
          Anything marked “to be confirmed” has not been checked yet and is deliberately left blank.
        </div>
      )}

      <article className="glass print-sheet mt-6 p-6 sm:p-10" aria-label={labels.document}>
        <header className="flex flex-col gap-5 border-b border-line/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{labels.document}</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{p.name ?? <Tbc>Name to be confirmed</Tbc>}</h1>
            <p className="mt-2 font-display text-lg text-cyan">{p.headline}</p>
          </div>
          <ul className="space-y-1 text-sm text-ink-2 sm:text-right">
            {p.location && <li>{p.location}</li>}
            {p.email && <li><a className="hover:text-ink" href={`mailto:${p.email}`}>{p.email}</a></li>}
            {p.linkedinUrl && <li><a className="hover:text-ink" href={p.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn profile</a></li>}
          </ul>
        </header>

        <Block title="Summary" empty={!p.summary}><p className="leading-relaxed">{p.summary}</p></Block>

        <Block title="Experience" empty={experience.length === 0}>
          <ol className="space-y-5">
            {experience.map((e) => (
              <li key={`${e.organisation}-${e.start}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-display text-lg font-semibold">{e.role}, <span className="text-cyan">{e.organisation}</span></h3>
                  <span className="font-mono text-xs text-ink-2">{e.start} to {e.end ?? "present"}</span>
                </div>
                {e.summary && <p className="mt-1 text-ink-2">{e.summary}</p>}
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Skills" empty={skills.length === 0}>
          <p>{skills.map((s) => s.name).join(" · ")}</p>
        </Block>

        <Block title="Certifications" empty={certs.length === 0}>
          <ul className="space-y-1">{certs.map((c) => <li key={c.name}>{c.name}, {c.issuer}{c.year ? ` (${c.year})` : ""}</li>)}</ul>
        </Block>

        <Block title="Education" empty={education.length === 0}>
          <ul className="space-y-1">{education.map((e) => <li key={e.qualification}>{e.qualification}, {e.institution}{e.year ? ` (${e.year})` : ""}</li>)}</ul>
        </Block>

        {p.cvStatus === "preview" && (
          <p className="border-t border-line/70 pt-6 font-mono text-xs text-amber">Full CV to be added.</p>
        )}
      </article>

      <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <LinkedInLink />
        <CvDownload />
      </div>
    </div>
  );
}
