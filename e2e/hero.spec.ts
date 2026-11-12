import { test, expect, type Page } from "@playwright/test";
import { worstWhiteContrast } from "./contrast";

const pastHero = async (page: Page) => {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
  await expect(page.locator("body")).toHaveAttribute("data-header", "solid");
};

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
  await pastHero(page);
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

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`puts the Réserver button under the title at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height });
    await page.goto("/fr");
    const button = page.locator(".hero").getByRole("link", { name: "Réserver" });
    await expect(button).toHaveAttribute("href", "/fr/contact");
    const title = (await page.locator(".hero-title").boundingBox())!;
    const box = (await button.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(title.y + title.height);
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
  });
}

test("takes the hero button to the contact form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await page.locator(".hero").getByRole("link", { name: "Réserver" }).click();
  await expect(page).toHaveURL(/\/fr\/contact$/);
  await expect(page.getByLabel("Nom complet")).toBeVisible();
});

test("translates the hero button", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.locator(".hero").getByRole("link", { name: "Book" })).toHaveAttribute("href", "/en/contact");
});

test("removes the Réserver button from the menu, on every page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/fr", "/fr/tarifs"]) {
    await page.goto(route);
    await expect(page.getByRole("banner").getByRole("link", { name: "Réserver", includeHidden: true })).toHaveCount(0);
  }
});

test("reveals the button with the intro, and never leaves it hidden", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const button = page.locator(".hero").getByRole("link", { name: "Réserver" });
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  await expect(button).toBeVisible({ timeout: 3_000 });
  await expect(button).toHaveCSS("opacity", "1", { timeout: 3_000 });
});

test("shows only the title on the hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.getByText("Bonjou !")).toHaveCount(0);
  await expect(page.locator(".hero p")).toHaveCount(0);
});

const secondSlide = (page: Page) => page.locator(".hero-slide").nth(1);

// Holds the cross-fade at one point of its loop, between 0 and 1.
const holdCarouselAt = (page: Page, progress: number) =>
  secondSlide(page).evaluate((slide, at) => {
    const [fade] = slide.getAnimations();
    fade.pause();
    fade.currentTime = Number(fade.effect!.getComputedTiming().duration) * at;
    return getComputedStyle(slide).opacity;
  }, progress);

for (const [width, height] of [[1920, 1080], [1440, 900], [1024, 768], [390, 844]]) {
  test(`covers the whole hero with both photos at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height });
    await page.goto("/fr");
    const hero = (await page.locator(".hero").boundingBox())!;
    expect(hero).toMatchObject({ x: 0, y: 0, width, height });
    const slides = page.locator(".hero-slide");
    await expect(slides).toHaveCount(2);
    for (const slide of await slides.locator("img").all()) {
      expect(await slide.boundingBox()).toEqual(hero);
      await expect(slide).toHaveAttribute("alt", "");
    }
    await expect(page.locator(".hero video, .hero-panel, .hero-photo")).toHaveCount(0);
  });
}

test("cross-fades between the two photos, in a loop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  expect(await holdCarouselAt(page, 0.2)).toBe("0");
  expect(await holdCarouselAt(page, 0.7)).toBe("1");
  expect(Number(await holdCarouselAt(page, 0.965))).toBeGreaterThan(0);
  const iterations = await secondSlide(page).evaluate((slide) => slide.getAnimations()[0].effect!.getComputedTiming().iterations);
  expect(iterations).toBe(Infinity);
});

test("loads both photos at once, so the fade never reveals an empty slide", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  for (const image of await page.locator(".hero-slide img").all()) {
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
});

test("stays on the first photo under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(secondSlide(page)).toHaveCSS("opacity", "0");
  expect(await secondSlide(page).evaluate((slide) => slide.getAnimations().length)).toBe(0);
});

test("still shows the first photo without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  await expect(page.locator(".hero-slide img").first()).toBeVisible();
  await context.close();
});

