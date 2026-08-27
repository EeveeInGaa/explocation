import { expect, type Page, test } from "@playwright/test";

async function addCriterion(page: Page, name: RegExp) {
  await page.getByRole("button", { name: "Add criterion" }).click();
  await page.getByRole("button", { name }).click();
}

test("keeps Top Match selection, map, and details synchronized", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Explocation");
  await expect(page.getByRole("heading", { level: 1, name: "Explocation" })).toBeVisible();

  const map = page.getByRole("region", { name: "Location map" });
  await expect(map).toBeVisible();
  await expect(map.locator(".maplibregl-canvas")).toBeVisible();
  await expect(map.getByText("10 prepared locations")).toBeVisible();

  await addCriterion(page, /Distance to forest/);
  await addCriterion(page, /Distance to grocery store/);
  await addCriterion(page, /Distance to airport/);

  const completeMatchesSwitch = page.getByRole("switch", {
    name: /Prioritize complete matches/,
  });
  await expect(completeMatchesSwitch).not.toBeChecked();
  await completeMatchesSwitch.check();
  await expect(completeMatchesSwitch).toBeChecked();

  const secondMatch = page
    .getByRole("list", { name: "Ranked top matches" })
    .getByRole("button", { name: /Hanko/ });
  await secondMatch.click();

  await expect(secondMatch).toHaveAttribute("aria-pressed", "true");
  const locationDetails = page.getByRole("region", { name: "Location details" });
  await expect(locationDetails.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(
    locationDetails.getByRole("heading", { level: 5, name: "Distance to forest" }),
  ).toBeVisible();
  await expect(locationDetails.getByText("0.8 km", { exact: true }).first()).toBeVisible();
  await expect(
    locationDetails.getByRole("heading", { level: 4, name: "Yearly climate" }),
  ).toBeVisible();
  await locationDetails.getByRole("button", { name: "Daylight" }).click();
  await expect(
    locationDetails.getByRole("heading", { level: 5, name: "Daylight through the year" }),
  ).toBeVisible();
  await expect(map).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { level: 2, name: "Criteria" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Top matches" })).toBeVisible();
  await expect(map).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("adds and removes a criterion from the search profile", async ({ page }) => {
  await page.goto("/");

  const addCriterionButton = page.getByRole("button", { name: "Add criterion" });
  await addCriterionButton.focus();
  await page.keyboard.press("Enter");

  const forestOption = page.getByRole("button", { name: /Distance to forest/ });
  await page.keyboard.press("Tab");
  await expect(forestOption).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("group", { name: "Forest" })).toBeVisible();
  await expect(addCriterionButton).toBeFocused();
  await expect(page.getByRole("list", { name: "Ranked top matches" })).toBeVisible();

  await page.getByRole("button", { name: "Remove Forest criterion" }).click();
  await expect(page.getByRole("group", { name: "Forest" })).toHaveCount(0);

  await page.getByRole("button", { name: "Add criterion" }).click();
  await expect(page.getByRole("button", { name: /Distance to forest/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Location map" })).toBeVisible();
});
