import { expect, test, type Page } from "@playwright/test";
import { candidate, site } from "../../src/content/candidate";

const noOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
};

test.describe("routes and navigation", () => {
  for (const path of ["/", "/profile/", "/heist/", "/cv/", "/present/", "/account/"]) {
    test(`${path} loads cleanly`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      await noOverflow(page);
      expect(errors).toEqual([]);
    });
  }

  test("security headers are sent", async ({ page }) => {
    const res = await page.goto("/");
    const h = res!.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
  });

  test("unknown route shows the 404 page", async ({ page }) => {
    const res = await page.goto("/nope/");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Nothing to steal here.")).toBeVisible();
  });

  test("landing doors lead to both experiences", async ({ page }) => {
    // Wait for the page to settle: under parallel load the first client-side
    // navigation can take a few seconds.
    await page.goto("/", { waitUntil: "load" });
    await page.getByTestId("door-professional").click();
    await expect(page).toHaveURL(/\/profile\/$/, { timeout: 15_000 });
    await page.goto("/", { waitUntil: "load" });
    await page.getByTestId("door-hacker").click();
    await expect(page).toHaveURL(/\/heist\/$/, { timeout: 15_000 });
  });

  test("CV preview opens from the profile and is labelled as a preview", async ({ page }) => {
    await page.goto("/profile/");
    await page.getByTestId("cv-link").first().click();
    await expect(page).toHaveURL(/\/cv\/$/);
    await expect(page.getByTestId("preview-banner")).toContainText("Full CV to be added");
  });
});

test.describe("placeholder honesty", () => {
  test("LinkedIn is the configured link, or a labelled placeholder, never a dead link", async ({ page }) => {
    for (const path of ["/", "/profile/", "/heist/", "/cv/"]) {
      await page.goto(path);
      if (candidate.linkedinUrl) {
        const link = page.getByTestId("linkedin-link").first();
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("href", candidate.linkedinUrl);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(page.getByTestId("linkedin-placeholder")).toHaveCount(0);
      } else {
        await expect(page.getByTestId("linkedin-placeholder").first()).toBeVisible();
        await expect(page.getByTestId("linkedin-link")).toHaveCount(0);
      }
    }
  });

  test("download and contact controls explain why they are off", async ({ page }) => {
    await page.goto("/profile/");
    await expect(page.getByTestId("cv-download-unavailable")).toBeVisible();
    await expect(page.getByTestId(candidate.name ? "save-contact" : "contact-unavailable")).toBeVisible();
    const pending = [candidate.skills, candidate.experience, candidate.projects].filter((l) => l.length === 0).length;
    await expect(page.getByTestId("pending-section")).toHaveCount(pending);
  });

  test("profile shows the supplied About text, skills and certifications", async ({ page }) => {
    test.skip(!candidate.summary, "no summary set");
    await page.goto("/profile/");
    await expect(page.getByTestId("summary").locator("p")).toHaveCount(2);
    await expect(page.getByTestId("summary")).toContainText("third-party risk assessments");
    await expect(page.getByText("Microsoft Sentinel", { exact: true })).toBeVisible();
    await expect(page.getByText("CompTIA Security+", { exact: true })).toBeVisible();
    await noOverflow(page);
  });

  test("QR screen points at the configured routes, or is marked preview without one", async ({ page, baseURL }) => {
    await page.goto("/present/");
    const root = site.siteUrl ?? baseURL;
    if (site.siteUrl) await expect(page.getByTestId("qr-preview-note")).toHaveCount(0);
    else await expect(page.getByTestId("qr-preview-note")).toBeVisible();
    await expect(page.getByTestId("qr-url")).toHaveText(`${root}/profile/`);
    await expect(page.locator("[data-qr-value]")).toHaveAttribute("data-qr-value", `${root}/profile/`);
    await page.getByRole("tab", { name: /Hacker/ }).click();
    await expect(page.getByTestId("qr-url")).toHaveText(`${root}/heist/`);
    await expect(page.locator("[data-qr-value] svg")).toBeVisible();
  });
});

