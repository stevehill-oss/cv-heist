import { describe, expect, it } from "vitest";
import {
  CIPHER_TEXT,
  HINTS,
  LOGS,
  VAULT_CODE,
  countSuccessfulGuestVaultRequests,
  decodedCipher,
  gameReducer,
  hintsFor,
  initialState,
  stagesDone,
  totals,
  isBreach,
  normaliseShift,
  progress,
  shiftLetter,
  shiftWord,
  type GameAction,
  type GameState,
} from "@/lib/game";

const run = (actions: GameAction[], from: GameState = initialState) => actions.reduce(gameReducer, from);
const toCipher: GameAction[] = [{ type: "START" }, { type: "SELECT_LOG", id: "04" }, { type: "SUBMIT_LOG" }, { type: "CONTINUE" }];
const toVault: GameAction[] = [...toCipher, { type: "SHIFT_CIPHER", delta: -1 }, { type: "SUBMIT_CIPHER" }, { type: "CONTINUE" }];
const digits = (code: string): GameAction[] => [...code].map((digit) => ({ type: "PRESS_DIGIT", digit }));

describe("stage 1: log investigation", () => {
  it("only log 04 is a breach", () => {
    expect(LOGS.filter(isBreach).map((l) => l.id)).toEqual(["04"]);
  });

  it("correct log recovers fragment 4", () => {
    const s = run([{ type: "START" }, { type: "SELECT_LOG", id: "04" }, { type: "SUBMIT_LOG" }]);
    expect(s.solved).toBe(true);
    expect(s.fragments.logs).toBe("4");
    expect(s.feedback?.kind).toBe("success");
  });

  it.each(["01", "02", "03"])("log %s is rejected with feedback", (id) => {
    const s = run([{ type: "START" }, { type: "SELECT_LOG", id }, { type: "SUBMIT_LOG" }]);
    expect(s.solved).toBe(false);
    expect(s.fragments.logs).toBeNull();
    expect(s.attempts.logs).toBe(1);
    expect(s.feedback?.kind).toBe("error");
  });

  it("submitting with nothing selected does nothing", () => {
    const s = run([{ type: "START" }, { type: "SUBMIT_LOG" }]);
    expect(s.attempts.logs).toBe(0);
  });

  it("unknown log ids are ignored", () => {
    expect(run([{ type: "START" }, { type: "SELECT_LOG", id: "99" }]).selectedLog).toBeNull();
  });
});

describe("stage 2: Caesar cipher", () => {
  it("shifts letters with wraparound in both directions", () => {
    expect(shiftLetter("A", -1)).toBe("Z");
    expect(shiftLetter("Z", 1)).toBe("A");
    expect(shiftLetter("M", 26)).toBe("M");
    expect(shiftLetter("B", -27)).toBe("A");
  });

  it("decodes TFWFO to SEVEN by moving back one", () => {
    expect(shiftWord(CIPHER_TEXT, -1)).toBe("SEVEN");
  });

  it("dial position stays readable", () => {
    expect(normaliseShift(-1)).toBe(-1);
    expect(normaliseShift(25)).toBe(-1);
    expect(normaliseShift(13)).toBe(13);
    expect(normaliseShift(14)).toBe(-12);
  });

  it("dial moves change the decoded word", () => {
    const s = run([...toCipher, { type: "SHIFT_CIPHER", delta: 1 }]);
    expect(decodedCipher(s)).toBe("UGXGP");
  });

  it("wrong word is rejected, right word recovers 7", () => {
    const wrong = run([...toCipher, { type: "SHIFT_CIPHER", delta: 2 }, { type: "SUBMIT_CIPHER" }]);
    expect(wrong.solved).toBe(false);
    expect(wrong.attempts.cipher).toBe(1);
    const right = run([{ type: "SHIFT_CIPHER", delta: -3 }, { type: "SUBMIT_CIPHER" }], wrong);
    expect(right.solved).toBe(true);
    expect(right.fragments.cipher).toBe("7");
  });

  it("cipher cannot be touched outside its stage", () => {
    expect(run([{ type: "START" }, { type: "SHIFT_CIPHER", delta: -1 }]).cipherShift).toBe(0);
  });
});

