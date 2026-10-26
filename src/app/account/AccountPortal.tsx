"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { SaveContact } from "@/components/client";
import { ArrowRight, CheckIcon, FileIcon, LockIcon, ShieldIcon, TerminalIcon } from "@/components/icons";
import { LoginForm } from "@/components/LoginForm";
import { CvLink, LinkedInLink, Tbc } from "@/components/ProfileLinks";
import { candidate } from "@/content/candidate";
import { ACCOUNT_SESSION_KEY, LOGIN_HINTS, accountUsername, initialLogin, showLoginHint, submitPassword } from "@/lib/account";
import { ROUTES, displayName, initials, summaryParagraphs } from "@/lib/profile";

export function AccountPortal() {
  const [login, setLogin] = useState(initialLogin);
  const [ready, setReady] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const username = accountUsername(candidate.name);

  // Stay signed in for this browser tab, including after winning the heist.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(ACCOUNT_SESSION_KEY) === "1") setLogin((l) => ({ ...l, success: true }));
    } catch {
      /* storage blocked: just ask for the password */
    }
    setReady(true);
  }, []);

  const signIn = (input: string) => {
    const next = submitPassword(login, input, Date.now());
    setLogin(next);
    if (next.success) {
      try {
        sessionStorage.setItem(ACCOUNT_SESSION_KEY, "1");
      } catch {
        /* storage blocked: signed in until the page closes */
      }
      setTimeout(() => headingRef.current?.focus(), 0);
    }
  };

  const signOut = () => {
    try {
      sessionStorage.removeItem(ACCOUNT_SESSION_KEY);
    } catch {
      /* nothing stored */
    }
    setLogin(initialLogin);
  };

  if (ready && login.success) return <AccountHome username={username} headingRef={headingRef} onSignOut={signOut} />;

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="eyebrow rise flex items-center gap-2"><LockIcon width={14} height={14} /> Restricted</p>
        <h1 className="rise rise-2 mt-4 text-[clamp(2.2rem,7vw,3.75rem)] font-semibold">
          Account <span className="text-amber">locked.</span>
        </h1>
        <p className="rise rise-3 mt-4 max-w-md text-lg text-ink-2">
          The dossier is behind a sign-in. The owner works in cybersecurity, so the password is bound to be strong.
          Probably.
        </p>
        <p className="rise rise-3 mt-4 max-w-md text-ink-2">
          Stuck? Tap <span className="text-amber">Forgot password?</span> for a riddle. Or{" "}
          <Link href={ROUTES.heist} className="text-cyan underline-offset-4 hover:underline">play the full heist</Link>{" "}
          to earn your way in.
        </p>
        <p className="rise rise-4 mt-6 text-sm text-ink-2">
          Just want to connect? <Link href={ROUTES.profile} className="text-cyan underline-offset-4 hover:underline">The profile is open to everyone.</Link>
        </p>
      </div>

      <div className="rise rise-3">
        <LoginForm
          username={username}
          login={login}
          hints={LOGIN_HINTS.slice(0, login.hintsShown)}
          moreHints={login.hintsShown < LOGIN_HINTS.length}
          onSubmit={signIn}
          onHint={() => setLogin(showLoginHint)}
        />
      </div>
    </div>
  );
}

function AccountHome({ username, headingRef, onSignOut }: { username: string; headingRef: RefObject<HTMLHeadingElement | null>; onSignOut: () => void }) {
  const p = candidate;
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow !text-lime flex items-center gap-2"><CheckIcon width={14} height={14} /> Signed in as {username}</p>
        <button type="button" onClick={onSignOut} className="btn btn-ghost !px-0 text-sm" data-testid="sign-out">Sign out</button>
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-[clamp(2.2rem,7vw,3.75rem)] font-semibold outline-none" data-testid="account-title">
        Welcome back{p.name ? `, ${p.name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink-2">
        Well, not really. You're not {p.name ? p.name.split(" ")[0] : "the owner"}. But you got in, so the dossier is yours.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section aria-label="Dossier" className="glass glow-edge p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-cyan/40 bg-gradient-to-br from-cyan/25 to-[#3a6dff]/20 font-display text-xl font-semibold text-cyan">
              {initials(p)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-2xl font-semibold">{displayName(p)}</p>
              <p className="text-cyan">{p.headline}</p>
            </div>
          </div>
          <div className="mt-5 border-t border-line/60 pt-5 text-ink-2">
            {p.summary ? (
              <div className="space-y-3 leading-relaxed">{summaryParagraphs(p).map((para) => <p key={para}>{para}</p>)}</div>
            ) : <Tbc>Introduction to be confirmed</Tbc>}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="eyebrow !text-[0.62rem]">Account</dt><dd className="mt-1 truncate font-mono">{username}</dd></div>
            <div><dt className="eyebrow !text-[0.62rem]">Clearance</dt><dd className="mt-1 text-lime">Admin (stolen)</dd></div>
            <div><dt className="eyebrow !text-[0.62rem]">Location</dt><dd className="mt-1">{p.location ?? <span className="text-amber">TBC</span>}</dd></div>
            <div><dt className="eyebrow !text-[0.62rem]">Password strength</dt><dd className="mt-1 text-danger">Embarrassing</dd></div>
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkedInLink className="w-full sm:w-auto" />
            <CvLink className="btn btn-secondary" />
            <SaveContact />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="glass p-5">
            <p className="eyebrow flex items-center gap-2"><ShieldIcon width={14} height={14} /> Security note</p>
            <p className="mt-3 text-sm text-ink-2">
              The password was a dictionary word plus a well-known number. Real attackers try those first, in seconds.
              Use a password manager and long, random passphrases.
            </p>
          </div>
          <Link href={ROUTES.heist} className="glass glow-edge amber group block p-5">
            <p className="eyebrow flex items-center gap-2"><TerminalIcon width={14} height={14} /> Full heist</p>
            <p className="mt-2 font-display text-xl font-semibold">Go for a rank</p>
            <p className="mt-1 text-sm text-ink-2">Four stages, a timer and a rank to beat.</p>
            <span className="mt-3 inline-flex items-center gap-2 font-display font-semibold text-amber">
              Play <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link href={ROUTES.profile} className="btn btn-secondary w-full"><FileIcon /> Full profile</Link>
        </aside>
      </div>
    </div>
  );
}
