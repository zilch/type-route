import { defineRoute } from "../src/defineRoute";
import { param } from "../src/param";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";

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
});
