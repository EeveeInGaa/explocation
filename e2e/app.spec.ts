import { expect, test } from "@playwright/test";

test("updates the live ranking when a preference changes", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Explocation");
  await expect(page.getByRole("heading", { level: 1, name: "Explocation" })).toBeVisible();

  const airport = page.getByRole("group", { name: "Airport" });
  await airport.getByLabel("Value").fill("200");

  await expect(
    page.getByRole("heading", { name: "No locations match all required criteria." }),
  ).toBeVisible();
  await expect(page.getByText("0 of 10 qualify")).toBeVisible();

  await page.getByRole("button", { name: "Reset preferences" }).click();
  await expect(page.getByRole("button", { name: /Białowieża/ })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { level: 2, name: "Criteria" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Top matches" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
