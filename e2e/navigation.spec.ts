import { test, expect } from "@playwright/test";

test("redirects the bare domain to the default French locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
});

test("navigates from the home page to a unit detail page", async ({ page }) => {
  await page.goto("/fr");
  await page.locator('#gites a[href="/fr/gites/maracudja"]').click();
  await expect(page).toHaveURL(/\/fr\/gites\/maracudja$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Maracudja");
});

test("booking from a gîte opens the form with that gîte selected", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/fr/gites/carambole");
  await page.locator('a[href="/fr/contact?gite=carambole"]', { hasText: "Réserver" }).first().click();
  await expect(page).toHaveURL(/\/fr\/contact\?gite=carambole$/);
  await expect(page.getByLabel("Gîte souhaité")).toHaveValue("carambole");
});

test("keeps the booking bar on screen on mobile gîte pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fr/gites/sapotille");
  await page.mouse.wheel(0, 1500);
  await expect(page.locator(".mobile-booking-bar")).toBeInViewport();
});

test("keeps what the guest typed when sending fails", async ({ page }) => {
  // No SMTP credentials exist in the test environment, so the send always fails here.
  await page.goto("/fr/contact");
  await page.getByLabel("Nom complet").fill("Test Utilisateur");
  await page.getByLabel("E-mail").fill("test@example.com");
  await page.getByLabel("Message").fill("Ceci est un message de test pour vérifier le formulaire.");
  await page.getByRole("button", { name: "Envoyer la demande" }).click();

  await expect(page.locator("form").getByRole("alert")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByLabel("Nom complet")).toHaveValue("Test Utilisateur");
  await expect(page.getByLabel("Message")).toHaveValue(/message de test/);
});
