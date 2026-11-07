import { test, expect, type Locator, type Page } from "@playwright/test";
import { worstWhiteContrast } from "./contrast";

const cards = (page: Page) => page.locator("#gites .unit-card");
const frame = (card: Locator) => card.locator(".unit-card-frame");
const media = (card: Locator) => card.locator(".unit-card-media");

const translateY = (locator: Locator) =>
  locator.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);

const scrollToCard = async (page: Page, card: Locator, viewportRatio: number) => {
  const top = await card.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const height = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top - height * viewportRatio);
  await page.waitForTimeout(300);
};

test.describe("layout at 1440px", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
  });

  test("centres the title, without the intro paragraph", async ({ page }) => {
    const title = page.locator("#gites h2");
    await expect(title).toHaveText("Trois gîtes, une plage");
    await expect(title).toHaveCSS("text-align", "center");
    const words = await title.locator(".reveal-word").evaluateAll((spans) => spans.map((span) => span.getBoundingClientRect()));
    const middle = (words[0].left + words.at(-1)!.right) / 2;
    expect(Math.abs(middle - 720)).toBeLessThan(2);
    await expect(page.locator("#gites > p, #gites > div > p")).toHaveCount(0);
  });

  test("covers the viewport: two half-screen photos, then one full-screen photo", async ({ page }) => {
    await expect(cards(page)).toHaveCount(3);
    const [sapotille, maracudja, carambole] = await Promise.all(
      [0, 1, 2].map((index) => frame(cards(page).nth(index)).boundingBox()),
    );
    expect(sapotille).toMatchObject({ x: 0, width: 720, height: 900 });
    expect(maracudja).toMatchObject({ x: 720, width: 720, height: 900 });
    expect(maracudja!.y).toBe(sapotille!.y);
    expect(carambole).toMatchObject({ x: 0, width: 1440, height: 900 });
    expect(carambole!.y).toBe(sapotille!.y + 900);
  });

  test("serves images sharp enough for the crop", async ({ page }) => {
    for (const index of [0, 1, 2]) {
      const image = cards(page).nth(index).locator(".unit-card-media > img");
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0)).toBe(true);
      // naturalWidth is density-corrected with a srcset, so decode the served file to read its real pixels.
      const { served, rendered } = await image.evaluate(async (el: HTMLImageElement) => {
        const probe = new Image();
        probe.src = el.currentSrc;
        await probe.decode();
        const box = el.getBoundingClientRect();
        const cover = Math.max(box.width / probe.naturalWidth, box.height / probe.naturalHeight);
        return { served: probe.naturalHeight, rendered: probe.naturalHeight * cover };
      });
      // Maracudja's source tops out at 800px high for a 988px image: 20% tolerance until the original arrives.
      expect(served).toBeGreaterThanOrEqual(rendered * 0.8);
    }
  });
});

test("scrolls the images with the page, without parallax", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const card = cards(page).first();
  for (const offset of [-500, 0, 500]) {
    await card.evaluate((el, by) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + by, behavior: "instant" }), offset);
    await page.waitForTimeout(200);
    expect(await translateY(media(card))).toBe(0);
    const [outer, inner] = await Promise.all([frame(card).boundingBox(), media(card).boundingBox()]);
    expect(inner).toEqual(outer);
  }
});

test("keeps the images still under reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const card = cards(page).nth(1);
  await scrollToCard(page, card, 0.5);
  expect(await translateY(media(card))).toBe(0);
});

test("gives each photo the whole screen on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const boxes = await Promise.all([0, 1, 2].map((index) => frame(cards(page).nth(index)).boundingBox()));
  boxes.forEach((box) => expect(box).toMatchObject({ x: 0, width: 390, height: 844 }));
  expect(boxes[1]!.y).toBe(boxes[0]!.y + 844);
  expect(boxes[2]!.y).toBe(boxes[1]!.y + 844);
});

