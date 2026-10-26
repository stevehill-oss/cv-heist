"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState, type RefObject } from "react";
import { ShareButton } from "@/components/client";
import { ArrowRight, BulbIcon, CheckIcon, FileIcon, LockIcon, ReplayIcon } from "@/components/icons";
import { LinkedInLink } from "@/components/ProfileLinks";
import { Vault } from "@/components/Vault";
import { candidate } from "@/content/candidate";
import { ACCOUNT_SESSION_KEY, accountUsername, formatDuration, heistRank } from "@/lib/account";
import { ALL_STAGES, VAULT_CODE, gameReducer, hintsFor, initialState, isValidState, stagesDone, totals, type GameState, type PlayStage } from "@/lib/game";
import { ROUTES, cvLabels, displayName } from "@/lib/profile";
import { CipherStage, LogStage, LoginStage, VaultStage } from "./stages";

const STORAGE_KEY = "cv-heist:game";
const STAGE_META: Record<PlayStage, { n: string; title: string; prompt: string }> = {
  logs: { n: "01", title: "Find the weakness", prompt: "One request should never have succeeded. Find it." },
  cipher: { n: "02", title: "Crack the cipher", prompt: "Intercepted message. The sender is always one letter ahead." },
  vault: { n: "03", title: "Unlock the vault", prompt: "Two fragments recovered. The last digit is hiding in the logs." },
  login: {
    n: "04",
    title: "Break into the account",
    prompt: "Inside the vault: a laptop, still signed out. Its owner works in security, so the password must be strong. Surely.",
  },
};

