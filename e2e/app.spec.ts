import { expect, test } from "@playwright/test";

test("app loads and shows processing output", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("expression-editor")).toBeVisible();
  await expect(page.getByTestId("processing-state")).toContainText("Success");
  await expect(page.getByTestId("canonical-output")).toContainText("User.age > 18 && User.active");
});

test("user can enter an expression and see diagnostics", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByTestId("expression-editor").locator(".cm-content");

  await editor.click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("User.age + User.active");

  await expect(page.getByTestId("processing-state")).toContainText("Semantic Error");
  await expect(page.getByTestId("canonical-output")).toContainText("User.age + User.active");
  await expect(page.getByTestId("diagnostics-panel")).toContainText("SEM004");
});
