import { describe, it, expect } from "vitest";

import { defineRoute } from "../src/defineRoute";
import { param } from "../src/param";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";
import { createRouter } from "../src/core";

describe("defineRoute", () => {
  it("should not allow duplicate parameter names", () => {
    const base = defineRoute(
      {
        userId: param.path.string,
      },
      (x) => `/user/${x.userId}`
    );

    expectTypeRouteError(
      TypeRouteError.Extension_route_definition_parameter_names_may_not_be_the_same_as_base_route_definition_parameter_names,
      () => {
        base.extend({ userId: param.path.string }, (x) => `/user/${x.userId}`);
      }
    );
  });

  it("extending routes should work", () => {
    const fooRoute = defineRoute({ a: param.query.string }, () => "/foo");
    const fooBarRoute = fooRoute.extend(
      { b: param.query.string },
      () => "/bar"
    );

    expect(fooBarRoute["~internal"].path({})).toEqual(["/foo/bar"]);
    expect(Object.keys(fooBarRoute["~internal"].params).sort()).toEqual([
      "a",
      "b",
    ]);
  });

  it("extending routes with params should merge path", () => {
    const fooRoute = defineRoute(
      { a: param.path.string },
      (p) => `/foo/${p.a}`
    );
    const barRoute = fooRoute.extend(
      { b: param.path.string },
      (p) => `/bar/${p.b}`
    );

    expect(Object.keys(barRoute["~internal"].params).sort()).toEqual([
      "a",
      "b",
    ]);

    expect(barRoute["~internal"].path({ a: "aa", b: "bb" })).toEqual([
      "/foo/aa/bar/bb",
    ]);
  });

  it("should be able to extend a path that is just a slash", () => {
    const home = defineRoute("/");
    expect(() => {
      createRouter({
        test: home.extend("/hi"),
      });
    }).not.toThrow();
  });
});
