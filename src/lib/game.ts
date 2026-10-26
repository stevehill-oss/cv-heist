// Pure game logic for The CV Heist. No React, no DOM: every rule here is
// unit tested in tests/unit/game.test.ts. The vault is a game mechanic only,
// it protects nothing.

import { LOGIN_HINTS, initialLogin, isValidLogin, showLoginHint, submitPassword, type Feedback, type LoginState } from "./account";

export type { Feedback } from "./account";

export interface LogEntry {
  id: string;
  method: "GET";
  path: string;
  role: "GUEST";
  status: 200 | 403;
}

export const LOGS: readonly LogEntry[] = [
  { id: "01", method: "GET", path: "/public/intro", role: "GUEST", status: 200 },
  { id: "02", method: "GET", path: "/vault/cv", role: "GUEST", status: 403 },
  { id: "03", method: "GET", path: "/public/skills", role: "GUEST", status: 200 },
  { id: "04", method: "GET", path: "/vault/cv", role: "GUEST", status: 200 },
];

export const PROTECTED_PREFIX = "/vault/";
export const CIPHER_TEXT = "TFWFO";
export const CIPHER_ANSWER = "SEVEN";
export const CODE_LENGTH = 3;

const NUMBER_WORDS: Record<string, string> = {
  ZERO: "0", ONE: "1", TWO: "2", THREE: "3", FOUR: "4",
  FIVE: "5", SIX: "6", SEVEN: "7", EIGHT: "8", NINE: "9",
};

/** A guest reaching a protected path with a success status is the breach. */
export function isBreach(log: LogEntry): boolean {
  return log.role === "GUEST" && log.path.startsWith(PROTECTED_PREFIX) && log.status === 200;
}

export function countSuccessfulGuestVaultRequests(logs: readonly LogEntry[]): number {
  return logs.filter(isBreach).length;
}

/** Shift one A-Z letter by n places, wrapping round the alphabet. */
export function shiftLetter(ch: string, n: number): string {
  const code = ch.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) return ch;
  const offset = (((code - 65 + n) % 26) + 26) % 26;
  return String.fromCharCode(65 + offset);
}

export function shiftWord(word: string, n: number): string {
  return [...word].map((c) => shiftLetter(c, n)).join("");
}

/** The first fragment is the number of the log that should never have succeeded. */
export function logFragment(log: LogEntry): string {
  return String(Number(log.id));
}

export function wordToDigit(word: string): string | null {
  return NUMBER_WORDS[word.toUpperCase()] ?? null;
}

// Everything below is derived from the puzzle data, not hard-coded.
export const BREACH_LOG = LOGS.find(isBreach)!;
export const VAULT_CODE =
  logFragment(BREACH_LOG) + wordToDigit(CIPHER_ANSWER)! + String(countSuccessfulGuestVaultRequests(LOGS));

export type Stage = "intro" | "logs" | "cipher" | "vault" | "login" | "open";
export type PuzzleStage = "logs" | "cipher" | "vault";
export const PUZZLE_STAGES: readonly PuzzleStage[] = ["logs", "cipher", "vault"];
/** Every stage the progress bar shows, the account login last. */
export const ALL_STAGES = ["logs", "cipher", "vault", "login"] as const;
export type PlayStage = (typeof ALL_STAGES)[number];

export interface GameState {
  stage: Stage;
  /** True once the current puzzle is solved and the player can continue. */
  solved: boolean;
  fragments: { logs: string | null; cipher: string | null; vault: string | null };
  selectedLog: string | null;
  cipherShift: number;
  code: string;
  attempts: Record<PuzzleStage, number>;
  hintsShown: Record<PuzzleStage, number>;
  feedback: Feedback | null;
  login: LoginState;
  /** Epoch ms, for the time on the reveal screen. */
  startedAt: number | null;
  finishedAt: number | null;
}

export const HINTS: Record<PuzzleStage, readonly string[]> = {
  logs: [
    "Two requests asked for the same protected file. Compare their results.",
    "403 means access refused. 200 means the request succeeded.",
  ],
  cipher: [
    "Each letter has been moved forward by the same amount.",
    "Move every letter back by one place: T becomes S.",
  ],
  vault: [
    "Enter the fragments in the order you found them, then add the missing digit.",
    "Count the guest requests for /vault/cv that returned 200.",
  ],
};

