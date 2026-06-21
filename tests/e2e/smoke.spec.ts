import { test, expect } from "@playwright/test";

/**
 * Public smoke tests. Intentionally text-based and resilient: they assert the
 * page renders and shows recognizable copy, not exact DOM structure, so they
 * survive ongoing UI changes by other agents. A failed navigation (non-OK HTTP
 * status) is treated as a hard failure; copy assertions use forgiving regexes.
 */

test.describe("public smoke", () => {
  test("landing page loads", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok(), "GET / should return a 2xx").toBeTruthy();
    // Brand should appear somewhere (nav, hero, or footer).
    await expect(page.getByText(/CourseHub/i).first()).toBeVisible();
  });

  test("catalog shows courses", async ({ page }) => {
    const res = await page.goto("/catalog");
    expect(res?.ok(), "GET /catalog should return a 2xx").toBeTruthy();
    // Either a heading or course cards — match catalog-ish copy.
    await expect(
      page.getByText(/courses|catalog|browse|explore/i).first(),
    ).toBeVisible();
  });

  test("pricing shows tiers", async ({ page }) => {
    const res = await page.goto("/pricing");
    expect(res?.ok(), "GET /pricing should return a 2xx").toBeTruthy();
    // The paid tiers should be named on the page.
    await expect(page.getByText(/basic/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();
    await expect(page.getByText(/premium/i).first()).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.ok(), "GET /login should return a 2xx").toBeTruthy();
    // An email field and a submit affordance should exist.
    await expect(
      page.getByText(/sign in|log in|login|email/i).first(),
    ).toBeVisible();
  });
});
