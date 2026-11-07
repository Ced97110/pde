import { test, expect, type Page } from "@playwright/test";

const section = (page: Page) => page.locator(".reviews");
const cards = (page: Page) => section(page).locator("figure");

test.describe("layout at 1440px", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
  });

  test("follows the host section with a right-aligned title", async ({ page }) => {
    const isAfterHost = await page.evaluate(() => document.querySelector(".host")?.nextElementSibling?.classList.contains("reviews"));
    expect(isAfterHost).toBe(true);
    const title = section(page).getByRole("heading", { level: 2 });
    await expect(title).toHaveText("Ce qu’en disent nos hôtes");
    await expect(title).toHaveCSS("text-align", "right");
  });

  test("sets two quotes large in the title face, offset from each other", async ({ page }) => {
    await expect(cards(page)).toHaveCount(2);
    const quote = cards(page).first().locator("blockquote");
    await expect(quote).toHaveCSS("font-family", /neoSaphion/);
    await expect(quote).toHaveCSS("font-size", /^23\.1/);
    await expect(quote).toContainText("Les propriétaires sont particulièrement accueillants.");
    const [first, second] = await Promise.all([cards(page).nth(0).boundingBox(), cards(page).nth(1).boundingBox()]);
    expect(Math.round(first!.x)).toBe(48);
    expect(Math.round(second!.x + second!.width)).toBe(1392);
    expect(second!.y).toBeGreaterThan(first!.y + 40);
  });

  test("names the guest under each quote", async ({ page }) => {
    await expect(cards(page).first().locator("figcaption")).toContainText("Monique, décembre 2018");
  });

  test("links to all the reviews", async ({ page }) => {
    await section(page).getByRole("link", { name: "Lire tous les avis" }).click();
    await expect(page).toHaveURL(/\/fr\/avis$/);
  });
});

test("keeps the reviews page in body text", async ({ page }) => {
  await page.goto("/fr/avis");
  const quote = page.locator("blockquote").first();
  await expect(quote).toHaveCSS("font-family", /Inter/);
  await expect(quote).toHaveCSS("font-size", "14px");
});

test("marks the English quotes as translated", async ({ page }) => {
  await page.goto("/en");
  await expect(cards(page).first().locator("figcaption")).toContainText("translated from French");
});

test("stays complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  await expect(cards(page)).toHaveCount(2);
  await context.close();
});

for (const width of [320, 390, 768, 1024]) {
  test(`stays inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    await expect(cards(page)).toHaveCount(2);
    for (const index of [0, 1]) {
      const box = await cards(page).nth(index).boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
