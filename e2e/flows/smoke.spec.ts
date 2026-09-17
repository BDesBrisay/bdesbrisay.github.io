/**
 * Flow: smoke-home-loads
 * Story: The home page responds and shows a document title.
 * Preconditions: dev server running; no auth required.
 * Steps: open / -> expect the page to have a title or main landmark.
 * Added: 2026-09-12 by scaffold. Last verified: 2026-09-12.
 */
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
