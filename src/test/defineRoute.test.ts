import { defineRoute } from "../defineRoute";
import { param } from "../param";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../TypeRouteError";

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
});
