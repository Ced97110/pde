import { test, expect, type Page } from "@playwright/test";

const footer = (page: Page) => page.locator("footer");

test.describe("layout at 1440px", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
  });

  test("runs edge to edge on the dark green, taller than half the screen", async ({ page }) => {
    await expect(footer(page)).toHaveCSS("background-color", "rgb(11, 58, 61)");
    const box = await footer(page).boundingBox();
    expect(box).toMatchObject({ x: 0, width: 1440 });
    expect(box!.height).toBeGreaterThanOrEqual(540);
  });

  test("aligns on the page margins of the sections above", async ({ page }) => {
    const logo = await footer(page).locator("img").boundingBox();
    const legal = await footer(page).getByRole("link", { name: "Mentions légales" }).boundingBox();
    expect(Math.round(logo!.x)).toBe(48);
    expect(Math.round(legal!.x + legal!.width)).toBe(1392);
  });

  test("shows the logo at three times its header size, in place of the name", async ({ page }) => {
    const logo = footer(page).locator("img");
    await expect(logo).toHaveAttribute("src", /logo-pieds\.svg/);
    await expect(logo).toHaveAttribute("alt", "Les Pieds dans l'eau");
    await logo.scrollIntoViewIfNeeded();
    await expect.poll(() => logo.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    const header = await page.locator("body > header .header-logo").boundingBox();
    const box = await logo.boundingBox();
    expect(header!.width).toBe(64);
    expect(box!.width).toBe(header!.width * 3);
    expect(box!.height).toBe(header!.height * 3);
    await expect(footer(page).locator(".wordmark")).toHaveCount(0);
  });

  test("starts the links and the contact on the right half, like the gîte photos", async ({ page }) => {
    const nav = await footer(page).locator("nav").boundingBox();
    expect(Math.abs(nav!.x - 726)).toBeLessThanOrEqual(1);
    const address = await footer(page).locator("address").boundingBox();
    expect(address!.x).toBeGreaterThan(nav!.x + nav!.width - 1);
  });

  test("lists the pages and the contact details", async ({ page }) => {
    for (const [name, href] of [
      ["Photos", "/fr/galerie"],
      ["Tarifs", "/fr/tarifs"],
      ["Situation", "/fr/situation"],
      ["Avis", "/fr/avis"],
    ]) {
      await expect(footer(page).getByRole("link", { name })).toHaveAttribute("href", href);
    }
    await expect(footer(page).getByRole("link", { name: "0690 50 34 58" })).toHaveAttribute("href", /^tel:/);
    await expect(footer(page).getByRole("link", { name: /@gmail\.com/ })).toHaveAttribute("href", /^mailto:/);
  });
});

test("keeps the large logo on phones and inner pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr/tarifs");
  const box = await footer(page).locator("img").boundingBox();
  expect(box).toMatchObject({ x: expect.any(Number), width: 192, height: 192 });
  expect(Math.round(box!.x)).toBe(16);
});

test("rolls the footer links on keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr/tarifs");
  const link = footer(page).locator("nav a").first();
  // Focus again on each try: a focus landing before hydration is never heard.
  await expect(async () => {
    await link.blur();
    await link.focus();
    await expect
      .poll(() => link.locator(".roll-letter").first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42), { timeout: 1_500 })
      .toBeLessThan(-5);
  }).toPass();
});

test("is translated", async ({ page }) => {
  await page.goto("/en");
  await expect(footer(page).getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/en/tarifs");
});

test("clears the booking bar on gîte pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr/gites/sapotille");
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(200);
  const legal = await footer(page).getByRole("link", { name: "Mentions légales" }).boundingBox();
  const bar = await page.locator(".mobile-booking-bar").boundingBox();
  expect(legal!.y + legal!.height).toBeLessThanOrEqual(bar!.y);
});

for (const route of ["/fr", "/fr/tarifs", "/en/contact"]) {
  for (const width of [320, 390, 768, 1024]) {
    test(`stays inside the viewport on ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      const overflowing = await footer(page).evaluate((root) =>
        [...root.querySelectorAll("*")]
          .filter((el) => !el.closest("[aria-hidden='true']"))
          .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 0.5)
          .map((el) => el.textContent),
      );
      expect(overflowing).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}

const logo3d = (page: Page) => page.locator(".footer-logo");

test.describe("3D logo", () => {
  test("loads only when the footer gets near, then replaces the flat logo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/fr/tarifs");
    await page.setViewportSize({ width: 1440, height: 300 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await footer(page).scrollIntoViewIfNeeded();
    await expect(logo3d(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
    expect(await logo3d(page).locator("canvas").boundingBox()).toMatchObject({ width: 192, height: 192 });
    await expect(logo3d(page).locator("canvas")).toHaveCSS("opacity", "1");
    await expect(logo3d(page).locator("img")).toHaveCSS("opacity", "0");
    expect(errors).toEqual([]);
  });

  test("does not load at the top of a long page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    await page.waitForTimeout(800);
    await expect(logo3d(page)).not.toHaveAttribute("data-ready", /.+/);
  });

  test("sways gently, and stays still under reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/fr/mentions-legales");
    await footer(page).scrollIntoViewIfNeeded();
    await expect(logo3d(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
    await expect(logo3d(page)).toHaveAttribute("data-animated", "true");
    const first = await logo3d(page).locator("canvas").screenshot();
    await page.waitForTimeout(1_000);
    const second = await logo3d(page).locator("canvas").screenshot();
    expect(first.equals(second)).toBe(false);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await footer(page).scrollIntoViewIfNeeded();
    await expect(logo3d(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
    await expect(logo3d(page)).not.toHaveAttribute("data-animated", /.+/);
  });

  test("leaves page scrolling alone on the logo", async ({ page }) => {
    await page.goto("/fr/mentions-legales");
    await expect(logo3d(page).locator("canvas")).not.toHaveCSS("touch-action", "none");
  });

  test("keeps the flat logo when WebGL is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto("/fr/mentions-legales");
    await footer(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1_500);
    await expect(logo3d(page)).not.toHaveAttribute("data-ready", /.+/);
    await expect(logo3d(page).locator("img")).toHaveCSS("opacity", "1");
  });

  test("keeps the flat logo without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/fr/mentions-legales");
    await expect(footer(page).locator("img")).toBeVisible();
    await context.close();
  });
});

test("keeps the logo alone on the left", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr/tarifs");
  await expect(page.getByText("Annou alé")).toHaveCount(0);
});