test.describe("the locked account", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/account/");
  });

  test("riddle hints, near-miss reply, sign in, stay signed in, sign out", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Account locked/ })).toBeVisible();
    if (candidate.name) await expect(page.locator("input[readonly]")).toHaveValue("daniel.o");
    await page.getByTestId("forgot-password").click();
    await expect(page.getByRole("list", { name: "Password hints" })).toContainText("Riddle");
    await page.getByTestId("password-input").fill("password");
    await page.getByTestId("sign-in").click();
    await expect(page.getByTestId("login-feedback")).toContainText("number on the end");
    await page.getByTestId("password-input").fill("password443");
    await page.getByTestId("password-input").press("Enter");
    await expect(page.getByTestId("account-title")).toBeFocused();
    await expect(page.getByText("Admin (stolen)")).toBeVisible();
    await noOverflow(page);
    await page.reload();
    await expect(page.getByTestId("account-title")).toBeVisible();
    await page.getByTestId("sign-out").click();
    await expect(page.getByTestId("password-input")).toBeVisible();
  });

  test("brute force trips a short lockout", async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.getByTestId("password-input").fill(`guess${i}`);
      await page.getByTestId("sign-in").click();
    }
    await expect(page.getByTestId("login-feedback")).toContainText("Brute force detected");
    await expect(page.getByTestId("sign-in")).toBeDisabled();
    await expect(page.getByTestId("sign-in")).toHaveText(/Locked for \d+s/);
  });

  test("reachable from the landing page and the header", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.getByTestId("landing-account").click();
    await expect(page).toHaveURL(/\/account\/$/, { timeout: 15_000 });
    await page.goto("/profile/", { waitUntil: "load" });
    await page.getByTestId("nav-account").click();
    await expect(page).toHaveURL(/\/account\/$/, { timeout: 15_000 });
  });
});

async function playToVault(page: Page) {
  await page.getByTestId("start-heist").click();
  await page.getByTestId("log-04").click();
  await page.getByTestId("submit-log").click();
  await page.getByTestId("continue").click();
  await page.getByTestId("cipher-back").click();
  await page.getByTestId("submit-cipher").click();
  await page.getByTestId("continue").click();
}

async function vaultToReveal(page: Page) {
  for (const k of ["4", "7", "1"]) await page.getByTestId(`key-${k}`).click();
  await page.getByTestId("key-enter").click();
  await page.getByTestId("continue").click();
  await page.getByTestId("password-input").fill("password443");
  await page.getByTestId("sign-in").click();
  await page.getByTestId("continue").click();
}