test("sets a centred white title and a white header over the photos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await expect(page.locator(".hero-title")).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.locator(".hero-title")).toHaveCSS("text-align", "center");
  await expect(page.locator("body > header")).toHaveCSS("color", "rgb(255, 255, 255)");
  expect(await page.locator("body > header").boundingBox()).toMatchObject({ x: 0, y: 0, width: 1440 });
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`keeps the header and title readable on both photos at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/fr");
    await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
    await page.addStyleTag({ content: "body > header, .hero-title { visibility: hidden; }" });
    for (const progress of [0.2, 0.7]) {
      await holdCarouselAt(page, progress);
      const header = await page.screenshot({ clip: { x: 0, y: 0, width, height: 80 } });
      const title = await page.screenshot({ clip: { x: 0, y: height * 0.35, width, height: height * 0.3 } });
      expect(await worstWhiteContrast(page, header)).toBeGreaterThanOrEqual(4.5);
      expect(await worstWhiteContrast(page, title)).toBeGreaterThanOrEqual(3);
    }
  });
}

test("whitens the logo's name over the photos only", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const logo = page.locator("body > header .header-logo");
  await expect(logo).toHaveCSS("content", /logo-pieds-light\.svg/);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
  await expect(page.locator("body")).toHaveAttribute("data-header", "solid");
  await expect(logo).not.toHaveCSS("content", /logo-pieds-light/);
});

test("gets the normal header back past the hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
  await expect(page.locator("body")).toHaveAttribute("data-header", "solid");
  await expect(page.locator("body > header")).toHaveCSS("left", "0px");
  await expect(page.locator("body > header")).toHaveCSS("top", "0px");
});

const language = (page: Page) => page.getByRole("banner").locator("summary[aria-label^='Langue']");
const menu = (page: Page, width: number) =>
  page.getByRole("banner").locator(width < 1024 ? "summary.menu-toggle" : "nav");

for (const width of [1440, 1024, 390, 320]) {
  test(`doubles the logo on the hero at ${width}px, the menu beside it`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/fr");
    const logo = (await page.locator("body > header .header-logo").boundingBox())!;
    expect(logo).toMatchObject({ width: 128, height: 128 });
    expect(Math.abs(logo.x + logo.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    await expect(menu(page, width)).toBeVisible();
    const box = (await menu(page, width).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(logo.x + logo.width);
    await expect(language(page)).toBeHidden();
    await expect(page.getByRole("banner").locator("a.btn:visible")).toHaveCount(0);
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

for (const width of [1440, 390]) {
  test(`hides only the language on the hero at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/fr");
    const banner = page.getByRole("banner");
    await expect(banner.locator(".header-logo")).toBeVisible();
    await expect(menu(page, width)).toBeVisible();
    await expect(language(page)).toBeHidden();
    await expect(banner).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

    await pastHero(page);
    await expect(language(page)).toBeVisible();
    await expect(menu(page, width)).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator("body")).toHaveAttribute("data-header", "hero");
    await expect(language(page)).toBeHidden();
    await expect(menu(page, width)).toBeVisible();
  });
}

test("reaches the menu but not the hidden language from the keyboard on the hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const reached: string[] = [];
  for (let press = 0; press < 4; press += 1) {
    await page.keyboard.press("Tab");
    reached.push(await page.evaluate(() => {
      const element = document.activeElement;
      if (!element?.closest("body > header")) return "outside";
      if (element.matches("a[href='/fr']")) return "logo";
      if (element.closest("nav")) return "menu";
      return element.outerHTML.slice(0, 60);
    }));
  }
  expect(reached.filter((entry) => !["outside", "logo", "menu"].includes(entry))).toEqual([]);
  expect(reached).toContain("logo");
  expect(reached).toContain("menu");
});

test("eases the logo from one size to the other", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  const logo = page.locator("body > header .header-logo");
  await expect.poll(async () => (await logo.boundingBox())!.height).toBe(128);
  await pastHero(page);
  const transitions = await logo.evaluate((element) =>
    element.getAnimations().map((animation) => (animation as CSSTransition).transitionProperty),
  );
  expect(transitions).toContain("transform");
  await expect.poll(async () => (await logo.boundingBox())!.height).toBe(64);
});

test("swaps the logo size at once under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  await pastHero(page);
  expect((await page.locator("body > header .header-logo").boundingBox())!.height).toBe(64);
});
