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

// Puts the bottom of the manifesto, the curtain over the photo, at a fraction of the screen height.
const liftManifesto = async (page: Page, viewportRatio: number) => {
  const bottom = await page.locator(".manifesto").evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  const height = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), bottom - height * viewportRatio);
  await page.waitForTimeout(400);
};

const photoAt = (page: Page, x: number, y: number) =>
  page.evaluate(([px, py]) => Boolean(document.elementFromPoint(px, py)?.closest(".beach")), [x, y]);

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
    await expect(images).toHaveAttribute("src", /chambre-balcon/);
    await expect(images).toHaveAttribute("alt", "Chambre ouverte sur le balcon, les palmiers et la mer");
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

    test("reveals the photo, already in place, as the manifesto lifts away", async ({ page }) => {
      await liftManifesto(page, 0.5);
      expect(Math.round((await section(page).boundingBox())!.y)).toBe(0);
      expect(await photoAt(page, width / 2, height * 0.75)).toBe(true);
      expect(await photoAt(page, width / 2, height * 0.25)).toBe(false);
      await liftManifesto(page, 0.1);
      expect(Math.round((await section(page).boundingBox())!.y)).toBe(0);
      expect(await photoAt(page, width / 2, height * 0.5)).toBe(true);
    });

    test("shows the whole photo for a moment, then lets the gîtes cover it", async ({ page }) => {
      await liftManifesto(page, -0.25);
      expect(Math.round((await section(page).boundingBox())!.y)).toBe(0);
      expect(Math.round((await units(page).boundingBox())!.y)).toBeGreaterThanOrEqual(height);
      await liftManifesto(page, -1);
      expect(Math.round((await section(page).boundingBox())!.y)).toBe(0);
      expect(Math.round((await units(page).boundingBox())!.y)).toBe(height / 2);
      await liftManifesto(page, -1.5);
      expect(Math.round((await units(page).boundingBox())!.y)).toBeLessThanOrEqual(0);
    });

    test("keeps the photo itself still throughout", async ({ page }) => {
      for (const ratio of [0.5, -0.25, -1]) {
        await liftManifesto(page, ratio);
        expect(await translateY(page)).toBe(0);
      }
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

for (const [width, height] of [[1440, 900], [1920, 1200], [1024, 1366], [390, 844]]) {
  test(`never shows the photo over the hero, all the way down, at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    const end = await page.locator(".manifesto").evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
    for (let y = 0; y <= end; y += height / 8) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      const leaks = await page.evaluate(() => {
        const hero = document.querySelector(".hero")!.getBoundingClientRect();
        const found: string[] = [];
        for (let py = Math.max(0, hero.top) + 2; py < Math.min(window.innerHeight, hero.bottom); py += 12) {
          for (const px of [4, window.innerWidth / 2, window.innerWidth - 4]) {
            if (document.elementFromPoint(px, py)?.closest(".beach")) found.push(`${Math.round(px)},${Math.round(py)}`);
          }
        }
        return found;
      });
      expect(leaks, `photo over the hero at scroll ${Math.round(y)}`).toEqual([]);
    }
  });
}

test("gives both curtains an opaque background", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(units(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".manifesto")).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("keeps the reveal and the cover under reduced motion, which only follow the scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await liftManifesto(page, 0.5);
  expect(await photoAt(page, 720, 675)).toBe(true);
  await liftManifesto(page, -1);
  expect(Math.round((await units(page).boundingBox())!.y)).toBe(450);
});

test("no longer ships the old beach photo", async ({ request }) => {
  const response = await request.get("/images/plage-sainte-anne.webp");
  expect(response.status()).toBe(404);
});

test("is translated", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(section(page).locator("img")).toHaveAttribute("alt", "Bedroom opening onto the balcony, the palm trees and the sea");
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
