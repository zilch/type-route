import { createRouter, defineRoute, param } from "../src";

describe("createRouter", () => {
  it("should work", () => {
    const { routes } = createRouter({
      home: defineRoute("/"),
      there: defineRoute({ param: param.query.string }, () => "/there"),
    });

    expect(window.location.href).toBe("http://localhost/");
    routes.there({ param: "hello" }).push();
    expect(window.location.href).toBe("http://localhost/there?param=hello");
  });
});
