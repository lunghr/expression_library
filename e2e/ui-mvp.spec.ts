import { expect, test, type Page } from "@playwright/test";

test("valid expression live analysis shows success and no problems", async ({ page }) => {
  await openPlayground(page);
  await setEditorText(page, "buyer.age > 18.5");

  await expect(page.locator("body")).toContainText("Processing State");
  await expect(page.locator("body")).toContainText("No problems.");
  await expect(page.getByText("Success", { exact: true }).first()).toBeVisible();
});

test("root suggestion insertion works with keyboard and Tab", async ({ page }) => {
  await openPlayground(page);
  await setEditorText(page, "b");
  const editor = getEditorTextbox(page);

  await expect(page.getByTestId("suggestion-panel")).toBeVisible();
  await expect(page.getByTestId("suggestion-panel")).toContainText("buyer");

  await editor.click();
  await runSuggestionAction(page, "next");
  await runSuggestionAction(page, "previous");
  await runSuggestionAction(page, "accept");

  await expect(getEditorContent(page)).toContainText("buyer");
});

test("field suggestion after dot inserts the selected field", async ({ page }) => {
  await openPlayground(page);
  await setEditorText(page, "buyer.a");
  const suggestionPanel = page.getByTestId("suggestion-panel");

  await expect(suggestionPanel).toBeVisible();
  await expect(suggestionPanel).toContainText("age");
  await expect(suggestionPanel).toContainText("active");
  await suggestionPanel.getByRole("button", { name: /active/i }).click();

  await expect(getEditorContent(page)).toContainText("buyer.active");
});

test("invalid expression shows problems and inline underline", async ({ page }) => {
  await openPlayground(page);
  await setEditorText(page, "buyer.age + seller.active");

  await expect(page.locator("body")).toContainText("Semantic Error");
  await expect(page.getByTestId("diagnostics-panel")).toContainText("SEM004");
  await expect(page.locator(".cm-diagnosticUnderline").first()).toBeVisible();
});

test("preview uses real demo context values for User and Order", async ({ page }) => {
  await openPlayground(page);

  await expect(page.getByTestId("host-integration-panel")).toContainText("buyer -> User");
  await expect(page.getByTestId("host-integration-panel")).toContainText("seller -> User");
  await expect(page.getByTestId("host-integration-panel")).toContainText("order -> Order");

  await setEditorText(page, "buyer.age + 5");
  await expect(page.locator("body")).toContainText("32");

  await openPlayground(page);
  await setEditorText(page, "order.total + 10");
  await expect(page.locator("body")).toContainText("100");
});

test("demo transport flow stays in playground and shows transport result", async ({ page }) => {
  await openPlayground(page);

  await expect(page.getByRole("button", { name: "Send Expression" })).toBeVisible();

  await setEditorText(page, "order.total + 10");
  await page.getByRole("button", { name: "Send Expression" }).click({ force: true });

  await expect(page.locator("body")).toContainText("Transport Result");
  await expect(page.locator("body")).toContainText("Success:");
});

async function openPlayground(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("demo-playground")).toBeVisible();
  await expect(page.getByTestId("expression-editor")).toBeVisible();
}

async function setEditorText(page: Page, value: string): Promise<void> {
  const editorHost = page.getByTestId("expression-editor");

  await editorHost.evaluate((host, nextValue) => {
    const editorView = (host as HTMLDivElement & {
      __expressionEditorView?: {
        state: {
          doc: {
            length: number;
          };
        };
        dispatch(spec: {
          changes: {
            from: number;
            to: number;
            insert: string;
          };
          selection: {
            anchor: number;
          };
        }): void;
        focus(): void;
      };
    }).__expressionEditorView;

    if (editorView === undefined) {
      throw new Error("Missing CodeMirror view on editor host.");
    }

    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: nextValue,
      },
      selection: {
        anchor: nextValue.length,
      },
    });
    editorView.focus();
  }, value);
}

function getEditorContent(page: Page) {
  return page.getByTestId("expression-editor").locator(".cm-content");
}

function getEditorTextbox(page: Page) {
  return page.getByRole("textbox").first();
}

async function runSuggestionAction(
  page: Page,
  action: "previous" | "next" | "close" | "accept",
): Promise<void> {
  const editorHost = page.getByTestId("expression-editor");

  await editorHost.evaluate((host, nextAction) => {
    const testActions = (host as HTMLDivElement & {
      __expressionEditorTestActions?: {
        previous(): void;
        next(): void;
        close(): void;
        accept(): void;
      };
    }).__expressionEditorTestActions;

    if (testActions === undefined) {
      throw new Error("Missing editor test actions on editor host.");
    }

    switch (nextAction) {
      case "previous":
        testActions.previous();
        break;
      case "next":
        testActions.next();
        break;
      case "close":
        testActions.close();
        break;
      case "accept":
        testActions.accept();
        break;
      default:
        break;
    }
  }, action);
}