for (const [width, height] of [[1440, 900], [768, 1024]]) {
  test(`keeps the white text readable on each second photo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    for (const index of [0, 1, 2]) {
      const card = cards(page).nth(index);
      const caption = card.locator(".unit-card-caption");
      await caption.scrollIntoViewIfNeeded();
      await card.hover();
      const image = card.locator(".unit-card-alt img");
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0)).toBe(true);

      const box = (await caption.boundingBox())!;
      await caption.evaluate((el) => (el.style.visibility = "hidden"));
      const shot = await page.screenshot({ clip: box });
      await caption.evaluate((el) => (el.style.visibility = ""));
      expect(await worstWhiteContrast(page, shot)).toBeGreaterThanOrEqual(4.5);
    }
  });
}

for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
  test(`keeps the white text readable on each photo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    for (const index of [0, 1, 2]) {
      const card = cards(page).nth(index);
      const caption = card.locator(".unit-card-caption");
      await caption.scrollIntoViewIfNeeded();
      await expect.poll(() => card.locator(".unit-card-media > img").evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0)).toBe(true);
      await expect(caption).toHaveCSS("color", "rgb(255, 255, 255)");

      for (const text of [caption, card.locator(".unit-card-cue")]) {
        const box = (await text.boundingBox())!;
        await text.evaluate((el) => (el.style.visibility = "hidden"));
        const shot = await page.screenshot({ clip: box });
        await text.evaluate((el) => (el.style.visibility = ""));
        expect(await worstWhiteContrast(page, shot)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}

test("keeps the images still on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr");
  await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  const card = cards(page).nth(1);
  await scrollToCard(page, card, 0.5);
  expect(await translateY(media(card))).toBe(0);
});

const HOVER_PHOTOS = ["2026-10-14-28", "2026-10-14-49", "2026-10-14-42"];

test.describe("second photo", () => {
  const altOpacity = (card: Locator) => card.locator(".unit-card-alt").evaluate((el) => getComputedStyle(el).opacity);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/fr");
    await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
  });

  for (const [index, photo] of HOVER_PHOTOS.entries()) {
    test(`fades to another photo of gîte ${index + 1} on hover, and back`, async ({ page }) => {
      const card = cards(page).nth(index);
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator(".unit-card-alt img")).toHaveAttribute("src", new RegExp(photo));
      expect(await altOpacity(card)).toBe("0");
      await card.hover();
      await expect.poll(() => altOpacity(card)).toBe("1");
      await page.mouse.move(0, 0);
      await expect.poll(() => altOpacity(card)).toBe("0");
    });
  }

  test("shows it on keyboard focus too", async ({ page }) => {
    const card = cards(page).first();
    await card.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(card).toBeFocused();
    await expect.poll(() => altOpacity(card)).toBe("1");
  });

  test("is not loaded on touch screens", async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    const requested: string[] = [];
    page.on("request", (request) => requested.push(request.url()));
    await page.goto("http://localhost:3000/fr");
    await cards(page).nth(2).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(cards(page).first().locator(".unit-card-alt")).toBeHidden();
    HOVER_PHOTOS.forEach((photo) => expect(requested.filter((url) => url.includes(photo))).toEqual([]));
    await context.close();
  });

  test("stays out of the gîte pages", async ({ page }) => {
    await page.goto("/fr/gites/sapotille");
    await expect(page.locator(".unit-card-alt")).toHaveCount(0);
  });
});

test("shows the gîte name, then an arrow towards its page, on the home photos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const names = ["Sapotille", "Maracudja", "Carambole"];
  for (const [index, name] of names.entries()) {
    const card = cards(page).nth(index);
    await expect(card.locator(".unit-card-caption")).toHaveText(name);
    const cue = card.locator(".unit-card-cue");
    await expect(cue.locator("svg")).toBeVisible();
    await expect(cue).toHaveText("");
    await expect(cue).toHaveCSS("color", "rgb(255, 255, 255)");
    const caption = (await card.locator(".unit-card-caption").boundingBox())!;
    expect((await cue.boundingBox())!.y).toBeGreaterThanOrEqual(caption.y + caption.height);
  }
});