export const initialState: GameState = {
  stage: "intro",
  solved: false,
  fragments: { logs: null, cipher: null, vault: null },
  selectedLog: null,
  cipherShift: 0,
  code: "",
  attempts: { logs: 0, cipher: 0, vault: 0 },
  hintsShown: { logs: 0, cipher: 0, vault: 0 },
  feedback: null,
  login: initialLogin,
  startedAt: null,
  finishedAt: null,
};

export type GameAction =
  | { type: "START"; at?: number }
  | { type: "SELECT_LOG"; id: string }
  | { type: "SUBMIT_LOG" }
  | { type: "SHIFT_CIPHER"; delta: number }
  | { type: "SUBMIT_CIPHER" }
  | { type: "PRESS_DIGIT"; digit: string }
  | { type: "DELETE_DIGIT" }
  | { type: "SUBMIT_CODE" }
  | { type: "SUBMIT_PASSWORD"; input: string; at: number }
  | { type: "SHOW_HINT" }
  | { type: "CONTINUE"; at?: number }
  | { type: "RESET" }
  | { type: "RESTORE"; state: GameState };

function isPuzzle(stage: Stage): stage is PuzzleStage {
  return stage === "logs" || stage === "cipher" || stage === "vault";
}

function bump(attempts: GameState["attempts"], stage: PuzzleStage) {
  return { ...attempts, [stage]: attempts[stage] + 1 };
}

/** Keep the dial between -12 and +13 so it reads as "back 1", not "forward 25". */
export function normaliseShift(n: number): number {
  const m = ((n % 26) + 26) % 26;
  return m > 13 ? m - 26 : m;
}

export function decodedCipher(state: GameState): string {
  return shiftWord(CIPHER_TEXT, state.cipherShift);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
      return { ...initialState, stage: "logs", startedAt: action.at ?? null };

    case "RESET":
      return initialState;

    case "RESTORE":
      return isValidState(action.state) ? action.state : state;

    case "SELECT_LOG":
      if (state.stage !== "logs" || state.solved) return state;
      if (!LOGS.some((l) => l.id === action.id)) return state;
      return { ...state, selectedLog: action.id, feedback: null };

    case "SUBMIT_LOG": {
      if (state.stage !== "logs" || state.solved || !state.selectedLog) return state;
      const log = LOGS.find((l) => l.id === state.selectedLog)!;
      if (isBreach(log)) {
        const fragment = logFragment(log);
        return {
          ...state,
          solved: true,
          fragments: { ...state.fragments, logs: fragment },
          feedback: {
            kind: "success",
            message: `Breach found. A guest got a 200 on a protected file. Fragment recovered: ${fragment}.`,
          },
        };
      }
      return {
        ...state,
        attempts: bump(state.attempts, "logs"),
        feedback: { kind: "error", message: wrongLogMessage(log) },
      };
    }

    case "SHIFT_CIPHER":
      if (state.stage !== "cipher" || state.solved) return state;
      return { ...state, cipherShift: normaliseShift(state.cipherShift + action.delta), feedback: null };

    case "SUBMIT_CIPHER": {
      if (state.stage !== "cipher" || state.solved) return state;
      const word = decodedCipher(state);
      if (word === CIPHER_ANSWER) {
        const fragment = wordToDigit(word)!;
        return {
          ...state,
          solved: true,
          fragments: { ...state.fragments, cipher: fragment },
          feedback: { kind: "success", message: `Decoded: ${word}. Fragment recovered: ${fragment}.` },
        };
      }
      return {
        ...state,
        attempts: bump(state.attempts, "cipher"),
        feedback: {
          kind: "error",
          message:
            state.cipherShift === 0
              ? `${word} is still scrambled. Turn the dial first.`
              : `${word} is not a word. The sender is one letter ahead, so go back.`,
        },
      };
    }

    case "PRESS_DIGIT":
      if (state.stage !== "vault" || state.solved) return state;
      if (!/^[0-9]$/.test(action.digit) || state.code.length >= CODE_LENGTH) return state;
      return { ...state, code: state.code + action.digit, feedback: null };

    case "DELETE_DIGIT":
      if (state.stage !== "vault" || state.solved) return state;
      return { ...state, code: state.code.slice(0, -1), feedback: null };

    case "SUBMIT_CODE": {
      if (state.stage !== "vault" || state.solved) return state;
      if (state.code.length < CODE_LENGTH) {
        return { ...state, feedback: { kind: "info", message: `The code has ${CODE_LENGTH} digits.` } };
      }
      if (state.code === VAULT_CODE) {
        return {
          ...state,
          solved: true,
          fragments: { ...state.fragments, vault: VAULT_CODE.slice(-1) },
          feedback: { kind: "success", message: "Code accepted. Vault unlocking." },
        };
      }
      return {
        ...state,
        code: "",
        attempts: bump(state.attempts, "vault"),
        feedback: { kind: "error", message: wrongCodeMessage(state.code) },
      };
    }

    case "SUBMIT_PASSWORD": {
      if (state.stage !== "login" || state.solved) return state;
      const login = submitPassword(state.login, action.input, action.at);
      return { ...state, login, solved: login.success, feedback: login.feedback };
    }

    case "SHOW_HINT": {
      if (state.stage === "login") return { ...state, login: showLoginHint(state.login) };
      if (!isPuzzle(state.stage)) return state;
      const shown = state.hintsShown[state.stage];
      if (shown >= HINTS[state.stage].length) return state;
      return { ...state, hintsShown: { ...state.hintsShown, [state.stage]: shown + 1 } };
    }

    case "CONTINUE": {
      if (!state.solved) return state;
      if (state.stage === "login") return { ...state, stage: "open", solved: false, feedback: null, finishedAt: action.at ?? null };
      const next: Record<PuzzleStage, Stage> = { logs: "cipher", cipher: "vault", vault: "login" };
      if (!isPuzzle(state.stage)) return state;
      return { ...state, stage: next[state.stage], solved: false, feedback: null };
    }
  }
}

