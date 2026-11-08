import { test, expect, type Page } from "@playwright/test";

const BEACH_URL = "https://www.lesilesdeguadeloupe.com/patrimoine-naturel/plage-de-sainte-anne/";

const banner = (page: Page) => page.getByRole("banner");
const nav = (page: Page) => page.locator("body > header nav");
const languageMenu = (page: Page) => banner(page).locator("summary[aria-label^='Langue']");
const unitsMenu = (page: Page) => nav(page).locator("summary");
const menuButton = (page: Page) => banner(page).locator("summary.menu-toggle");

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.describe("desktop", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("puts the language far left and the menu on the right of the hero", async ({ page }) => {
    await page.goto("/fr");
    const language = await languageMenu(page).boundingBox();
    const logo = await banner(page).locator(".header-logo").boundingBox();
    const menu = await nav(page).boundingBox();
    expect(Math.round(language!.x)).toBe(48);
    expect(menu!.x).toBeGreaterThan(logo!.x + logo!.width);
    expect(Math.round(menu!.x + menu!.width)).toBe(1392);
    expect(Math.round(logo!.x + logo!.width / 2)).toBe(720);
  });

  test("keeps the language at the edge on wide inner pages", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto("/fr/tarifs");
    expect(Math.round((await languageMenu(page).boundingBox())!.x)).toBe(48);
  });

  test("offers exactly La plage, Nos gîtes and Contact", async ({ page }) => {
    await page.goto("/fr");
    await expect(nav(page).locator(".roll .sr-only")).toHaveText(["La plage", "Nos gîtes", "Contact"]);
    await expect(nav(page).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/fr/contact");
  });

  test("opens the beach guide in a new tab", async ({ page }) => {
    await page.goto("/fr");
    const beach = nav(page).getByRole("link", { name: "La plage" });
    await expect(beach).toHaveAttribute("href", BEACH_URL);
    await expect(beach).toHaveAttribute("target", "_blank");
    await expect(beach).toHaveAttribute("rel", /noopener/);
  });

  test("lists the three gîtes in a dropdown leading to their pages", async ({ page }) => {
    await page.goto("/fr");
    const links = nav(page).locator("details a");
    await expect(links.first()).toBeHidden();
    await unitsMenu(page).click();
    await expect(links.locator(".menu-card-name")).toHaveText(["Sapotille", "Maracudja", "Carambole"]);
    await expect(links.first()).toHaveCSS("color", "rgb(6, 42, 44)");
    await links.nth(2).click();
    await expect(page).toHaveURL(/\/fr\/gites\/carambole$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Carambole");
    await expect(links.first()).toBeHidden();
  });

  test("opens a gallery of the gîtes on hover", async ({ page }) => {
    await page.goto("/fr/tarifs");
    const cards = nav(page).locator("details a");
    await unitsMenu(page).hover();
    await expect(cards.locator(".menu-card-name")).toHaveText(["Sapotille", "Maracudja", "Carambole"]);
    for (const card of await cards.all()) {
      const photo = (await card.locator("img").boundingBox())!;
      const cue = card.locator(".menu-card-cue");
      await expect(cue.locator("svg")).toBeVisible();
      await expect(cue).toHaveText("");
      expect((await cue.boundingBox())!.y).toBeGreaterThanOrEqual(photo.y + photo.height);
    }
    const boxes = await Promise.all((await cards.locator("img").all()).map(async (image) => {
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      return (await image.boundingBox())!;
    }));
    boxes.forEach((box, index) => {
      expect(box.width).toBeGreaterThanOrEqual(160);
      expect(box.y).toBe(boxes[0].y);
      if (index > 0) expect(box.x).toBeGreaterThan(boxes[index - 1].x + boxes[index - 1].width);
    });
    expect(boxes[2].x + boxes[2].width).toBeLessThanOrEqual(1440 - 48);
  });

  test("keeps the gallery open on the way to a photo, and closes it once the pointer leaves", async ({ page }) => {
    await page.goto("/fr/tarifs");
    const cards = nav(page).locator("details a");
    await unitsMenu(page).hover();
    const target = (await cards.nth(1).boundingBox())!;
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
    await expect(cards.nth(1)).toBeVisible();
    await page.mouse.move(200, 600, { steps: 6 });
    await expect(cards.first()).toBeHidden();
  });

  test("glides a line from tab to tab under the pointer", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/fr/tarifs");
    const line = nav(page).locator(".nav-line");
    await expect(line).toHaveCSS("opacity", "0");
    const duration = await line.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration));
    expect(duration).toBeGreaterThan(0.2);
    expect(await line.evaluate((element) => getComputedStyle(element).transitionTimingFunction)).toMatch(/cubic-bezier|ease/);

    for (const name of ["La plage", "Nos gîtes", "Contact"]) {
      const label = nav(page).locator(".roll", { hasText: name });
      await label.hover();
      const target = (await label.boundingBox())!;
      await expect.poll(async () => Math.round((await line.boundingBox())!.x)).toBe(Math.round(target.x));
      await expect.poll(async () => Math.round((await line.boundingBox())!.width)).toBe(Math.round(target.width));
      await expect(line).toHaveCSS("opacity", "1");
    }
    await page.mouse.move(200, 600);
    await expect(line).toHaveCSS("opacity", "0");
  });

  test("eases the gîtes gallery in, and dims the photos not hovered", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/fr/tarifs");
    const panel = nav(page).locator(".dropdown-panel");
    const cards = panel.locator(".menu-card");
    expect(await panel.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeGreaterThan(0.2);
    await unitsMenu(page).hover();
    await cards.nth(1).hover();
    await expect(cards.nth(1)).toHaveCSS("opacity", "1");
    await expect.poll(() => cards.nth(0).evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(0.7);
    await expect.poll(() => cards.nth(2).evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(0.7);
  });

  test("still opens the language menu on click only", async ({ page }) => {
    await page.goto("/fr/tarifs");
    await languageMenu(page).hover();
    await page.waitForTimeout(300);
    await expect(banner(page).getByRole("link", { name: "English" })).toBeHidden();
  });

  test("closes a dropdown with Escape and on an outside click", async ({ page }) => {
    await page.goto("/fr/tarifs");
    const links = nav(page).locator("details a");
    await unitsMenu(page).click();
    await expect(links.first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(links.first()).toBeHidden();
    await expect(unitsMenu(page)).toBeFocused();
    await unitsMenu(page).click();
    await page.mouse.click(700, 500);
    await expect(links.first()).toBeHidden();
  });

  test("changes language from the dropdown, staying on the page", async ({ page }) => {
    await page.goto("/fr/tarifs");
    await expect(languageMenu(page)).toContainText("FR");
    await languageMenu(page).click();
    await banner(page).getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL("/en/tarifs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pricing & conditions");
  });

  for (const route of ["/fr", "/fr/gites/sapotille", "/en", "/en/gites/sapotille"]) {
    test(`no longer mentions availability on ${route}`, async ({ page }) => {
      await page.goto(route);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/disponibilités|availability/i);
    });
  }

  test("keeps the pages that left the header reachable from the footer", async ({ page }) => {
    await page.goto("/fr");
    const footer = page.locator("footer");
    for (const [name, href] of [
      ["Photos", "/fr/galerie"],
      ["Tarifs", "/fr/tarifs"],
      ["Situation", "/fr/situation"],
      ["Avis", "/fr/avis"],
    ]) {
      await expect(footer.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });
});

test.describe("phone", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test("keeps the language on the left and the menu on the right", async ({ page }) => {
    await page.goto("/fr");
    expect(Math.round((await languageMenu(page).boundingBox())!.x)).toBe(16);
    const bars = await menuButton(page).locator(".menu-bars").boundingBox();
    expect(Math.round(bars!.x + bars!.width)).toBe(374);
    expect(bars!.x).toBeGreaterThan(195);
  });

  for (const route of ["/fr", "/fr/tarifs"]) {
    test(`draws the menu button as two thin lines, without a frame, on ${route}`, async ({ page }) => {
      await page.goto(route);
      const button = menuButton(page);
      await expect(button).toHaveAccessibleName("Menu");
      await expect(button).toHaveCSS("border-top-width", "0px");
      await expect(button.locator(".dropdown-chevron")).toBeHidden();
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      const lines = await button.locator(".menu-bars > span").all();
      expect(lines).toHaveLength(2);
      const [top, bottom] = await Promise.all(lines.map(async (line) => (await line.boundingBox())!));
      for (const line of [top, bottom]) {
        expect(Math.round(line.width)).toBe(24);
        expect(line.height).toBeLessThanOrEqual(1.5);
      }
      expect(bottom.y - top.y).toBeGreaterThanOrEqual(6);
      expect(top.x).toBe(bottom.x);
    });
  }

  test("turns the two lines into a cross when the menu opens", async ({ page }) => {
    await page.goto("/fr");
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAccessibleName("Fermer");
    const lines = menuButton(page).locator(".menu-bars > span");
    await expect(lines.nth(0)).toHaveCSS("rotate", "45deg");
    await expect(lines.nth(1)).toHaveCSS("rotate", "-45deg");
    const [top, bottom] = await Promise.all([lines.nth(0).boundingBox(), lines.nth(1).boundingBox()]);
    expect(Math.abs(top!.y + top!.height / 2 - (bottom!.y + bottom!.height / 2))).toBeLessThan(1);
    await expect(menuButton(page)).toHaveCSS("color", "rgb(6, 42, 44)");
  });

  test("offers the same entries in the menu", async ({ page }) => {
    await page.goto("/fr");
    await menuButton(page).click();
    for (const name of ["La plage", "Sapotille", "Maracudja", "Carambole", "Contact"]) {
      await expect(banner(page).getByRole("link", { name, exact: true }).locator("visible=true")).toHaveCount(1);
    }
    await expect(banner(page).locator(".btn")).toHaveCount(0);
  });

  for (const route of ["/fr", "/fr/tarifs"]) {
    test(`covers the whole screen with the menu on ${route}`, async ({ page }) => {
      await page.goto(route);
      await menuButton(page).click();
      const sheet = banner(page).locator(".menu-sheet");
      await expect(sheet).toBeVisible();
      expect(await sheet.boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 });
      await expect(sheet).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(page.locator("html")).toHaveCSS("overflow-y", "hidden");

      await expect(menuButton(page)).toHaveAccessibleName("Fermer");
      await menuButton(page).click();
      await expect(sheet).toBeHidden();
      await expect(page.locator("html")).not.toHaveCSS("overflow-y", "hidden");
    });
  }

  test("shows the gîtes as a gallery of photos in the menu", async ({ page }) => {
    await page.goto("/fr");
    await menuButton(page).click();
    const cards = banner(page).locator(".menu-sheet .menu-card");
    await expect(cards.locator(".menu-card-name")).toHaveText(["Sapotille", "Maracudja", "Carambole"]);
    const boxes = await Promise.all((await cards.locator("img").all()).map(async (image) => {
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      return (await image.boundingBox())!;
    }));
    boxes.forEach((box, index) => {
      expect(box.width).toBeGreaterThanOrEqual(96);
      expect(box.y).toBe(boxes[0].y);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
      if (index > 0) expect(box.x).toBeGreaterThan(boxes[index - 1].x + boxes[index - 1].width);
    });
    expect(boxes[0].x).toBeGreaterThanOrEqual(16);
    expect(boxes[2].x + boxes[2].width).toBeLessThanOrEqual(374);
    await cards.nth(1).click();
    await expect(page).toHaveURL(/\/fr\/gites\/maracudja$/);
    await expect(banner(page).locator(".menu-sheet")).toBeHidden();
  });

  test("keeps the menu over the whole screen in English", async ({ page }) => {
    await page.goto("/en");
    await expect(menuButton(page)).toHaveAccessibleName("Menu");
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAccessibleName("Close");
  });
});

test("opens the dropdowns without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/fr/tarifs");
  await unitsMenu(page).click();
  await expect(nav(page).locator("details a").first()).toBeVisible();
  await context.close();
});
