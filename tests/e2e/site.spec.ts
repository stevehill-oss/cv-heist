import { expect, test, type Page } from "@playwright/test";
import { site } from "../../src/content/candidate";

const noOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
};

test.describe("routes and navigation", () => {
  for (const path of ["/", "/profile/", "/heist/", "/cv/", "/present/"]) {
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
    await page.goto("/");
    await page.getByTestId("door-professional").click();
    await expect(page).toHaveURL(/\/profile\/$/);
    await page.goto("/");
    await page.getByTestId("door-hacker").click();
    await expect(page).toHaveURL(/\/heist\/$/);
  });

  test("CV preview opens from the profile and is labelled as a preview", async ({ page }) => {
    await page.goto("/profile/");
    await page.getByTestId("cv-link").first().click();
    await expect(page).toHaveURL(/\/cv\/$/);
    await expect(page.getByTestId("preview-banner")).toContainText("Full CV to be added");
  });
});

test.describe("placeholder honesty (no candidate details configured yet)", () => {
  test("LinkedIn shows a labelled placeholder, never a dead link", async ({ page }) => {
    for (const path of ["/", "/profile/", "/heist/", "/cv/"]) {
      await page.goto(path);
      await expect(page.getByTestId("linkedin-placeholder").first()).toBeVisible();
      await expect(page.getByTestId("linkedin-link")).toHaveCount(0);
    }
  });

  test("download and contact controls explain why they are off", async ({ page }) => {
    await page.goto("/profile/");
    await expect(page.getByTestId("cv-download-unavailable")).toBeVisible();
    await expect(page.getByTestId("contact-unavailable")).toBeVisible();
    await expect(page.getByTestId("pending-section")).toHaveCount(3);
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

async function playToVault(page: Page) {
  await page.getByTestId("start-heist").click();
  await page.getByTestId("log-04").click();
  await page.getByTestId("submit-log").click();
  await page.getByTestId("continue").click();
  await page.getByTestId("cipher-back").click();
  await page.getByTestId("submit-cipher").click();
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

    await expect(page.getByTestId("reveal-title")).toHaveText("YOU'VE CRACKED MY PROFILE.");
    await expect(page.getByText("ACCESS GRANTED")).toBeVisible();
    await expect(page.getByText("The full CV is coming. The LinkedIn connection is ready now.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore the profile/ })).toBeVisible();
    await expect(page.getByTestId("linkedin-placeholder")).toBeVisible();
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
    for (const k of ["4", "7", "1"]) await page.getByTestId(`key-${k}`).click();
    await page.getByTestId("key-enter").click();
    await page.getByTestId("continue").click();
    await page.getByTestId("replay").click();
    await expect(page.getByTestId("start-heist")).toBeVisible();
  });

  test("feedback is announced through a live region", async ({ page }) => {
    await page.getByTestId("start-heist").click();
    await page.getByTestId("log-01").click();
    await page.getByTestId("submit-log").click();
    await expect(page.locator('[role="status"][aria-live="polite"]').first()).toContainText("public page");
  });
});
