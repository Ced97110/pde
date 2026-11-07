import { test, expect, type Page } from "@playwright/test";

const IMAGE_LED = ["/fr/gites/sapotille", "/fr/gites/maracudja", "/fr/gites/carambole"];
const PLAIN = ["/fr/tarifs", "/fr/situation", "/fr/avis", "/fr/galerie", "/fr/contact", "/fr/mentions-legales"];
const ROUTES = [...PLAIN, ...IMAGE_LED];
const MARGINS: Array<[number, number, number]> = [[1440, 900, 48], [768, 1024, 26], [390, 844, 16]];
const INK = "rgb(6, 42, 44)";

const open = async (page: Page, route: string, width: number, height: number) => {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
};

for (const route of ROUTES) {
  for (const [width, height, margin] of MARGINS) {
    test(`starts ${route} on the page margin at ${width}px`, async ({ page }) => {
      await open(page, route, width, height);
      const title = await page.locator("main h1").first().boundingBox();
      expect(Math.round(title!.x)).toBe(margin);
    });
  }

  test(`has square corners and one rule style on ${route}`, async ({ page }) => {
    await open(page, route, 1440, 900);
    const offenders = await page.locator("main *").evaluateAll((elements) =>
      elements
        .filter((el) => !el.closest(".lightbox"))
        .filter((el) => {
          const style = getComputedStyle(el);
          return style.borderTopLeftRadius !== "0px" || parseFloat(style.borderTopWidth) > 1;
        })
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`),
    );
    expect(offenders).toEqual([]);
  });

  test(`keeps 20px between the title and what follows on ${route}`, async ({ page }) => {
    await open(page, route, 1440, 900);
    const gap = await page.locator("main h1").first().evaluate((el) => {
      const next = el.nextElementSibling as HTMLElement;
      return next.getBoundingClientRect().top - el.getBoundingClientRect().bottom;
    });
    expect(Math.round(gap)).toBe(20);
  });
}

for (const route of PLAIN) {
  test(`opens ${route} with the section space of the home page`, async ({ page }) => {
    await open(page, route, 1440, 900);
    const title = await page.locator("main h1").first().boundingBox();
    expect(Math.round(title!.y)).toBe(80 + 112);
    const main = await page.locator("main > div").first().evaluate((el) => getComputedStyle(el).paddingBottom);
    expect(main).toBe("112px");
  });
}

for (const route of ["/fr/situation", "/fr/mentions-legales"]) {
  test(`keeps a readable line length on ${route}`, async ({ page }) => {
    await open(page, route, 1920, 1080);
    const widths = await page.locator("main p").evaluateAll((list) => list.map((el) => el.getBoundingClientRect().width));
    widths.forEach((width) => expect(width).toBeLessThanOrEqual(672));
  });
}

test("uses the same 12px grid gap in the galleries", async ({ page }) => {
  await open(page, "/fr/galerie", 1440, 900);
  await expect(page.locator("#gallery > div").first()).toHaveCSS("column-gap", "12px");
  await open(page, "/fr/gites/sapotille", 1440, 900);
  await expect(page.locator("#gallery .grid").first()).toHaveCSS("column-gap", "12px");
});

test("spaces the gîte page blocks by 64px", async ({ page }) => {
  await open(page, "/fr/gites/sapotille", 1440, 900);
  const gap = await page.locator("#gallery").evaluate((el) => {
    const previous = el.previousElementSibling as HTMLElement;
    return el.getBoundingClientRect().top - previous.getBoundingClientRect().bottom;
  });
  expect(Math.round(gap)).toBe(64);
});

test("runs the photo strip edge to edge, without gaps", async ({ page }) => {
  await open(page, "/fr", 1440, 900);
  await expect(page.locator(".reviews + section")).toHaveCSS("column-gap", "normal");
});

test("sets running text in the main ink colour", async ({ page }) => {
  await open(page, "/fr/tarifs", 1440, 900);
  await expect(page.locator("main section li").first()).toHaveCSS("color", INK);
  await open(page, "/fr/situation", 1440, 900);
  await expect(page.locator("main .reading p").first()).toHaveCSS("color", INK);
  await open(page, "/fr/mentions-legales", 1440, 900);
  await expect(page.locator("main .reading p").first()).toHaveCSS("color", INK);
  await open(page, "/fr", 1440, 900);
  await expect(page.locator(".host-text p").first()).toHaveCSS("color", INK);
});

test("underlines the way back to the gîtes", async ({ page }) => {
  await open(page, "/fr/gites/carambole", 1440, 900);
  await expect(page.getByRole("link", { name: /Retour aux gîtes/ })).toHaveCSS("text-decoration-line", "underline");
});

test("lines the contact details up with the middle of the page", async ({ page }) => {
  await open(page, "/fr/contact", 1440, 900);
  const aside = await page.locator("main aside").boundingBox();
  expect(Math.abs(aside!.x - 726)).toBeLessThanOrEqual(1);
});

test.describe("pricing on phones", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/fr/tarifs", 390, 844);
  });

  test("shows every price without sideways scrolling", async ({ page }) => {
    const cells = page.locator("main table tbody td");
    await expect(cells).toHaveCount(15);
    const overflowing = await cells.evaluateAll((list) =>
      list.filter((el) => el.getBoundingClientRect().right > window.innerWidth - 15).length,
    );
    expect(overflowing).toBe(0);
    const scroller = await page.locator("main table").evaluate((el) => {
      const parent = el.parentElement!;
      return parent.scrollWidth - parent.clientWidth;
    });
    expect(scroller).toBeLessThanOrEqual(0);
  });

  test("keeps each price on one line, next to its season and dates", async ({ page }) => {
    const price = page.locator("main table tbody tr").first().locator("td").nth(2);
    await expect(price).toHaveAttribute("data-label", "Haute saison");
    await expect(price).toHaveAttribute("data-dates", /novembre/);
    const lines = await price.locator("span").evaluate((el) => el.getClientRects().length);
    expect(lines).toBe(1);
  });
});

test("keeps the pricing table as a table on larger screens", async ({ page }) => {
  await open(page, "/fr/tarifs", 1440, 900);
  await expect(page.locator("main thead th").first()).toBeVisible();
  await expect(page.locator("main thead th div").first()).toHaveCSS("font-size", "14px");
  await expect(page.locator("main thead th div").first()).toHaveCSS("font-weight", "300");
});

test("states the gîte price as information, not as a title", async ({ page }) => {
  await open(page, "/fr/gites/sapotille", 1440, 900);
  const price = page.locator("main aside p").first();
  await expect(price).toHaveCSS("font-family", /Inter/);
  await expect(price).toHaveCSS("text-transform", "none");
  await expect(price).toHaveCSS("font-weight", "500");
});

test("sets the gîte description in the body text style", async ({ page }) => {
  await open(page, "/fr/gites/sapotille", 1440, 900);
  await expect(page.locator("main article h1 + p")).toHaveCSS("line-height", "21px");
});

test("opens the contact page on a short title, the form within reach", async ({ page }) => {
  await open(page, "/fr/contact", 390, 844);
  await expect(page.locator("main h1")).toHaveText("Nous contacter");
  await expect(page.locator("main h1 + div").getByRole("link", { name: "0690 50 34 58" })).toHaveAttribute("href", /^tel:/);
  await expect(page.locator("main form")).toBeVisible();
  const form = await page.locator("main form").boundingBox();
  expect(form!.y).toBeLessThan(600);
});

test("sets the buttons in the label weight", async ({ page }) => {
  await open(page, "/fr", 1440, 900);
  await expect(page.locator(".hero").getByRole("link", { name: "Réserver" })).toHaveCSS("font-weight", "500");
});

for (const route of ["/fr", "/fr/gites/carambole", "/fr/contact", "/fr/tarifs"]) {
  test(`gives every standalone link a 24px target on ${route}`, async ({ page }) => {
    await open(page, route, 390, 844);
    const small = await page.locator("main a, footer a").evaluateAll((links) =>
      links
        .filter((el) => !el.closest("p, h1, h2, .lightbox"))
        .map((el) => ({ text: el.textContent?.trim().slice(0, 24), height: el.getBoundingClientRect().height, width: el.getBoundingClientRect().width }))
        .filter((link) => link.height > 0 && (link.height < 24 || link.width < 24)),
    );
    expect(small).toEqual([]);
  });
}
