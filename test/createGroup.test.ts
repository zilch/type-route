import { describe, it, expect } from "vitest";

import { createGroup, createRouter, defineRoute } from "../src/core";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";

describe("createGroup", () => {
  it("work", () => {
    const { routes, session } = createRouter({
      one: defineRoute("/one"),
      two: defineRoute("/two"),
      a: defineRoute("/a"),
      b: defineRoute("/b"),
      foo: defineRoute("/foo"),
    });

    let route = session.getInitialRoute();

    session.listen((nextRoute) => {
      route = nextRoute;
    });

    const numbersGroup = createGroup([routes.one, routes.two]);
    const lettersGroup = createGroup([routes.a, routes.b]);
    const numbersLettersGroup = createGroup([numbersGroup, lettersGroup]);

    expect(numbersLettersGroup.has(route)).toBe(false);
    routes.a().push();
    expect(numbersLettersGroup.has(route)).toBe(true);
    expect(lettersGroup.has(route)).toBe(true);
    expect(numbersGroup.has(route)).toBe(false);

    expectTypeRouteError(
      TypeRouteError.Expected_type_does_not_match_actual_type,
      () => {
        createGroup([1, 2]);
      }
    );
  });
});
