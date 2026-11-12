import { test, expect, type Page } from "@playwright/test";

const host = (page: Page) => page.locator(".host");
const photo = (page: Page) => page.locator(".host-photo");

test.describe("layout at 1440px", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
  });

  test("follows the gîtes and fills the screen", async ({ page }) => {
    const isAfterUnits = await page.evaluate(() => document.querySelector("#gites")?.nextElementSibling?.classList.contains("host"));
    expect(isAfterUnits).toBe(true);
    expect((await host(page).boundingBox())!.height).toBeGreaterThanOrEqual(900);
  });

  test("sets the text left and the photo right, on the page margins", async ({ page }) => {
    await expect(host(page).getByRole("heading", { level: 2 })).toHaveText("Chez Marie-Claude");
    const text = await page.locator(".host-text").boundingBox();
    const frame = await photo(page).boundingBox();
    expect(Math.round(text!.x)).toBe(48);
    expect(Math.round(frame!.x + frame!.width)).toBe(1392);
    expect(frame!.x).toBeGreaterThanOrEqual(text!.x + text!.width);
    expect(Math.round(frame!.y)).toBe(Math.round(text!.y));
    expect(Math.round(frame!.height)).toBe(Math.round(text!.height));
  });

  test("lists the six included services", async ({ page }) => {
    const services = host(page).locator("li");
    await expect(services).toHaveCount(6);
    await expect(services.first()).toHaveText("Citerne d'eau (pas de coupure d'eau)");
  });

  test("serves the photo sharp enough for the crop", async ({ page }) => {
    const image = photo(page).locator("img");
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0)).toBe(true);
    const { served, rendered } = await image.evaluate(async (el: HTMLImageElement) => {
      const probe = new Image();
      probe.src = el.currentSrc;
      await probe.decode();
      const box = el.getBoundingClientRect();
      return { served: probe.naturalHeight, rendered: box.height };
    });
    expect(served).toBeGreaterThanOrEqual(rendered);
  });
});

test("translates the photo description", async ({ page }) => {
  await page.goto("/en");
  await expect(photo(page).locator("img")).toHaveAttribute("alt", "Red tropical flower");
});

test("uncovers the photo once it is scrolled to", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  await page.evaluate(() => document.querySelector(".host")?.scrollIntoView({ behavior: "instant" }));
  await expect.poll(() => photo(page).evaluate((el) => getComputedStyle(el).clipPath), { timeout: 3_000 }).toBe("none");
});

test("stays complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  await expect(host(page).locator("li")).toHaveCount(6);
  await expect(photo(page).locator("img")).toHaveCount(1);
  await context.close();
});

for (const width of [320, 390, 768, 1024]) {
  test(`stays inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    for (const locator of [page.locator(".host-text"), photo(page)]) {
      const box = await locator.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(box!.height).toBeGreaterThan(200);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("stacks the text above the photo on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const text = await page.locator(".host-text").boundingBox();
  const frame = await photo(page).boundingBox();
  expect(frame!.y).toBeGreaterThanOrEqual(text!.y + text!.height);
});