describe("stage 3: vault", () => {
  it("final code is derived as 471", () => {
    expect(countSuccessfulGuestVaultRequests(LOGS)).toBe(1);
    expect(VAULT_CODE).toBe("471");
  });

  it("accepts 471", () => {
    const s = run([...toVault, ...digits("471"), { type: "SUBMIT_CODE" }]);
    expect(s.solved).toBe(true);
    expect(progress(s)).toBe(3);
  });

  it("rejects wrong codes, clears entry, counts attempts", () => {
    const s = run([...toVault, ...digits("472"), { type: "SUBMIT_CODE" }]);
    expect(s.solved).toBe(false);
    expect(s.code).toBe("");
    expect(s.attempts.vault).toBe(1);
    expect(s.feedback?.message).toMatch(/last digit/);
  });

  it("will not take more than three digits or non-digits", () => {
    const s = run([...toVault, ...digits("4719"), { type: "PRESS_DIGIT", digit: "x" }]);
    expect(s.code).toBe("471");
  });

  it("short codes get an info message, not an attempt", () => {
    const s = run([...toVault, ...digits("47"), { type: "SUBMIT_CODE" }]);
    expect(s.attempts.vault).toBe(0);
    expect(s.feedback?.kind).toBe("info");
  });

  it("delete removes the last digit", () => {
    expect(run([...toVault, ...digits("47"), { type: "DELETE_DIGIT" }]).code).toBe("4");
  });
});

describe("stage 4: account login", () => {
  const toLogin: GameAction[] = [...toVault, ...digits("471"), { type: "SUBMIT_CODE" }, { type: "CONTINUE" }];

  it("the open vault leads to the login, not straight to the reveal", () => {
    const s = run(toLogin);
    expect(s.stage).toBe("login");
    expect(stagesDone(s)).toBe(3);
  });

  it("wrong password is counted, right one signs in", () => {
    const wrong = run([...toLogin, { type: "SUBMIT_PASSWORD", input: "password123", at: 1 }]);
    expect(wrong.solved).toBe(false);
    expect(wrong.login.attempts).toBe(1);
    expect(wrong.feedback?.message).toMatch(/smarter/);
    const right = run([{ type: "SUBMIT_PASSWORD", input: " Password443 ", at: 2 }], wrong);
    expect(right.solved).toBe(true);
    expect(stagesDone(right)).toBe(4);
  });

  it("login hints use their own list", () => {
    const s = run([...toLogin, { type: "SHOW_HINT" }]);
    expect(hintsFor(s).shown[0]).toMatch(/Riddle/);
  });

  it("password cannot be submitted outside its stage", () => {
    expect(run([{ type: "START" }, { type: "SUBMIT_PASSWORD", input: "password443", at: 1 }]).login.success).toBe(false);
  });

  it("finishing records the time and totals include the login", () => {
    const s = run([
      ...toLogin.map((a) => (a.type === "START" ? { type: "START", at: 1_000 } as GameAction : a)),
      { type: "SUBMIT_PASSWORD", input: "letmein", at: 2_000 },
      { type: "SUBMIT_PASSWORD", input: "password443", at: 3_000 },
      { type: "CONTINUE", at: 61_000 },
    ]);
    expect(s.stage).toBe("open");
    expect(totals(s)).toEqual({ hints: 0, misses: 1, seconds: 60 });
  });
});

describe("flow, hints and reset", () => {
  it("cannot reach the reveal without the password", () => {
    const s = run([...toVault, ...digits("471"), { type: "SUBMIT_CODE" }, { type: "CONTINUE" }, { type: "CONTINUE" }]);
    expect(s.stage).toBe("login");
  });

  it("cannot continue before solving", () => {
    expect(run([{ type: "START" }, { type: "CONTINUE" }]).stage).toBe("logs");
  });

  it("hints reveal one at a time and stop at the last", () => {
    const actions: GameAction[] = [{ type: "START" }, ...HINTS.logs.map(() => ({ type: "SHOW_HINT" }) as GameAction), { type: "SHOW_HINT" }];
    expect(run(actions).hintsShown.logs).toBe(HINTS.logs.length);
  });

  it("reset returns to the intro with nothing collected", () => {
    const s = run([...toVault, { type: "RESET" }]);
    expect(s).toEqual(initialState);
  });

  it("restore rejects junk state", () => {
    const s = run([{ type: "START" }, { type: "RESTORE", state: { stage: "hacked" } as unknown as GameState }]);
    expect(s.stage).toBe("logs");
  });
});
