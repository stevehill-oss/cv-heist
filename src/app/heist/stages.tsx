"use client";

import { useEffect, type Dispatch, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BackspaceIcon, CheckIcon, LockIcon } from "@/components/icons";
import { LoginForm } from "@/components/LoginForm";
import { Vault } from "@/components/Vault";
import { candidate } from "@/content/candidate";
import { accountUsername } from "@/lib/account";
import {
  CIPHER_TEXT,
  CODE_LENGTH,
  LOGS,
  decodedCipher,
  isBreach,
  progress,
  shiftLetter,
  type GameAction,
  type GameState,
} from "@/lib/game";

interface StageProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

/* ---------------------------------------------------------------- stage 1 */

export function LogStage({ state, dispatch }: StageProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "SUBMIT_LOG" });
      }}
    >
      <fieldset disabled={state.solved}>
        <legend className="sr-only">Security logs. Choose the request that should never have succeeded.</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {LOGS.map((log) => {
            const selected = state.selectedLog === log.id;
            const found = state.solved && isBreach(log);
            const denied = log.status === 403;
            return (
              <label
                key={log.id}
                data-testid={`log-${log.id}`}
                className={`group relative block cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 sm:p-5 ${
                  found
                    ? "border-lime bg-lime/[0.08] shadow-[0_0_0_1px_var(--color-lime),0_12px_40px_-16px_var(--color-lime)]"
                    : selected
                      ? "-translate-y-0.5 border-cyan bg-cyan/[0.07] shadow-[0_0_0_1px_var(--color-cyan),0_12px_40px_-18px_var(--color-cyan)]"
                      : "border-line bg-card/70 hover:border-cyan/50 hover:bg-raised/70"
                } has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan`}
              >
                <input
                  type="radio"
                  name="log"
                  value={log.id}
                  checked={selected}
                  onChange={() => dispatch({ type: "SELECT_LOG", id: log.id })}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.7rem] tracking-[0.15em] text-ink-2">LOG {log.id}</span>
                  <span
                    aria-hidden="true"
                    className={`h-4 w-4 rounded-full border-2 transition-colors ${selected || found ? "border-transparent bg-current text-cyan" : "border-line"} ${found ? "!text-lime" : ""}`}
                  />
                </div>
                <dl className="mt-3 space-y-1.5 font-mono text-[0.8rem] leading-tight sm:text-sm">
                  <div className="flex gap-2">
                    <dt className="text-cyan">{log.method}</dt>
                    <dd className="break-all text-ink">{log.path}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-ink-2">ROLE:</dt>
                    <dd>{log.role}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-ink-2">STATUS:</dt>
                    <dd>
                      <span className={`rounded-md px-1.5 py-0.5 ${denied ? "bg-danger/15 text-danger" : "bg-cyan/10 text-cyan"}`}>{log.status}</span>
                    </dd>
                  </div>
                </dl>
                {found && (
                  <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-lime text-bg">
                    <CheckIcon width={16} height={16} />
                    <span className="sr-only">Breach</span>
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>
      {!state.solved && (
        <button type="submit" className="btn btn-primary mt-5 w-full sm:w-auto" disabled={!state.selectedLog} data-testid="submit-log">
          {state.selectedLog ? `Flag log ${state.selectedLog}` : "Select a log"}
        </button>
      )}
    </form>
  );
}

/* ---------------------------------------------------------------- stage 2 */

export function CipherStage({ state, dispatch }: StageProps) {
  const word = decodedCipher(state);
  const shift = state.cipherShift;
  const shiftLabel = shift === 0 ? "0" : shift > 0 ? `+${shift}` : `${shift}`;

  return (
    <div className="glass p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm text-ink-2">
          Intercepted: <span className="tracking-[0.3em] text-amber">{CIPHER_TEXT}</span>
        </p>
        <p className="font-mono text-sm text-ink-2" aria-hidden="true">
          Shift <span className="text-cyan">{shiftLabel}</span>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: "SHIFT_CIPHER", delta: -1 })}
          disabled={state.solved}
          className="btn btn-secondary h-14 w-14 shrink-0 !p-0 sm:h-16 sm:w-16"
          aria-label="Move every letter back one"
          data-testid="cipher-back"
        >
          <ArrowLeft />
        </button>

        <div className="flex gap-1.5 sm:gap-2.5" aria-hidden="true">
          {[...CIPHER_TEXT].map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                key={`${word[i]}-${shift}`}
                className={`grid h-12 w-[clamp(2.1rem,10vw,3.75rem)] place-items-center rounded-xl border font-mono text-2xl font-semibold sm:h-16 sm:text-3xl ${
                  state.solved ? "border-lime/70 bg-lime/10 text-lime" : "border-line bg-bg-2 text-ink"
                } js-flip`}
              >
                {word[i]}
              </span>
              <span className="mt-1.5 font-mono text-[0.62rem] text-ink-2 sm:text-xs">
                {c}→{shiftLetter(c, shift)}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "SHIFT_CIPHER", delta: 1 })}
          disabled={state.solved}
          className="btn btn-secondary h-14 w-14 shrink-0 !p-0 sm:h-16 sm:w-16"
          aria-label="Move every letter forward one"
          data-testid="cipher-forward"
        >
          <ArrowRight />
        </button>
      </div>

      <p className="sr-only" aria-live="polite" data-testid="cipher-readout">
        Shift {shiftLabel}. The message now reads {word.split("").join(" ")}.
      </p>
      <p className="mt-4 text-center font-mono text-xs text-ink-2" aria-hidden="true" data-testid="cipher-word">
        Reads: <span className="text-ink">{word}</span>
      </p>

      {!state.solved && (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => dispatch({ type: "SUBMIT_CIPHER" })} className="btn btn-primary w-full sm:w-auto" data-testid="submit-cipher">
            Lock in “{word}”
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- stage 3 */

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function VaultStage({ state, dispatch }: StageProps) {
  // Physical keyboard support while this stage is on screen.
  useEffect(() => {
    if (state.solved) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (/^[0-9]$/.test(e.key)) {
        dispatch({ type: "PRESS_DIGIT", digit: e.key });
      } else if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "DELETE_DIGIT" });
      } else if (e.key === "Enter" && target?.tagName !== "BUTTON") {
        e.preventDefault();
        dispatch({ type: "SUBMIT_CODE" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.solved]);

  const wrong = state.feedback?.kind === "error";
  const slots = Array.from({ length: CODE_LENGTH }, (_, i) => state.code[i] ?? "");

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-10">
      <div>
        <div className="glass p-5">
          <p className="eyebrow">Recovered fragments</p>
          <div className="mt-4 flex gap-2.5">
            {[state.fragments.logs, state.fragments.cipher, null].map((f, i) => (
              <div key={i} className={`grid h-16 w-14 place-items-center rounded-xl border font-mono text-3xl font-semibold ${f ? "border-lime/60 bg-lime/10 text-lime" : "border-dashed border-amber/60 text-amber"}`}>
                {f ?? "?"}
              </div>
            ))}
          </div>
          <p className="mt-5 text-ink">
            <span className="font-semibold">The last digit:</span> how many guest requests to the protected vault succeeded in
            Stage 1?
          </p>
          <details className="group mt-4 rounded-xl border border-line/80 bg-bg-2/60">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 font-mono text-xs tracking-wider text-ink-2 hover:text-ink">
              REVIEW STAGE 1 LOGS
              <span className="transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
            </summary>
            <table className="w-full border-t border-line/60 font-mono text-xs">
              <caption className="sr-only">Stage 1 logs</caption>
              <thead className="text-left text-ink-2">
                <tr><th className="px-4 py-2 font-normal">LOG</th><th className="py-2 font-normal">PATH</th><th className="py-2 font-normal">ROLE</th><th className="py-2 pr-4 text-right font-normal">STATUS</th></tr>
              </thead>
              <tbody>
                {LOGS.map((l) => (
                  <tr key={l.id} className="border-t border-line/40">
                    <td className="px-4 py-2 text-ink-2">{l.id}</td>
                    <td className="py-2">{l.path}</td>
                    <td className="py-2">{l.role}</td>
                    <td className={`py-2 pr-4 text-right ${l.status === 403 ? "text-danger" : "text-cyan"}`}>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
        <div className="mx-auto mt-6 hidden w-48 md:block">
          <Vault progress={progress(state)} status={wrong ? "error" : "locked"} key={`v-${state.attempts.vault}`} />
        </div>
      </div>

      <div className="glass glow-edge mx-auto w-full max-w-sm self-start p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Vault keypad</p>
          <span className={`h-2.5 w-2.5 rounded-full ${state.solved ? "bg-lime shadow-[0_0_10px_var(--color-lime)]" : wrong ? "bg-danger shadow-[0_0_10px_var(--color-danger)]" : "bg-amber pulse-dot"}`} aria-hidden="true" />
        </div>
        <div
          key={`code-${state.attempts.vault}`}
          className={`mt-4 flex justify-center gap-2.5 ${wrong ? "shake" : ""}`}
          aria-label={`Code entered: ${state.code.length} of ${CODE_LENGTH} digits${state.code ? `, ${state.code.split("").join(" ")}` : ""}`}
          role="group"
          data-testid="code-display"
        >
          {slots.map((d, i) => (
            <span
              key={i}
              className={`grid h-16 w-14 place-items-center rounded-xl border font-mono text-3xl font-semibold transition-colors ${
                state.solved ? "border-lime bg-lime/10 text-lime" : d ? "border-cyan bg-cyan/[0.07] text-ink" : i === state.code.length ? "border-cyan/60 bg-bg-2" : "border-line bg-bg-2"
              }`}
            >
              {d || <span className="h-0.5 w-5 bg-line" />}
            </span>
          ))}
        </div>

        <div className="mt-5 grid touch-none select-none grid-cols-3 gap-2" role="group" aria-label="Keypad">
          {KEYS.map((k) => <Key key={k} label={k} onPress={() => dispatch({ type: "PRESS_DIGIT", digit: k })} disabled={state.solved} />)}
          <Key label="Delete" onPress={() => dispatch({ type: "DELETE_DIGIT" })} disabled={state.solved} icon={<BackspaceIcon />} />
          <Key label="0" onPress={() => dispatch({ type: "PRESS_DIGIT", digit: "0" })} disabled={state.solved} />
          <Key label="Enter" onPress={() => dispatch({ type: "SUBMIT_CODE" })} disabled={state.solved} primary />
        </div>
        <p className="mt-3 text-center font-mono text-[0.68rem] text-ink-2">Keyboard works too: digits, Backspace, Enter</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- stage 4 */

export function LoginStage({ state, dispatch }: StageProps) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
      <div className="mx-auto hidden w-56 md:block">
        <Vault progress={3} status="open">
          <div className="flex flex-col items-center gap-2 text-amber">
            <LockIcon width={40} height={40} />
            <span className="font-mono text-[0.6rem] tracking-[0.2em]">SIGNED OUT</span>
          </div>
        </Vault>
      </div>
      <LoginForm
        username={accountUsername(candidate.name)}
        login={state.login}
        hints={[]}
        moreHints={false}
        showFeedback={false}
        onSubmit={(input) => dispatch({ type: "SUBMIT_PASSWORD", input, at: Date.now() })}
        onHint={() => dispatch({ type: "SHOW_HINT" })}
      />
    </div>
  );
}

function Key({ label, onPress, disabled, icon, primary }: { label: string; onPress: () => void; disabled?: boolean; icon?: ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
      data-testid={`key-${label.toLowerCase()}`}
      className={`h-14 rounded-xl border font-mono text-xl font-semibold transition-all duration-100 active:scale-95 disabled:opacity-40 sm:h-16 ${
        primary
          ? "border-cyan bg-cyan text-sm tracking-wider text-bg hover:bg-cyan/85"
          : "border-line bg-raised/70 text-ink hover:border-cyan/50 hover:bg-raised active:bg-cyan/20"
      } ${icon ? "grid place-items-center text-ink-2" : ""}`}
    >
      {icon ?? (primary ? "ENTER" : label)}
    </button>
  );
}
