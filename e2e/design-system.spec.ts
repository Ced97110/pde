import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/fr", "/fr/tarifs", "/fr/gites/sapotille", "/fr/contact", "/fr/avis", "/fr/situation"];
const SITE_BACKGROUND = "rgb(255, 255, 255)";
// Measured on kubehotel-saint-tropez.com at 1440px.
const TYPE_SCALE = [43, 36.67, 30.33, 23.17, 14, 12];
const WEIGHTS = ["300", "500"];
// Dark ink, or white on the hero photos.
const BUTTON_FILLS = ["rgb(6, 42, 44)", "rgb(255, 255, 255)"];

async function audit(page: Page) {
  return page.evaluate(() => {
    const visible = [...document.querySelectorAll<HTMLElement>("body *")].filter((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    });
    const withText = visible.filter(
      (element) =>
        !element.closest("[aria-hidden='true'], .lightbox, .sr-only, nextjs-portal") &&
        [...element.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? "").trim().length > 1),
    );
    const describe = (element: HTMLElement) => `${element.tagName}.${String(element.className).slice(0, 40)}`;

    return {
      gradients: visible.filter((e) => getComputedStyle(e).backgroundImage.includes("gradient")).map(describe),
      pills: [...document.querySelectorAll<HTMLElement>("a, button, summary, .btn, input, select")]
        .filter((e) => {
          const radius = parseFloat(getComputedStyle(e).borderTopLeftRadius);
          const { height } = e.getBoundingClientRect();
          return height > 0 && radius >= height / 2;
        })
        .map(describe),
      weights: [...new Set(withText.map((e) => getComputedStyle(e).fontWeight))],
      families: [...new Set(withText.map((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/"/g, "")))],
      sizes: [...new Set(withText.map((e) => parseFloat(getComputedStyle(e).fontSize)))],
    };
  });
}

for (const route of ROUTES) {
  test.describe(route, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
    });

    test("uses the required site background", async ({ page }) => {
      await expect(page.locator("body")).toHaveCSS("background-color", SITE_BACKGROUND);
    });

    test("has no gradient and no pill-shaped control", async ({ page }) => {
      const { gradients, pills } = await audit(page);
      expect(gradients).toEqual([]);
      expect(pills).toEqual([]);
    });

    test("keeps the weights, the two families and the type scale", async ({ page }) => {
      const { weights, families, sizes } = await audit(page);
      weights.forEach((weight) => expect(WEIGHTS).toContain(weight));
      families.forEach((family) => expect(family).toMatch(/^(Inter|neoSaphion)/));
      sizes.forEach((size) => {
        expect(TYPE_SCALE.some((step) => Math.abs(step - size) < 0.6), `size ${size} is off the scale`).toBe(true);
      });
    });

    test("has no orange or beige button", async ({ page }) => {
      const fills = await page.locator(".btn").evaluateAll((buttons) => buttons.map((button) => getComputedStyle(button).backgroundColor));
      fills.forEach((fill) => expect(BUTTON_FILLS).toContain(fill));
    });
  });
}

test("declares Arial then sans-serif as fallbacks", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.locator("body")).toHaveCSS("font-family", /Inter.*Arial, sans-serif$/);
});

test("sets body copy like the reference", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const body = page.locator("body");
  await expect(body).toHaveCSS("font-size", "14px");
  await expect(body).toHaveCSS("line-height", "21px");
  await expect(body).toHaveCSS("font-weight", "300");
  await expect(body).toHaveCSS("letter-spacing", "-0.28px");
});

test("sets titles in display capitals on the reference scale", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const title = page.locator(".section-title").first();
  await expect(title).toHaveCSS("font-family", /neoSaphion/);
  await expect(title).toHaveCSS("font-weight", "300");
  await expect(title).toHaveCSS("text-transform", "uppercase");
  await expect(title).toHaveCSS("font-size", "43px");
  await expect(title).toHaveCSS("letter-spacing", "normal");
});

test("scales titles fluidly to the reference mobile size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fr");
  await expect(page.locator(".section-title").first()).toHaveCSS("font-size", "36.4375px");
});

test("sets navigation as tracked capitals", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const nav = page.locator("body > header nav");
  await expect(nav).toHaveCSS("font-size", "12px");
  await expect(nav).toHaveCSS("font-weight", "500");
  await expect(nav).toHaveCSS("letter-spacing", "0.96px");
  await expect(nav).toHaveCSS("text-transform", "uppercase");
});

test("loads the licensed title font, not a fallback", async ({ page }) => {
  await page.goto("/fr");
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((face) => /neoSaphion/.test(face.family) && !/Fallback/.test(face.family)).map((face) => face.status);
  });
  expect(loaded).toContain("loaded");
});
