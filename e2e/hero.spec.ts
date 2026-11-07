import { test, expect } from "@playwright/test";

const TITLE = "Gîtes touristiques en bord de mer, sur la plage du bourg de Sainte-Anne, Guadeloupe";

test("plays the title intro once per session and ends within 3 seconds", async ({ page }) => {
  await page.goto("/fr");
  const root = page.locator("html");
  await expect(page.getByRole("heading", { level: 1, name: TITLE })).toBeAttached();
  await expect(root).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  await expect(page.locator(".hero-title")).toHaveText(TITLE);

  await page.reload();
  await expect(root).not.toHaveAttribute("data-hero-intro", /.+/);
  await expect(page.locator(".hero-title")).toBeVisible();
});

test("shows the final hero at once under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/);
  await expect(page.locator(".hero-title")).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
});

test("keeps the hero readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  await expect(page.getByRole("heading", { level: 1, name: TITLE })).toBeVisible();
  await context.close();
});

test("turns the header solid once past the hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const body = page.locator("body");
  await expect(body).toHaveAttribute("data-header", "hero");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
  await expect(body).toHaveAttribute("data-header", "solid");
  await expect(page.locator("body > header .header-logo")).toBeVisible();
});

test("rolls a navigation label on keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  const link = page.locator("body > header nav summary");
  await expect(link).toBeVisible();
  await link.focus();
  await expect
    .poll(() => link.locator(".roll-letter").first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42))
    .toBeLessThan(-5);
});

for (const width of [320, 390, 768, 1024]) {
  test(`keeps the header and hero inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/fr");
    await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
    const overflowing = await page.evaluate(() =>
      [...document.querySelectorAll("body > header *, .hero-title, .hero-title *")].filter(
        (element) => element.getBoundingClientRect().right > window.innerWidth + 1,
      ).length,
    );
    expect(overflowing).toBe(0);
  });
}

for (const [route, width] of [["/fr", 1440], ["/fr", 1024], ["/fr", 768], ["/fr", 390], ["/fr/tarifs", 1440], ["/fr/tarifs", 390]] as const) {
  test(`centres the logo at the top of ${route} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    const logo = page.locator("body > header .header-logo");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", /logo-pieds\.svg/);
    const box = await logo.boundingBox();
    expect(Math.abs(box!.x + box!.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(box!.y).toBeLessThan(16);
    expect(box!.height).toBeGreaterThanOrEqual(60);
  });
}

test("links the logo to the home page with an accessible name", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr/tarifs");
  await page.getByRole("banner").getByRole("link", { name: "Les Pieds dans l'eau" }).click();
  await expect(page).toHaveURL(/\/fr$/);
});

test("no longer sets the brand name as text in the header", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.locator("body > header .wordmark")).toHaveCount(0);
});

test("uses the subtitle as the only hero title", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const hero = page.locator(".hero");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText(TITLE);
  await expect(hero.getByText("Les Pieds dans")).toHaveCount(0);
  await expect(hero.getByText(TITLE)).toHaveCount(1);
});

test("translates the hero title", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Seaside holiday rentals right on the town beach of Sainte-Anne, Guadeloupe",
  );
});

test("leaves no button or link on the hero, the header carries them", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.locator(".hero a, .hero .btn")).toHaveCount(0);
});

test("shows only the title on the hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.getByText("Bonjou !")).toHaveCount(0);
  await expect(page.locator(".hero p")).toHaveCount(0);
});
