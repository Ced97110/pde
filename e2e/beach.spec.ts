import { test, expect, type Page } from "@playwright/test";

const section = (page: Page) => page.locator(".beach");
const plane = (page: Page) => page.locator(".beach-plane");
const media = (page: Page) => page.locator(".beach-media");

const translateY = (page: Page) =>
  media(page).evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);

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
  await expect(page.locator(".shutter, .shutter-slats, .slats, .story, main canvas")).toHaveCount(0);
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
      const beach = document.querySelector(".beach");
      return [beach?.previousElementSibling?.classList.contains("manifesto"), beach?.nextElementSibling?.id];
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

  test("keeps the photo open and still under reduced motion", async ({ page }) => {
    await scrollSection(page, 0);
    expect(await translateY(page)).toBe(0);
    await expect(plane(page)).toHaveCSS("clip-path", "none");
  });
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`moves the photo with the scroll without uncovering it at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/fr");
    await waitForIntro(page);
    const positions: number[] = [];
    for (const ratio of [0.9, 0.5, 0, -0.5]) {
      await scrollSection(page, ratio);
      positions.push(await translateY(page));
      const [outer, inner] = await Promise.all([section(page).boundingBox(), media(page).boundingBox()]);
      expect(inner!.y).toBeLessThanOrEqual(outer!.y);
      expect(inner!.y + inner!.height).toBeGreaterThanOrEqual(outer!.y + outer!.height);
    }
    expect(positions[1]).toBeGreaterThan(positions[0]);
    expect(positions[2]).toBeGreaterThan(positions[1]);
    expect(positions[3]).toBeGreaterThan(positions[2]);
    expect(positions[3] - positions[0]).toBeGreaterThan(100);
  });
}

test("unveils the photo from the top down while it widens to the full screen", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await waitForIntro(page);
  await scrollSection(page, 0.6);
  const clip = await plane(page).evaluate((el) => getComputedStyle(el).clipPath);
  const [top, right = top, bottom = top, left = right] = (clip.match(/[\d.]+/g) ?? []).map(Number);
  expect(top).toBe(0);
  expect(right).toBeGreaterThan(0);
  expect(left).toBe(right);
  expect(bottom).toBeGreaterThan(0);
  await scrollSection(page, 0);
  await expect(plane(page)).toHaveCSS("clip-path", "none");
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
