import { createRouter, defineRoute, param } from "../src";

describe("createRouter", () => {
  it("should push route with query string param properly", () => {
    const { routes } = createRouter({
      home: defineRoute("/"),
      there: defineRoute({ param: param.query.string }, () => "/there"),
      test: defineRoute({ t: param.query.string }, () => "/hi"),
    });

    expect(window.location.href).toBe("http://localhost/");
    routes.home().push();
    expect(window.location.href).toBe("http://localhost/");
    routes.there({ param: "hello" }).push();
    expect(window.location.href).toBe("http://localhost/there?param=hello");
    routes.test({ t: "hi" }).push();
    expect(window.location.href).toBe("http://localhost/hi?t=hi");
  });
});
