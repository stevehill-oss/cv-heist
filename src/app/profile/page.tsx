import type { Metadata } from "next";
import Link from "next/link";
import { SaveContact, ShareButton, TiltCard } from "@/components/client";
import { ArrowRight, FileIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { CvDownload, CvLink, LinkedInLink, Tbc } from "@/components/ProfileLinks";
import { Pending, Section } from "@/components/ProfileSections";
import { candidate } from "@/content/candidate";
import { ROUTES, cvLabels, displayName, initials, publicItems } from "@/lib/profile";

export const metadata: Metadata = { title: "Professional Profile" };

export default function ProfilePage() {
  const p = candidate;
  const labels = cvLabels(p);
  const skills = publicItems(p.skills);
  const experience = publicItems(p.experience);
  const projects = publicItems(p.projects);
  const certs = publicItems(p.certifications);
  const education = publicItems(p.education);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-16">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="eyebrow rise">Professional profile</p>
          <h1 className="rise rise-2 mt-4 text-[clamp(2.4rem,7.5vw,4.5rem)] font-semibold" data-testid="candidate-name">
            {p.name ?? <span className="text-ink/90">Name <span className="text-amber">to be confirmed</span></span>}
          </h1>
          <p className="rise rise-3 mt-4 font-display text-xl text-cyan sm:text-2xl">{p.headline}</p>
          <div className="rise rise-3 mt-5 max-w-xl text-ink-2">
            {p.summary ? <p className="text-lg leading-relaxed">{p.summary}</p> : (
              <div className="flex flex-col items-start gap-3">
                <Tbc>Professional introduction to be confirmed</Tbc>
                <p>The introduction will be written from the CV and LinkedIn profile, and nothing goes here until it is checked.</p>
              </div>
            )}
          </div>
          <div className="rise rise-4 mt-8 flex flex-wrap gap-3">
            <LinkedInLink className="w-full sm:w-auto" />
            <CvLink className="btn btn-secondary flex-1 sm:flex-none" />
          </div>
        </div>

        <TiltCard className="rise rise-3 mx-auto w-full max-w-sm">
          <article className="glass glow-edge overflow-hidden p-6" aria-label="Digital identity card">
            <div className="flex items-start justify-between">
              <p className="eyebrow !text-[0.65rem]">Digital identity</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-lime/10 px-2.5 py-1 font-mono text-[0.65rem] text-lime">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" /> AVAILABLE TO CONNECT
              </span>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-cyan/40 bg-gradient-to-br from-cyan/25 via-[#173247] to-[#3a6dff]/20 font-display text-2xl font-semibold text-cyan">
                {initials(p)}
                <span aria-hidden="true" className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-lg border border-line bg-card text-cyan">
                  <ShieldIcon width={15} height={15} />
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-semibold">{displayName(p)}</p>
                <p className="text-sm text-ink-2">{p.headline}</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line/70 pt-5 text-sm">
              <div>
                <dt className="eyebrow !text-[0.62rem]">Location</dt>
                <dd className="mt-1">{p.location ?? <span className="text-amber">TBC</span>}</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.62rem]">CV status</dt>
                <dd className="mt-1">{p.cvStatus === "complete" ? "Full CV" : <span className="text-amber">Preview</span>}</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.62rem]">LinkedIn</dt>
                <dd className="mt-1">{p.linkedinUrl ? <span className="text-lime">Linked</span> : <span className="text-amber">Not set</span>}</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.62rem]">Clearance</dt>
                <dd className="mt-1">Guest pass</dd>
              </div>
            </dl>
            <div aria-hidden="true" className="mt-6 flex h-8 items-end gap-[3px] opacity-60">
              {"3121423112413212431123142131".split("").map((n, i) => (
                <span key={i} className="bg-ink-2" style={{ width: `${Number(n)}px`, height: `${50 + ((i * 37) % 50)}%` }} />
              ))}
            </div>
          </article>
        </TiltCard>
      </section>

      {/* Quick actions */}
      <section aria-label="Save and share" className="glass mt-12 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-display text-lg font-semibold">Keep in touch</p>
          <p className="text-sm text-ink-2">Save the contact to your phone or pass this profile on.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SaveContact />
          <ShareButton route={ROUTES.profile} title={`${displayName(p)} · Profile`} text="Worth a look:" />
        </div>
      </section>

      <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
        <div className="space-y-16">
          <Section id="skills" eyebrow="Capabilities" title="Skills">
            {skills.length ? (
              <ul className="flex flex-wrap gap-2.5">
                {skills.map((s) => (
                  <li key={s.name} className="rounded-full border border-line bg-raised/60 px-4 py-2 text-sm">{s.name}</li>
                ))}
              </ul>
            ) : <Pending what="Confirmed skills" rows={2} />}
          </Section>

          <Section id="experience" eyebrow="Career" title="Experience">
            {experience.length ? (
              <ol className="relative space-y-8 border-l border-line pl-6">
                {experience.map((e) => (
                  <li key={`${e.organisation}-${e.start}`} className="relative">
                    <span aria-hidden="true" className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-cyan bg-bg" />
                    <p className="font-mono text-xs text-ink-2">{e.start} to {e.end ?? "present"}</p>
                    <h3 className="mt-1 text-lg font-semibold">{e.role}</h3>
                    <p className="text-cyan">{e.organisation}</p>
                    {e.summary && <p className="mt-2 text-ink-2">{e.summary}</p>}
                  </li>
                ))}
              </ol>
            ) : <Pending what="Verified roles and dates" rows={3} />}
          </Section>

          <Section id="projects" eyebrow="Work" title="Projects">
            {projects.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((pr) => (
                  <article key={pr.title} className="glass p-5">
                    <h3 className="text-lg font-semibold">{pr.title}</h3>
                    <p className="mt-2 text-sm text-ink-2">{pr.description}</p>
                    {pr.url && <a href={pr.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-cyan underline-offset-4 hover:underline">View project</a>}
                  </article>
                ))}
              </div>
            ) : <Pending what="Published projects" rows={2} />}
          </Section>

          {(certs.length > 0 || education.length > 0) && (
            <Section id="credentials" eyebrow="Credentials" title="Certifications and education">
              <ul className="space-y-3">
                {certs.map((c) => (
                  <li key={c.name} className="glass flex items-center justify-between gap-3 p-4">
                    <span><span className="font-semibold">{c.name}</span> <span className="text-ink-2">· {c.issuer}</span></span>
                    {c.year && <span className="font-mono text-xs text-ink-2">{c.year}</span>}
                  </li>
                ))}
                {education.map((ed) => (
                  <li key={ed.qualification} className="glass flex items-center justify-between gap-3 p-4">
                    <span><span className="font-semibold">{ed.qualification}</span> <span className="text-ink-2">· {ed.institution}</span></span>
                    {ed.year && <span className="font-mono text-xs text-ink-2">{ed.year}</span>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="cv-card-title" className="glass glow-edge p-6">
            <p className="eyebrow">Document</p>
            <h2 id="cv-card-title" className="mt-2 text-2xl font-semibold">{labels.document}</h2>
            <div aria-hidden="true" className="mx-auto mt-6 w-40 rotate-[-3deg] rounded-md bg-ink/95 p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9)]">
              <div className="h-2 w-2/3 rounded-full bg-bg/80" />
              <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-cyan" />
              <div className="mt-4 space-y-1.5">
                {[90, 75, 85, 60, 80, 50].map((w) => <div key={w} className="h-1 rounded-full bg-bg/25" style={{ width: `${w}%` }} />)}
              </div>
            </div>
            {p.cvStatus === "preview" && <p className="mt-6 text-sm text-amber">Full CV to be added.</p>}
            <div className="mt-5 flex flex-col gap-3">
              <CvLink className="btn btn-primary" />
              <CvDownload />
            </div>
          </section>

          <Link href={ROUTES.heist} className="glass glow-edge amber group block p-6 transition-transform hover:-translate-y-0.5">
            <p className="eyebrow flex items-center gap-2"><LockIcon width={14} height={14} /> Side quest</p>
            <p className="mt-3 font-display text-2xl font-semibold">Think you can steal my CV?</p>
            <p className="mt-2 text-sm text-ink-2">Three clues, one vault, about a minute. No technical knowledge needed.</p>
            <span className="mt-5 inline-flex items-center gap-2 font-display font-semibold text-amber">
              Start the heist <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <p className="flex items-start gap-2 px-1 text-xs text-ink-2">
            <FileIcon width={14} height={14} className="mt-0.5 shrink-0" />
            Only details checked against the CV or LinkedIn are shown. Nothing on this page is made up.
          </p>
        </aside>
      </div>
    </div>
  );
}