function wrongLogMessage(log: LogEntry): string {
  if (log.status === 403) return `Log ${log.id} was refused with a 403. The system did its job there.`;
  return `Log ${log.id} is a guest reading a public page. That is allowed.`;
}

function wrongCodeMessage(code: string): string {
  const prefix = VAULT_CODE.slice(0, 2);
  if (code.startsWith(prefix)) return "The first two fragments fit. Recount the last digit.";
  if (code[0] === VAULT_CODE[0]) return "First digit is right. Check your second fragment.";
  return "Access denied. Start with the fragments you recovered, in order.";
}

export function isValidState(s: unknown): s is GameState {
  if (!s || typeof s !== "object") return false;
  const g = s as GameState;
  return (
    ["intro", "logs", "cipher", "vault", "login", "open"].includes(g.stage) &&
    typeof g.solved === "boolean" &&
    typeof g.cipherShift === "number" &&
    typeof g.code === "string" &&
    !!g.fragments && !!g.attempts && !!g.hintsShown &&
    isValidLogin(g.login)
  );
}

/** Vault fragments recovered, 0 to 3. */
export function progress(state: GameState): number {
  return [state.fragments.logs, state.fragments.cipher, state.fragments.vault].filter(Boolean).length;
}

/** Stages finished out of the four, the login included. */
export function stagesDone(state: GameState): number {
  return progress(state) + (state.login.success ? 1 : 0);
}

/** Hints for whichever stage is on screen. */
export function hintsFor(state: GameState): { shown: readonly string[]; more: boolean } {
  if (state.stage === "login") {
    return { shown: LOGIN_HINTS.slice(0, state.login.hintsShown), more: state.login.hintsShown < LOGIN_HINTS.length };
  }
  if (!isPuzzle(state.stage)) return { shown: [], more: false };
  const n = state.hintsShown[state.stage];
  return { shown: HINTS[state.stage].slice(0, n), more: n < HINTS[state.stage].length };
}

export function totals(state: GameState): { hints: number; misses: number; seconds: number | null } {
  const hints = state.hintsShown.logs + state.hintsShown.cipher + state.hintsShown.vault + state.login.hintsShown;
  const misses = state.attempts.logs + state.attempts.cipher + state.attempts.vault + state.login.attempts;
  const seconds = state.startedAt && state.finishedAt ? Math.max(0, Math.round((state.finishedAt - state.startedAt) / 1000)) : null;
  return { hints, misses, seconds };
}
