import { UmbrellaRouteDef, UmbrellaRouteBuilder, RouterContext } from "./types";
import { buildPathDefs } from "./buildPathDefs";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";
import { createMatcher } from "./createMatcher";
import { assert } from "./assert";
import { buildRoute } from "./buildRoute";

export function createRouteBuilder(
  routeName: string,
  routeDef: UmbrellaRouteDef,
  getRouterContext: () => RouterContext
): UmbrellaRouteBuilder {
  const pathDefs = buildPathDefs(
    routeName,
    getParamDefsOfType("path", routeDef["~internal"].params),
    routeDef["~internal"].path
  );

  const build: UmbrellaRouteBuilder = function (
    params: Record<string, unknown> = {}
  ) {
    if (__DEV__) {
      assert(`routes.${routeName}`, [
        assert.numArgs([].slice.call(arguments), 0, 1),
        assert.type("object", "params", params),
      ]);
    }

    const routerContext = getRouterContext();

    const { arraySeparator, queryStringSerializer } = routerContext;

    const location = createLocation({
      paramCollection: params,
      paramDefCollection: routeDef["~internal"].params,
      arraySeparator,
      queryStringSerializer,
      pathDefs,
    });

    return buildRoute({
      routeName,
      params,
      location,
      routerContext,
    }) as any;
  };

  build.routeName = routeName;
  build["~internal"] = {
    type: "RouteBuilder",
    match: createMatcher({
      pathDefs,
      params: routeDef["~internal"].params,
    }) as any,
    pathDefs,
    Route: null as any,
  };

  return build;
}
