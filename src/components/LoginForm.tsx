"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LoginState } from "@/lib/account";
import { ArrowRight, BulbIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, UnlockIcon, UserIcon } from "./icons";

interface Props {
  username: string;
  login: LoginState;
  hints: readonly string[];
  moreHints: boolean;
  onSubmit: (input: string) => void;
  onHint: () => void;
  /** Show the feedback line here. The heist has its own feedback bar. */
  showFeedback?: boolean;
}

/** Seconds left on the playful lockout, ticking down live. */
function useLockCountdown(lockedUntil: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (lockedUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [lockedUntil]);
  return Math.max(0, Math.ceil((lockedUntil - now) / 1000));
}

/** A basic account sign-in screen. The password is never stored or sent anywhere. */
export function LoginForm({ username, login, hints, moreHints, onSubmit, onHint, showFeedback = true }: Props) {
  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const locked = useLockCountdown(login.lockedUntil);
  const wrong = login.feedback?.kind === "error";
  const fb = login.feedback;

  return (
    <div className="glass glow-edge mx-auto w-full max-w-md overflow-hidden" data-testid="login-panel">
      <div className="flex items-center gap-2 border-b border-line/60 bg-bg-2/60 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-lime/70" />
        </span>
        <span className="ml-2 truncate font-mono text-[0.68rem] text-ink-2">secure-portal / sign-in</span>
        <span className={`ml-auto ${login.success ? "text-lime" : "text-amber"}`} aria-hidden="true">
          {login.success ? <UnlockIcon width={16} height={16} /> : <LockIcon width={16} height={16} />}
        </span>
      </div>

      <form
        className="p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
          inputRef.current?.focus();
        }}
      >
        <label className="eyebrow !text-[0.62rem]" htmlFor={`${id}-user`}>Username</label>
        <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-line bg-bg-2/70 px-3.5">
          <UserIcon width={16} height={16} className="shrink-0 text-ink-2" />
          <input id={`${id}-user`} readOnly value={username} className="h-12 w-full bg-transparent font-mono text-sm text-ink outline-none" />
        </div>

        <label className="eyebrow mt-5 block !text-[0.62rem]" htmlFor={`${id}-pass`}>Password</label>
        <div
          key={`pw-${login.attempts}`}
          className={`mt-1.5 flex items-center gap-2 rounded-xl border bg-bg-2/70 pl-3.5 transition-colors focus-within:border-cyan ${
            login.success ? "border-lime" : wrong ? "border-danger/70 shake" : "border-line"
          }`}
        >
          <LockIcon width={16} height={16} className="shrink-0 text-ink-2" />
          <input
            ref={inputRef}
            id={`${id}-pass`}
            type={reveal ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={login.success}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="••••••••"
            className="h-12 w-full min-w-0 bg-transparent font-mono text-base text-ink outline-none placeholder:text-ink-2/40"
            data-testid="password-input"
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="grid h-12 w-12 shrink-0 place-items-center text-ink-2 hover:text-ink"
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
          >
            {reveal ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
          </button>
        </div>

        {showFeedback && (
          <div role="status" aria-live="polite" aria-atomic="true" className="min-h-[1.5rem]">
            {fb && (
              <p
                key={`${fb.message}-${login.attempts}`}
                className={`mt-3 flex items-start gap-2 text-sm ${fb.kind === "success" ? "text-lime" : fb.kind === "error" ? "text-danger" : "text-cyan"}`}
                data-testid="login-feedback"
              >
                {fb.kind === "success" ? <CheckIcon width={16} height={16} className="mt-0.5 shrink-0" /> : <LockIcon width={16} height={16} className="mt-0.5 shrink-0" />}
                {fb.message}
              </p>
            )}
          </div>
        )}

        {!login.success && (
          <button type="submit" className="btn btn-primary mt-4 w-full" disabled={locked > 0} data-testid="sign-in">
            {locked > 0 ? `Locked for ${locked}s` : <>Sign in <ArrowRight /></>}
          </button>
        )}

        {login.attempts > 0 && !login.success && (
          <p className="mt-3 text-center font-mono text-[0.68rem] text-ink-2">
            Failed attempts: {login.attempts} · logged, obviously
          </p>
        )}

        {hints.length > 0 && (
          <ol className="mt-5 space-y-2" aria-label="Password hints">
            {hints.map((h, i) => (
              <li key={h} className="flex gap-3 rounded-xl border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-amber">
                <BulbIcon width={16} height={16} className="mt-0.5 shrink-0" />
                <span><span className="sr-only">Hint {i + 1}: </span>{h}</span>
              </li>
            ))}
          </ol>
        )}
        {!login.success && moreHints && (
          <button type="button" onClick={onHint} className="btn btn-ghost mt-3 !px-0 text-sm" data-testid="forgot-password">
            <BulbIcon width={16} height={16} /> {hints.length ? "Another hint" : "Forgot password?"}
          </button>
        )}
      </form>
    </div>
  );
}