test.describe("the game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/heist/");
  });

  test("full game with taps, including wrong answers and hints", async ({ page }) => {
    await page.getByTestId("start-heist").click();
    await expect(page.getByRole("heading", { name: "Find the weakness" })).toBeFocused();

    await page.getByRole("button", { name: "Need a hint?" }).click();
    await expect(page.getByRole("list", { name: "Hints" })).toContainText("Compare their results");

    await page.getByTestId("log-02").click();
    await page.getByTestId("submit-log").click();
    await expect(page.getByTestId("feedback")).toContainText("403");

    await page.getByTestId("log-04").click();
    await page.getByTestId("submit-log").click();
    await expect(page.getByTestId("fragment-0")).toContainText("4");
    await page.getByTestId("continue").click();

    await expect(page.getByRole("heading", { name: "Crack the cipher" })).toBeVisible();
    await page.getByTestId("cipher-forward").click();
    await expect(page.getByTestId("cipher-word")).toContainText("UGXGP");
    await page.getByTestId("submit-cipher").click();
    await expect(page.getByTestId("feedback")).toContainText("not a word");
    await page.getByTestId("cipher-back").click();
    await page.getByTestId("cipher-back").click();
    await expect(page.getByTestId("cipher-word")).toContainText("SEVEN");
    await page.getByTestId("submit-cipher").click();
    await expect(page.getByTestId("fragment-1")).toContainText("7");
    await page.getByTestId("continue").click();

    await expect(page.getByRole("heading", { name: "Unlock the vault" })).toBeVisible();
    for (const k of ["4", "7", "2"]) await page.getByTestId(`key-${k}`).click();
    await page.getByTestId("key-enter").click();
    await expect(page.getByTestId("feedback")).toContainText("Recount the last digit");

    for (const k of ["4", "7", "1"]) await page.getByTestId(`key-${k}`).click();
    await page.getByTestId("key-enter").click();
    await page.getByTestId("continue").click();

    await expect(page.getByRole("heading", { name: "Break into the account" })).toBeFocused();
    await expect(page.getByText("Stage 04 of 04")).toBeVisible();
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("sign-in").click();
    await expect(page.getByTestId("feedback")).toContainText("smarter");
    await page.getByRole("button", { name: "Need a hint?" }).click();
    await expect(page.getByRole("list", { name: "Hints" })).toContainText("Riddle");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(page.getByTestId("password-input")).toHaveAttribute("type", "text");
    await page.getByTestId("password-input").fill("Password443");
    await page.getByTestId("sign-in").click();
    await expect(page.getByTestId("feedback")).toContainText("Signed in");
    await page.getByTestId("continue").click();

    await expect(page.getByTestId("reveal-title")).toHaveText("YOU'VE CRACKED MY PROFILE.");
    // 2 hints and 4 wrong guesses in this run.
    await expect(page.getByTestId("rank")).toContainText("Recruit");
    await expect(page.getByText(/Time \d+:\d{2}/)).toBeVisible();
    await expect(page.getByText("ACCESS GRANTED")).toBeVisible();
    await expect(page.getByText("The full CV is coming. The LinkedIn connection is ready now.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore the profile/ })).toBeVisible();
    await expect(page.getByTestId(candidate.linkedinUrl ? "linkedin-link" : "linkedin-placeholder").last()).toBeVisible();
    await noOverflow(page);
  });

  test("keyboard-only play", async ({ page }) => {
    await page.getByTestId("start-heist").focus();
    await page.keyboard.press("Enter");
    // Radio group: Tab into it, arrow to log 04, Space selects.
    await page.keyboard.press("Tab");
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("fragment-0")).toContainText("4");
    await page.keyboard.press("Enter"); // Continue button has focus
    await page.getByTestId("cipher-back").focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("fragment-1")).toContainText("7");
    await page.keyboard.press("Enter");
    await page.keyboard.type("471");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("feedback")).toContainText("Code accepted");
    await page.keyboard.press("Enter");
    // Heading has focus: Tab past the read-only username into the password.
    await expect(page.getByRole("heading", { name: "Break into the account" })).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("password-input")).toBeFocused();
    await page.keyboard.type("password443");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("feedback")).toContainText("Signed in");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("reveal-title")).toBeVisible();
  });

  test("progress survives a refresh, and Quit resets", async ({ page }) => {
    await playToVault(page);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Unlock the vault" })).toBeVisible();
    await page.getByTestId("abandon").click();
    await expect(page.getByTestId("start-heist")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("start-heist")).toBeVisible();
  });

  test("leaving mid-game and coming back resumes", async ({ page }) => {
    await page.getByTestId("start-heist").click();
    await page.getByTestId("log-04").click();
    await page.getByTestId("submit-log").click();
    await page.getByTestId("continue").click();
    await page.goto("/profile/");
    await page.goBack();
    await expect(page.getByRole("heading", { name: "Crack the cipher" })).toBeVisible();
  });

  test("replay from the reveal starts fresh", async ({ page }) => {
    await playToVault(page);
    await vaultToReveal(page);
    await page.getByTestId("replay").click();
    await expect(page.getByTestId("start-heist")).toBeVisible();
  });

  test("a perfect run ranks Ghost and signs you in on /account", async ({ page }) => {
    await playToVault(page);
    await vaultToReveal(page);
    await expect(page.getByTestId("rank")).toContainText("Ghost");
    await page.goto("/account/");
    await expect(page.getByTestId("account-title")).toBeVisible();
  });

  test("feedback is announced through a live region", async ({ page }) => {
    await page.getByTestId("start-heist").click();
    await page.getByTestId("log-01").click();
    await page.getByTestId("submit-log").click();
    await expect(page.locator('[role="status"][aria-live="polite"]').first()).toContainText("public page");
  });
});
