import { expect, test } from "@playwright/test";

test("keeps Top Match selection, map, and details synchronized", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Explocation");
  await expect(page.getByRole("heading", { level: 1, name: "Explocation" })).toBeVisible();

  const map = page.getByRole("region", { name: "Location map" });
  await expect(map).toBeVisible();
  await expect(map.locator(".maplibregl-canvas")).toBeVisible();
  await expect(map.getByText("10 prepared locations")).toBeVisible();

  const secondMatch = page
    .getByRole("list", { name: "Ranked top matches" })
    .getByRole("button")
    .nth(1);
  await secondMatch.click();

  await expect(secondMatch).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("region", { name: "Location details" }).getByRole("heading", { level: 3 }),
  ).toBeVisible();
  await expect(map).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { level: 2, name: "Criteria" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Top matches" })).toBeVisible();
  await expect(map).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