function loadSaved(): GameState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function HeistGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const restored = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevStage = useRef(state.stage);

  // Resume an unfinished heist after a refresh or back navigation.
  useEffect(() => {
    const saved = loadSaved();
    if (saved) dispatch({ type: "RESTORE", state: saved });
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      if (state.stage === "intro") sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage blocked: the game still works, it just won't resume */
    }
  }, [state]);

  // Cracking the account here also signs you in on the /account page.
  useEffect(() => {
    if (!state.login.success) return;
    try {
      sessionStorage.setItem(ACCOUNT_SESSION_KEY, "1");
    } catch {
      /* storage blocked: /account will just ask again */
    }
  }, [state.login.success]);

  // Move focus to the new stage heading so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (prevStage.current !== state.stage) {
      prevStage.current = state.stage;
      // Back to the top so the progress bar and evidence tray stay in view.
      window.scrollTo({ top: 0 });
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [state.stage]);

  if (state.stage === "intro") return <Intro onStart={() => dispatch({ type: "START", at: Date.now() })} />;
  if (state.stage === "open") return <Reveal state={state} headingRef={headingRef} onReplay={() => dispatch({ type: "RESET" })} />;

  const stage = state.stage;
  const meta = STAGE_META[stage];
  const { shown: hints, more: moreHints } = hintsFor(state);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10">
      <GameBar state={state} onAbandon={() => dispatch({ type: "RESET" })} />

      <section aria-labelledby="stage-title" className="mt-6 sm:mt-8">
        <p className="eyebrow">Stage {meta.n} of 04</p>
        <h1 id="stage-title" ref={headingRef} tabIndex={-1} className="mt-2 scroll-mt-20 text-3xl font-semibold outline-none sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-2 max-w-xl text-lg text-ink-2">{meta.prompt}</p>

        <div className="mt-6">
          {stage === "logs" && <LogStage state={state} dispatch={dispatch} />}
          {stage === "cipher" && <CipherStage state={state} dispatch={dispatch} />}
          {stage === "vault" && <VaultStage state={state} dispatch={dispatch} />}
          {stage === "login" && <LoginStage state={state} dispatch={dispatch} />}
        </div>

        <FeedbackBar state={state} onContinue={() => dispatch({ type: "CONTINUE", at: Date.now() })} />

        <div className="mt-6 flex flex-col gap-3">
          {hints.length > 0 && (
            <ol className="space-y-2" aria-label="Hints">
              {hints.map((h, i) => (
                <li key={h} className="flex gap-3 rounded-xl border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-amber">
                  <BulbIcon width={16} height={16} className="mt-0.5 shrink-0" />
                  <span><span className="sr-only">Hint {i + 1}: </span>{h}</span>
                </li>
              ))}
            </ol>
          )}
          {!state.solved && moreHints && (
            <button type="button" className="btn btn-ghost self-start !px-0 text-sm" onClick={() => dispatch({ type: "SHOW_HINT" })}>
              <BulbIcon width={16} height={16} /> {hints.length ? "Another hint" : "Need a hint?"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  const labels = cvLabels(candidate);
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-8 overflow-x-clip px-4 pt-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-16">
      <div className="rise mx-auto w-[min(58vw,22rem)] [@media(max-height:700px)]:w-[min(42vw,14rem)] lg:order-2 lg:w-full lg:max-w-[30rem]">
        <Vault progress={0} />
      </div>
      <div className="mx-auto w-full max-w-xl lg:order-1 lg:max-w-none">
        <p className="eyebrow rise">The CV Heist</p>
        <h1 className="rise rise-2 mt-4 text-[clamp(2.4rem,8.5vw,4.75rem)] font-semibold">
          Think you can <span className="text-amber">steal</span> my CV?
        </h1>
        <p className="rise rise-3 mt-5 max-w-md text-lg text-ink-2">
          Three clues, one locked vault, one account. Find the weakness, crack the code, guess the password and take the file.
        </p>

        <ol className="rise rise-3 mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="The four stages">
          {ALL_STAGES.map((s) => (
            <li key={s} className="rounded-xl border border-line/80 bg-card/60 px-3 py-2.5">
              <span className="font-mono text-[0.65rem] text-ink-2">{STAGE_META[s].n}</span>
              <span className="mt-0.5 block text-xs leading-snug text-ink sm:text-sm">{STAGE_META[s].title}</span>
            </li>
          ))}
        </ol>

        <button type="button" onClick={onStart} className="btn btn-primary rise rise-4 mt-7 w-full text-lg sm:w-auto sm:px-8" data-testid="start-heist">
          START THE HEIST <ArrowRight />
        </button>
        <p className="mt-3 font-mono text-xs text-ink-2">About 90 seconds. You're on the clock. No technical knowledge needed.</p>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-line/60 pt-6">
          <Link href={ROUTES.profile} className="btn btn-secondary flex-1 sm:flex-none">Professional Profile</Link>
          <Link href={ROUTES.cv} className="btn btn-secondary flex-1 sm:flex-none"><FileIcon /> {labels.short}</Link>
          <LinkedInLink className="w-full sm:w-auto" label="LinkedIn" />
        </div>
      </div>
    </div>
  );
}

function GameBar({ state, onAbandon }: { state: GameState; onAbandon: () => void }) {
  const got = stagesDone(state);
  const slots = [state.fragments.logs, state.fragments.cipher, state.fragments.vault];
  return (
    <div className="glass flex items-center gap-3 p-2.5 sm:gap-4 sm:p-3">
      <ol className="flex items-center gap-1.5" aria-label={`Progress: ${got} of 4 stages complete`}>
        {ALL_STAGES.map((s, i) => {
          const done = s === "login" ? state.login.success : !!slots[i];
          const current = state.stage === s;
          return (
            <li
              key={s}
              aria-current={current ? "step" : undefined}
              className={`h-2 rounded-full transition-all duration-500 ${done ? "w-6 bg-lime sm:w-8" : current ? "w-6 bg-cyan sm:w-8" : "w-3 bg-line sm:w-4"}`}
            >
              <span className="sr-only">{STAGE_META[s].title}: {done ? "done" : current ? "in progress" : "locked"}</span>
            </li>
          );
        })}
      </ol>

      <div className="ml-auto flex items-center gap-1.5" aria-label="Evidence recovered">
        <span className="eyebrow mr-1 hidden !text-[0.62rem] sm:inline">Evidence</span>
        {slots.map((f, i) => (
          <span
            key={i}
            data-testid={`fragment-${i}`}
            className={`grid h-9 w-9 place-items-center rounded-lg border font-mono text-base font-semibold transition-all duration-500 ${f ? "border-lime/60 bg-lime/10 text-lime" : "border-dashed border-line text-ink-2/50"}`}
          >
            {f ?? "?"}
            <span className="sr-only">{f ? `Fragment ${i + 1}: ${f}` : `Fragment ${i + 1}: not found yet`}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center border-l border-line/60 pl-1.5 sm:pl-3">
        <Link href={ROUTES.profile} className="hidden rounded-lg px-2 py-2 text-xs text-ink-2 hover:text-ink sm:inline">Skip to profile</Link>
        <button type="button" onClick={onAbandon} className="rounded-lg px-2 py-2 text-xs text-ink-2 hover:text-ink" data-testid="abandon">
          Quit
        </button>
      </div>
    </div>
  );
}

function FeedbackBar({ state, onContinue }: { state: GameState; onContinue: () => void }) {
  const fb = state.feedback;
  // Re-key on every new message so the shake replays and screen readers re-announce.
  const tone = !fb ? "" : fb.kind === "success" ? "border-lime/50 bg-lime/[0.08] text-lime" : fb.kind === "error" ? "border-danger/50 bg-danger/[0.08] text-danger shake" : "border-cyan/40 bg-cyan/[0.06] text-cyan";
  const attempts =
    state.stage === "login" ? state.login.attempts
    : state.stage === "logs" || state.stage === "cipher" || state.stage === "vault" ? state.attempts[state.stage]
    : 0;
  const next = state.stage === "vault" ? "Open the vault" : state.stage === "login" ? "Open the dossier" : "Next stage";
  return (
    <div className="mt-5 min-h-[3.5rem]">
      <div role="status" aria-live="polite" aria-atomic="true">
        {fb && (
          <p key={`${fb.message}-${attempts}`} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm sm:text-base ${tone}`} data-testid="feedback">
            {fb.kind === "success" ? <CheckIcon className="mt-0.5 shrink-0" /> : <LockIcon width={18} height={18} className="mt-0.5 shrink-0" />}
            {fb.message}
          </p>
        )}
      </div>
      {state.solved && (
        <button type="button" onClick={onContinue} className="btn btn-lime mt-4 w-full sm:w-auto" autoFocus data-testid="continue">
          {next} <ArrowRight />
        </button>
      )}
    </div>
  );
}

function Reveal({ state, headingRef, onReplay }: { state: GameState; headingRef: RefObject<HTMLHeadingElement | null>; onReplay: () => void }) {
  const complete = candidate.cvStatus === "complete";
  const labels = cvLabels(candidate);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setShown(true), reduce ? 0 : 1900);
    return () => clearTimeout(t);
  }, []);
  const { hints, misses, seconds } = totals(state);
  const rank = heistRank(hints, misses, seconds);
  const time = seconds === null ? null : formatDuration(seconds);
  const brag = `I cracked the CV Heist${time ? ` in ${time}` : ""} and ranked ${rank.title}. Think you can beat that?`;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="grid items-center gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
        <div className="mx-auto w-[min(64vw,19rem)] md:w-full md:max-w-sm">
          <Vault progress={3} status="open">
            <div className="flex flex-col items-center gap-2 text-lime">
              <FileIcon width={44} height={44} />
              <span className="font-mono text-[0.6rem] tracking-[0.2em]">{complete ? "CV.PDF" : "DOSSIER"}</span>
            </div>
          </Vault>
        </div>

        <section aria-labelledby="reveal-title" className={`transition-all duration-700 ${shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <p className="eyebrow !text-lime flex items-center gap-2"><CheckIcon width={14} height={14} /> ACCESS GRANTED</p>
          <h1 id="reveal-title" ref={headingRef} tabIndex={-1} className="mt-3 text-[clamp(2rem,6.5vw,3.5rem)] font-semibold outline-none" data-testid="reveal-title">
            {complete ? "CONGRATULATIONS. YOU'VE STOLEN MY CV." : "YOU'VE CRACKED MY PROFILE."}
          </h1>
          <p className="mt-4 text-lg text-ink-2">
            {complete ? "The only file I'm happy for you to take." : "The full CV is coming. The LinkedIn connection is ready now."}
          </p>

          <div className="glass glow-edge mt-6 p-5" aria-label="Professional dossier">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow">{complete ? "Recovered file" : "Professional dossier"}</p>
              <span className="font-mono text-[0.65rem] text-lime">signed in as {accountUsername(candidate.name)}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-semibold">{displayName(candidate)}</p>
            <p className="text-cyan">{candidate.headline}</p>
            <div className="mt-4 flex items-center gap-3 border-t border-line/60 pt-4" data-testid="rank">
              <span className="rounded-lg border border-amber/50 bg-amber/10 px-2.5 py-1 font-mono text-sm font-semibold uppercase tracking-wider text-amber">
                {rank.title}
              </span>
              <p className="text-sm text-ink-2">{rank.line}</p>
            </div>
            <p className="mt-3 font-mono text-xs text-ink-2">
              {`${time ? `Time ${time} · ` : ""}Code ${VAULT_CODE} · ${hints} hint${hints === 1 ? "" : "s"} · ${misses} wrong guess${misses === 1 ? "" : "es"}`}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <LinkedInLink className="sm:col-span-2" />
            <Link href={ROUTES.profile} className="btn btn-primary">Explore the profile <ArrowRight /></Link>
            <Link href={ROUTES.cv} className="btn btn-secondary"><FileIcon /> {labels.view}</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={onReplay} className="btn btn-ghost !px-0" data-testid="replay"><ReplayIcon /> Play again</button>
            <ShareButton route={ROUTES.heist} title="The CV Heist" text={brag} className="btn btn-ghost" />
          </div>
        </section>
      </div>
    </div>
  );
}
