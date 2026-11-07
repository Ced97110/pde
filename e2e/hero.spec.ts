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
    // On a wide home page, the header sits inside the hero's frame.
    const frame = route === "/fr" && width >= 1024 ? width * 0.025 : 0;
    expect(box!.y).toBeLessThan(16 + frame);
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

const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test.describe("framed composition on a wide screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/fr");
  });

  test("sets a white panel inside a pale frame", async ({ page }) => {
    await expect(page.locator(".hero")).toHaveCSS("background-color", "rgb(226, 244, 242)");
    await expect(page.locator(".hero-panel")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    expect(await page.locator(".hero-panel").boundingBox()).toEqual({ x: 36, y: 36, width: 1368, height: 828 });
  });

  test("places the small photo top left and the tall video on the right", async ({ page }) => {
    const photo = (await page.locator(".hero-photo").boundingBox())!;
    expect(photo).toMatchObject({ x: 108, width: 180, height: 252 });
    expect(photo.y).toBeGreaterThanOrEqual(116);
    const video = (await page.locator(".hero-media").boundingBox())!;
    expect(video).toMatchObject({ width: 360, height: 504 });
    expect(video.x + video.width).toBe(1368);
    await expect(page.locator(".hero-photo img")).toHaveAttribute("alt", "");
  });

  test("sets the title bottom left, in dark ink", async ({ page }) => {
    const title = (await page.locator(".hero-title").boundingBox())!;
    expect(Math.round(title.x)).toBe(108);
    expect(title.y).toBeGreaterThan(450);
    await expect(page.locator(".hero-title")).toHaveCSS("color", "rgb(6, 42, 44)");
    await expect(page.locator(".hero-title")).toHaveCSS("text-align", "left");
  });

  test("keeps the header readable, inside the panel", async ({ page }) => {
    const header = (await page.locator("body > header").boundingBox())!;
    expect(header).toMatchObject({ x: 36, y: 36, width: 1368 });
    await expect(page.locator("body > header")).toHaveCSS("color", "rgb(6, 42, 44)");
  });

  test("gets the normal header back past the hero", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
    await expect(page.locator("body")).toHaveAttribute("data-header", "solid");
    await expect(page.locator("body > header")).toHaveCSS("left", "0px");
    await expect(page.locator("body > header")).toHaveCSS("top", "0px");
  });
});

for (const [width, height] of [[1920, 1080], [1440, 900], [1280, 720], [1024, 768]]) {
  test(`never lets the hero's parts touch at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height });
    await page.goto("/fr");
    const [photo, video, title, panel, header] = await Promise.all(
      [".hero-photo", ".hero-media", ".hero-title", ".hero-panel", "body > header"].map(async (selector) => (await page.locator(selector).boundingBox())!),
    );
    expect(overlaps(photo, title)).toBe(false);
    expect(overlaps(video, title)).toBe(false);
    expect(overlaps(photo, video)).toBe(false);
    expect(overlaps(photo, header)).toBe(false);
    expect(overlaps(video, header)).toBe(false);
    for (const part of [photo, video, title]) {
      expect(part.y + part.height).toBeLessThanOrEqual(panel.y + panel.height);
      expect(part.x + part.width).toBeLessThanOrEqual(panel.x + panel.width);
    }
  });
}

test("fills a phone with the video and a centred white title", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fr");
  await expect(page.locator(".hero-panel")).toBeHidden();
  await expect(page.locator(".hero-photo")).toBeHidden();
  await expect(page.locator(".hero-title")).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.locator(".hero-title")).toHaveCSS("text-align", "center");
  expect(await page.locator(".hero-media").boundingBox()).toMatchObject({ x: 0, y: 0, width: 390 });
});

test("opens the panel into its frame during the intro", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await page.waitForTimeout(120);
  const opening = (await page.locator(".hero-panel").boundingBox())!;
  expect(opening.x).toBeLessThan(36);
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  await expect(page.locator(".hero-panel")).toHaveCSS("left", "36px", { timeout: 3_000 });
});

for (const width of [1440, 1024, 390, 320]) {
  test(`doubles the logo on the hero at ${width}px, clear of the menus`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/fr");
    const logo = (await page.locator("body > header .header-logo").boundingBox())!;
    expect(logo).toMatchObject({ width: 128, height: 128 });
    expect(Math.abs(logo.x + logo.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    const others = await page.getByRole("banner").locator("summary:visible, nav a:visible, a.btn:visible").all();
    expect(others.length).toBeGreaterThan(1);
    for (const other of others) expect(overlaps(logo, (await other.boundingBox())!)).toBe(false);
  });
}

test("keeps the normal logo once past the hero and on the other pages", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
  await expect(page.locator("body")).toHaveAttribute("data-header", "solid");
  expect((await page.locator("body > header .header-logo").boundingBox())!.height).toBe(64);
  await page.goto("/fr/tarifs");
  expect((await page.locator("body > header .header-logo").boundingBox())!.height).toBe(64);
});
