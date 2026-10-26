import { describe, expect, it } from "vitest";
import {
  ACCOUNT_PASSWORD,
  LOCKOUT_AFTER,
  LOCKOUT_MS,
  LOGIN_HINTS,
  accountUsername,
  formatDuration,
  heistRank,
  initialLogin,
  showLoginHint,
  submitPassword,
  wrongPasswordMessage,
} from "@/lib/account";

describe("account password", () => {
  it("is the most common word plus the HTTPS port", () => {
    expect(ACCOUNT_PASSWORD).toBe("password443");
  });

  it("ignores case and stray spaces from phone keyboards", () => {
    expect(submitPassword(initialLogin, "Password 443", 0).success).toBe(true);
  });

  it("near misses get targeted replies", () => {
    expect(wrongPasswordMessage("password")).toMatch(/number on the end/);
    expect(wrongPasswordMessage("password123")).toMatch(/smarter/);
    expect(wrongPasswordMessage("password80")).toMatch(/wrong number/);
    expect(wrongPasswordMessage("letmein443")).toMatch(/Right number, wrong word/);
    expect(wrongPasswordMessage("123456")).toMatch(/starts with a word/);
    expect(wrongPasswordMessage("admin")).toMatch(/Not for me/);
    expect(wrongPasswordMessage("zzz")).toBe("Access denied.");
  });

  it("an empty guess is not an attempt", () => {
    const s = submitPassword(initialLogin, "  ", 0);
    expect(s.attempts).toBe(0);
    expect(s.feedback?.kind).toBe("info");
  });

  it("locks briefly after repeated misses, then lets you try again", () => {
    let s = initialLogin;
    for (let i = 0; i < LOCKOUT_AFTER; i++) s = submitPassword(s, "nope", 1_000);
    expect(s.lockedUntil).toBe(1_000 + LOCKOUT_MS);
    expect(s.feedback?.message).toMatch(/locked/);
    const during = submitPassword(s, ACCOUNT_PASSWORD, 2_000);
    expect(during.success).toBe(false);
    expect(during.attempts).toBe(LOCKOUT_AFTER);
    expect(during.feedback?.message).toMatch(/Try again in 9s/);
    expect(submitPassword(s, ACCOUNT_PASSWORD, 1_000 + LOCKOUT_MS).success).toBe(true);
  });

  it("hints reveal one at a time and stop at the last", () => {
    let s = initialLogin;
    for (let i = 0; i < LOGIN_HINTS.length + 2; i++) s = showLoginHint(s);
    expect(s.hintsShown).toBe(LOGIN_HINTS.length);
  });
});

describe("account helpers", () => {
  it("builds a username from the name", () => {
    expect(accountUsername("Daniel Ogunseye")).toBe("daniel.ogunseye");
    expect(accountUsername(null)).toBe("candidate");
  });

  it("ranks runs and formats times", () => {
    expect(heistRank(0, 0, 80).title).toBe("Ghost");
    expect(heistRank(0, 0, 200).title).toBe("Operator");
    expect(heistRank(1, 2, 80).title).toBe("Specialist");
    expect(heistRank(4, 6, 80).title).toBe("Recruit");
    expect(formatDuration(75)).toBe("1:15");
  });
});