test("slides the arrow towards the page on hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr/gites/sapotille");
  const card = page.locator(".unit-card").first();
  const arrow = card.locator(".unit-card-cue svg");
  await card.scrollIntoViewIfNeeded();
  const before = (await arrow.boundingBox())!.x;
  await card.hover();
  await expect.poll(async () => (await arrow.boundingBox())!.x - before).toBeGreaterThan(3);
});

test("puts the arrow under each photo of the other gîtes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/fr/gites/sapotille", "/en/gites/sapotille"]) {
    await page.goto(route);
    const card = page.locator(".unit-card").first();
    await expect(card.locator(".unit-card-cue svg")).toBeVisible();
    await expect(page.getByText(/Voir le gîte|View the gîte/)).toHaveCount(0);
    const photo = (await card.locator(".unit-card-frame").boundingBox())!;
    expect((await card.locator(".unit-card-cue").boundingBox())!.y).toBeGreaterThanOrEqual(photo.y + photo.height);
  }
});

test("keeps the price and details on the gîte pages", async ({ page }) => {
  await page.goto("/fr/gites/sapotille");
  const card = page.locator(".unit-card").first();
  await expect(card).toContainText("Dès");
  await expect(card).toContainText("m²");
});

test("opens the gîte from its card", async ({ page }) => {
  await page.goto("/fr#gites");
  await cards(page).nth(2).click();
  await expect(page).toHaveURL(/\/fr\/gites\/carambole$/);
});

test("stays complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr");
  await expect(cards(page)).toHaveCount(3);
  await expect(cards(page).nth(0).locator("h3")).toHaveText("Sapotille");
  await context.close();
});

for (const [route, selector] of [
  ["/fr", "#gites .unit-card"],
  ["/en", "#gites .unit-card"],
  ["/fr/gites/sapotille", ".unit-card"],
] as const) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`keeps the card text inside its card on ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      const overflow = await page.locator(selector).evaluateAll((list) =>
        list.flatMap((card) => {
          const limit = card.getBoundingClientRect().right;
          return [...card.querySelectorAll("h3, p")]
            .filter((el) => el.getBoundingClientRect().right > limit + 0.5)
            .map((el) => el.textContent);
        }),
      );
      expect(overflow).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}

test.describe("section title", () => {
  const words = (page: Page) => page.locator("#gites h2 .reveal-word");
  const opacities = (page: Page) =>
    words(page).evaluateAll((list) => list.map((word) => Number(getComputedStyle(word).opacity)));
  const scrollTitle = async (page: Page, viewportRatio: number) => {
    const top = await page.locator("#gites h2").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top - 900 * viewportRatio);
    await page.waitForTimeout(500);
  };

  test("reveals word by word with the scroll, like the manifesto", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/fr");
    await expect(page.locator("html")).not.toHaveAttribute("data-hero-intro", /.+/, { timeout: 3_000 });
    await expect(words(page)).toHaveCount(4);
    await expect(page.locator("#gites h2")).toHaveText("Trois gîtes, une plage");

    await scrollTitle(page, 0.98);
    (await opacities(page)).forEach((opacity) => expect(opacity).toBeLessThan(0.2));

    await scrollTitle(page, 0.7);
    const midway = await opacities(page);
    expect(midway[0]).toBe(1);
    expect(midway[3]).toBeLessThan(0.2);

    await scrollTitle(page, 0.4);
    expect(new Set(await opacities(page))).toEqual(new Set([1]));
  });

  test("stays fully visible under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    expect(new Set(await opacities(page))).toEqual(new Set([1]));
  });

  test("stays fully visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/fr");
    await expect(words(page).first()).toHaveCSS("opacity", "1");
    await context.close();
  });
});
