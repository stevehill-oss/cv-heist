// The "account" login: the heist's final stage and the /account page share it.
// Like the vault, it is a game mechanic and protects nothing. This is a static
// site, so the answer ships to every browser. If you found it in DevTools: nice.

export interface Feedback {
  kind: "success" | "error" | "info";
  message: string;
}

/** The word: what the box asks for, and one of the most leaked passwords there is. */
export const PASSWORD_WORD = "password";
/** The number: the port every padlocked (https) website listens on. */
export const PASSWORD_NUMBER = "443";
export const ACCOUNT_PASSWORD = PASSWORD_WORD + PASSWORD_NUMBER;

/** Wrong guesses allowed before the playful "rate limit" kicks in. */
export const LOCKOUT_AFTER = 4;
export const LOCKOUT_MS = 10_000;

export const LOGIN_HINTS: readonly string[] = [
  "Riddle: I'm what this box is asking you for, and I'm still one of the most used. Then add the door every padlocked website opens.",
  "The word is literally what you're being asked for. It turns up near the top of every leaked-password list.",
  "Websites with the padlock (https) listen on port 443. Put it straight after the word.",
];

export interface LoginState {
  attempts: number;
  hintsShown: number;
  /** Epoch ms. While in the future, guesses are refused. */
  lockedUntil: number;
  success: boolean;
  feedback: Feedback | null;
}

export const initialLogin: LoginState = { attempts: 0, hintsShown: 0, lockedUntil: 0, success: false, feedback: null };

/** Lower case, no spaces: phone keyboards love a capital P. */
export function normalisePassword(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "");
}

/** Targeted replies, so a near miss feels like progress. */
export function wrongPasswordMessage(input: string): string {
  const p = normalisePassword(input);
  const num = p.match(/(\d+)$/)?.[1] ?? "";
  const word = p.slice(0, p.length - num.length);
  if (word === PASSWORD_WORD && !num) return "Right word. The password policy wants a number on the end.";
  if (word === PASSWORD_WORD && /^(1|12|123|1234|12345|123456)$/.test(num))
    return `Right word. But "${num}"? I work in security. My number is smarter than that.`;
  if (word === PASSWORD_WORD) return "Right word, wrong number. Think about how secure websites connect.";
  if (num === PASSWORD_NUMBER) return "Right number, wrong word. Read the box again.";
  if (/^\d+$/.test(p)) return "A classic, but mine starts with a word.";
  if (["admin", "letmein", "qwerty", "root", "welcome"].includes(word))
    return `"${word}" is a good guess for most people. Not for me.`;
  return "Access denied.";
}

export function submitPassword(s: LoginState, input: string, at: number): LoginState {
  if (s.success) return s;
  if (at < s.lockedUntil) {
    const secs = Math.ceil((s.lockedUntil - at) / 1000);
    return { ...s, feedback: { kind: "info", message: `Rate limited. Try again in ${secs}s.` } };
  }
  if (!normalisePassword(input)) return { ...s, feedback: { kind: "info", message: "Type a password first." } };
  if (normalisePassword(input) === ACCOUNT_PASSWORD) {
    return { ...s, success: true, feedback: { kind: "success", message: "Signed in. Welcome back." } };
  }
  const attempts = s.attempts + 1;
  const locked = attempts % LOCKOUT_AFTER === 0;
  return {
    ...s,
    attempts,
    lockedUntil: locked ? at + LOCKOUT_MS : s.lockedUntil,
    feedback: {
      kind: "error",
      message: locked
        ? `${wrongPasswordMessage(input)} Brute force detected: locked for ${LOCKOUT_MS / 1000}s.`
        : wrongPasswordMessage(input),
    },
  };
}

export function showLoginHint(s: LoginState): LoginState {
  if (s.success || s.hintsShown >= LOGIN_HINTS.length) return s;
  return { ...s, hintsShown: s.hintsShown + 1 };
}

export function isValidLogin(s: unknown): s is LoginState {
  if (!s || typeof s !== "object") return false;
  const l = s as LoginState;
  return typeof l.attempts === "number" && typeof l.hintsShown === "number" && typeof l.lockedUntil === "number" && typeof l.success === "boolean";
}

/** "Daniel Ogunseye" becomes "daniel.ogunseye". */
export function accountUsername(name: string | null): string {
  if (!name) return "candidate";
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z\s]/g, "").trim().split(/\s+/).join(".") || "candidate";
}

export type Rank = { title: string; line: string };

/** A rank for the reveal screen, so there is something to beat on a replay. */
export function heistRank(hints: number, misses: number, seconds: number | null): Rank {
  if (hints === 0 && misses === 0 && seconds !== null && seconds <= 120)
    return { title: "Ghost", line: "No hints, no wrong guesses, under two minutes. Nobody saw you." };
  if (hints === 0 && misses === 0) return { title: "Operator", line: "No hints, no wrong guesses. Clean work." };
  if (hints <= 2 && misses <= 3) return { title: "Specialist", line: "A couple of slips, but you got the file." };
  return { title: "Recruit", line: "You got in. Every expert started here." };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, "0")}`;
}

export const ACCOUNT_SESSION_KEY = "cv-heist:account";
