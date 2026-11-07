import { test, expect, type Page } from "@playwright/test";

const section = (page: Page) => page.locator(".beach");
const units = (page: Page) => page.locator("#gites");

const translateY = (page: Page) =>
  page.locator(".beach-media").evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);

const scrollSection = async (page: Page, viewportRatio: number) => {
  const top = await section(page).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const height = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top - height * viewportRatio);
  await page.waitForTimeout(700);
};

const waitForIntro = (page: Page) =>
  expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });

test("removes the shutter and the WebGL story", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.locator(".shutter, .shutter-slats, .slats, .story")).toHaveCount(0);
  await expect(page.getByText("On pousse le portail.")).toHaveCount(0);
  await expect(page.getByText("On suit le chemin.")).toHaveCount(0);
});

test.describe("layout at 1440px", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
  });

  test("sits between the manifesto and the gîtes", async ({ page }) => {
    const order = await page.evaluate(() => {
      const stage = document.querySelector(".beach")?.parentElement;
      return [stage?.previousElementSibling?.classList.contains("manifesto"), stage?.nextElementSibling?.id];
    });
    expect(order).toEqual([true, "gites"]);
  });

  test("fills the screen with the single beach photo", async ({ page }) => {
    expect(await section(page).boundingBox()).toMatchObject({ x: 0, width: 1440, height: 900 });
    const images = section(page).locator("img");
    await expect(images).toHaveCount(1);
    await expect(images).toHaveAttribute("src", /plage-sainte-anne/);
    await expect(images).toHaveAttribute("alt", "Plage de Sainte-Anne, Guadeloupe");
  });

  test("shows the photo without any caption", async ({ page }) => {
    await expect(section(page).locator("p")).toHaveCount(0);
    await expect(page.getByText("La plage du bourg de Sainte-Anne.")).toHaveCount(0);
  });

});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test.describe(`covered by the next section at ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/fr");
      await waitForIntro(page);
    });

    test("holds the photo in place while the gîtes rise over it", async ({ page }) => {
      await scrollSection(page, -0.5);
      expect(Math.round((await section(page).boundingBox())!.y)).toBe(0);
      expect(Math.round((await units(page).boundingBox())!.y)).toBe(height / 2);
      await scrollSection(page, -1);
      expect(Math.round((await units(page).boundingBox())!.y)).toBeLessThanOrEqual(0);
    });

    test("moves the photo slower than the section covering it", async ({ page }) => {
      await scrollSection(page, 0);
      expect(await translateY(page)).toBe(0);
      await scrollSection(page, -0.5);
      const midway = await translateY(page);
      await scrollSection(page, -1);
      const end = await translateY(page);
      expect(midway).toBeLessThan(0);
      expect(end).toBeLessThan(midway);
      expect(Math.abs(end)).toBeLessThan(height * 0.2);
    });

    test("never uncovers the bottom of the frame", async ({ page }) => {
      await scrollSection(page, -1);
      const photo = (await page.locator(".beach-media").boundingBox())!;
      expect(photo.y + photo.height).toBeGreaterThanOrEqual(height);
    });

    test("stays behind the gîtes only, and never shows under the next sections", async ({ page }) => {
      await page.locator(".host").evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" }));
      await page.waitForTimeout(300);
      const beach = (await section(page).boundingBox())!;
      expect(beach.y + beach.height).toBeLessThanOrEqual(0);
    });
  });
}

test("gives the covering section an opaque background", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(units(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("keeps the photo still under reduced motion, while still being covered", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await scrollSection(page, -0.5);
  expect(await translateY(page)).toBe(0);
  expect(Math.round((await units(page).boundingBox())!.y)).toBe(450);
});

test("is translated", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(section(page).locator("img")).toHaveAttribute("alt", "Sainte-Anne beach, Guadeloupe");
});

test("stays complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  await expect(section(page).locator("img")).toHaveCount(1);
  await context.close();
});

for (const width of [320, 390, 768, 1024]) {
  test(`stays inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    expect((await section(page).boundingBox())!.width).toBe(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
