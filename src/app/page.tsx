import Link from "next/link";
import { ArrowRight, BriefcaseIcon, TerminalIcon } from "@/components/icons";
import { LinkedInLink, Tbc } from "@/components/ProfileLinks";
import { Vault } from "@/components/Vault";
import { candidate } from "@/content/candidate";
import { ROUTES, initials } from "@/lib/profile";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-16 lg:pt-24">
      <section className="max-w-3xl">
        <p className="eyebrow rise flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-2 text-lime">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" /> Online
          </span>
          <span aria-hidden="true">/</span>
          <span>{candidate.headline}</span>
        </p>
        <h1 className="rise rise-2 mt-5 text-[clamp(2.6rem,9vw,5.5rem)] font-semibold">
          Two ways <span className="text-cyan">in.</span>
        </h1>
        <div className="rise rise-3 mt-5 flex flex-wrap items-center gap-3 text-lg text-ink-2">
          {candidate.name ? <span className="text-ink">{candidate.name}.</span> : <Tbc>Name to be confirmed</Tbc>}
          <span>Pick how you want to meet.</span>
        </div>
      </section>

      <section aria-label="Choose an experience" className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2 md:gap-6">
        <Link
          href={ROUTES.profile}
          className="glass glow-edge rise rise-3 group flex min-h-[19rem] flex-col overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
          data-testid="door-professional"
        >
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 text-cyan">
              <BriefcaseIcon />
            </span>
            <span className="eyebrow">01 / Profile</span>
          </div>
          <div aria-hidden="true" className="mt-8 flex items-center gap-4 rounded-2xl border border-line/70 bg-bg-2/60 p-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan/30 to-[#3a6dff]/20 font-display font-semibold text-cyan">
              {initials(candidate)}
            </span>
            <span className="flex flex-1 flex-col gap-2">
              <span className="h-2.5 w-3/5 rounded-full bg-ink/80" />
              <span className="h-2 w-2/5 rounded-full bg-ink-2/40" />
            </span>
            <span className="h-7 w-7 rounded-md bg-[#0a66c2]/80" />
          </div>
          <h2 className="mt-auto pt-8 text-3xl font-semibold tracking-tight sm:text-4xl">THE PROFESSIONAL</h2>
          <p className="mt-2 text-ink-2">View my experience and connect.</p>
          <span className="mt-6 inline-flex items-center gap-2 font-display font-semibold text-cyan">
            Open profile <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href={ROUTES.heist}
          className="glass glow-edge amber rise rise-4 group relative flex min-h-[19rem] flex-col overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
          data-testid="door-hacker"
        >
          <div className="relative z-10 flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber/40 bg-amber/10 text-amber">
              <TerminalIcon />
            </span>
            <span className="eyebrow rounded-md bg-card/80 px-1.5 py-0.5">02 / Game</span>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -right-14 top-20 w-60 opacity-80 transition-transform duration-700 group-hover:rotate-12 sm:-right-8 sm:w-64">
            <Vault progress={0} />
          </div>
          <h2 className="relative mt-auto pt-40 text-3xl font-semibold tracking-tight sm:text-4xl">THE HACKER</h2>
          <p className="relative mt-2 text-ink-2">Think you can steal my CV?</p>
          <span className="relative mt-6 inline-flex items-center gap-2 font-display font-semibold text-amber">
            Start the heist <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <LinkedInLink />
        <p className="text-sm text-ink-2">No game required. The LinkedIn link is always one tap away.</p>
      </section>
      <p className="mt-4 text-sm text-ink-2">
        Think you can guess my password?{" "}
        <Link href={ROUTES.account} className="text-amber underline-offset-4 hover:underline" data-testid="landing-account">Try the locked account</Link>.
      </p>
    </div>
  );
}
