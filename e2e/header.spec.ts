import { test, expect, type Page } from "@playwright/test";

const BEACH_URL = "https://www.lesilesdeguadeloupe.com/patrimoine-naturel/plage-de-sainte-anne/";

const banner = (page: Page) => page.getByRole("banner");
const nav = (page: Page) => page.locator("body > header nav");
const languageMenu = (page: Page) => banner(page).locator("summary[aria-label^='Langue']");
const unitsMenu = (page: Page) => nav(page).locator("summary");

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
    const menu = await banner(page).getByText("Menu", { exact: true }).boundingBox();
    expect(Math.round(menu!.x + menu!.width)).toBeLessThanOrEqual(374);
    expect(menu!.x).toBeGreaterThan(195);
  });

  test("offers the same entries in the menu", async ({ page }) => {
    await page.goto("/fr");
    await banner(page).getByText("Menu", { exact: true }).click();
    for (const name of ["La plage", "Sapotille", "Maracudja", "Carambole", "Contact"]) {
      await expect(banner(page).getByRole("link", { name, exact: true }).locator("visible=true")).toHaveCount(1);
    }
    await expect(banner(page).locator(".btn")).toHaveCount(0);
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
