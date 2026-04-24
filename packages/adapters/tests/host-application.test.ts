import { describe, expect, it } from "vitest";

import { createDemoHostApplication } from "../src/index.js";

describe("host application adapter", () => {
  it("initializes core-facing services without exposing adapter internals", async () => {
    const hostApplication = createDemoHostApplication();
    const services = await hostApplication.initialize();

    expect(services.catalog.getModel("User")?.name).toBe("User");

    const processed = services.processExpression("User.age > 18");
    expect(processed.status).toBe("success");
    expect(processed.expression).toBe("User.age > 18");

    const submitted = await services.submitExpression("User.age > 18");
    expect(submitted.accepted).toBe(true);
    expect(submitted.expression).toBe("User.age > 18");
    expect(submitted.status).toBe("success");
  });
});
