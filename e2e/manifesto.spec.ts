import { test, expect, type Page } from "@playwright/test";

const SENTENCE = "Trois gîtes posés sur la plage de Sainte-Anne, à deux pas du marché. Pas besoin de voiture.";

const opacities = (page: Page) =>
  page.locator(".manifesto-word").evaluateAll((words) => words.map((word) => Number(getComputedStyle(word).opacity)));

const settle = async (page: Page, scrollY: number) => {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), scrollY);
  await page.waitForTimeout(400);
};

test("sits right after the hero, centred in a narrow column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const manifesto = page.locator(".manifesto");
  await expect(manifesto.locator("p")).toHaveText(SENTENCE);
  expect(await page.evaluate(
    () => document.querySelector(".hero")?.nextElementSibling?.classList.contains("manifesto"),
  )).toBe(true);
  await expect(manifesto.locator("p")).toHaveCSS("text-align", "center");
  const text = (await manifesto.locator("p").boundingBox())!;
  expect(text.width).toBeLessThanOrEqual(768);
  expect(Math.abs(text.x + text.width / 2 - 720)).toBeLessThan(1);
});

test("uses the full width of a phone, between the page margins", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const text = (await page.locator(".manifesto p").boundingBox())!;
  expect(Math.round(text.width)).toBe(358);
});

test("is translated", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(".manifesto p")).toHaveText(
    "Three gîtes right on the beach in Sainte-Anne, steps from the market. No car needed.",
  );
});

test("reveals the words one after another while the following ones stay hidden", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });

  const words = page.locator(".manifesto-word");
  await expect(words).toHaveCount(SENTENCE.split(" ").length);
  (await opacities(page)).forEach((opacity) => expect(opacity).toBeLessThan(0.2));

  const box = await page.locator(".manifesto").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { top: rect.top + window.scrollY, height: rect.height };
  });
  const midway = box.top - 900 * 0.65 + (box.height + 900 * 0.4) / 2;
  await settle(page, midway);
  const states = (await opacities(page)).map((opacity) => opacity === 1);
  const lastRevealed = states.lastIndexOf(true);
  expect(lastRevealed).toBeGreaterThan(0);
  expect(lastRevealed).toBeLessThan(states.length - 1);
  states.slice(0, lastRevealed).forEach((state) => expect(state).toBe(true));
  expect((await opacities(page)).at(-1)).toBeLessThan(0.2);

  await settle(page, box.top + box.height);
  expect(new Set(await opacities(page))).toEqual(new Set([1]));
  await expect(words.first()).toHaveCSS("color", "rgb(6, 42, 44)");
});

test("reveals the text without any background colour", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  const box = await page.locator(".manifesto").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { top: rect.top + window.scrollY, height: rect.height };
  });
  await settle(page, box.top + box.height);
  const backgrounds = await page.locator(".manifesto-word").evaluateAll((words) => words.map((word) => getComputedStyle(word).backgroundColor));
  expect(new Set(backgrounds)).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
});

test("stays plain and readable under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.locator(".manifesto p")).toHaveCSS("color", "rgb(6, 42, 44)");
  expect(new Set(await opacities(page))).toEqual(new Set([1]));
});

test("stays readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  await expect(page.locator(".manifesto p")).toHaveText(SENTENCE);
  await expect(page.locator(".manifesto-word").first()).toHaveCSS("opacity", "1");
  await context.close();
});

for (const width of [320, 390, 768, 1024]) {
  test(`keeps the sentence inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    const box = await page.locator(".manifesto p").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  });
}

const star = (page: Page) => page.locator(".manifesto-star");
const shell = (page: Page) => page.locator(".manifesto-shell");

const scrollSection = async (page: Page, viewportRatio: number) => {
  const top = await page.locator(".manifesto").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const height = page.viewportSize()!.height;
  await settle(page, top - height * viewportRatio);
};

const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test("uses the two supplied pictures, as decoration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(star(page).locator("img")).toHaveAttribute("src", /etoile-de-mer/);
  await expect(shell(page).locator("img")).toHaveAttribute("src", /coquillage/);
  await expect(star(page).locator("img")).toHaveAttribute("alt", "");
  await expect(shell(page).locator("img")).toHaveAttribute("alt", "");
});

test("brings the pictures into the viewport while scrolling down", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });

  await scrollSection(page, 0.95);
  let [left, right] = await Promise.all([star(page).boundingBox(), shell(page).boundingBox()]);
  expect(left!.x + left!.width).toBeLessThanOrEqual(0);
  expect(right!.x).toBeGreaterThanOrEqual(1440);

  await scrollSection(page, 0.3);
  const arrived = await shell(page).boundingBox();
  expect(Math.round(arrived!.x + arrived!.width)).toBe(1392);
  expect(arrived!.y).toBeGreaterThanOrEqual(80);

  await scrollSection(page, 0.25);
  const midway = await star(page).boundingBox();
  expect(midway!.x).toBeGreaterThan(left!.x);
  expect(midway!.x).toBeLessThan(48);

  await scrollSection(page, 0);
  [left, right] = await Promise.all([star(page).boundingBox(), shell(page).boundingBox()]);
  expect(Math.round(left!.x)).toBe(48);
  expect(Math.round(right!.x + right!.width)).toBe(1392);
});

test("keeps the pictures in place under reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const box = await star(page).boundingBox();
  expect(Math.round(box!.x)).toBe(48);
});

test("shows the pictures without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  const box = await shell(page).boundingBox();
  expect(Math.round(box!.x + box!.width)).toBe(1392);
  await context.close();
});

for (const [width, height] of [[1920, 1080], [1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 640]]) {
  test(`never covers the text and stays on screen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    const text = (await page.locator(".manifesto p").boundingBox())!;
    for (const picture of [star(page), shell(page)]) {
      const box = (await picture.boundingBox())!;
      expect(overlaps(box, text)).toBe(false);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("does not move the pictures at a different speed from the text", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });

  const positions = () => Promise.all([shell(page), page.locator(".manifesto p"), star(page)].map(async (layer) => (await layer.boundingBox())!.y));
  await scrollSection(page, -0.1);
  const before = await positions();
  await scrollSection(page, -0.3);
  const after = await positions();
  const [shellTravel, textTravel, starTravel] = before.map((y, index) => Math.round(y - after[index]));
  expect(textTravel).toBe(180);
  expect(shellTravel).toBe(180);
  expect(starTravel).toBe(180);
});
