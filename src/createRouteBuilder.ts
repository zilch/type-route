import { UmbrellaRouteDef, UmbrellaRouteBuilder, RouterContext } from "./types";
import { buildPathDefs } from "./buildPathDefs";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";
import { createMatcher } from "./createMatcher";
import { assert } from "./assert";
import { buildRoute } from "./buildRoute";
import { TypeRouteError } from "./TypeRouteError";

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

      for (const paramKey in params) {
        if (!(paramKey in routeDef["~internal"].params)) {
          throw TypeRouteError.Encountered_unexpected_parameter_when_building_route.create(
            {
              routeName,
              unexpectedParameterName: paramKey,
              allowedParameterNames: Object.keys(routeDef["~internal"].params),
            }
          );
        }
      }

      for (const paramKey in routeDef["~internal"].params) {
        const value = params[paramKey];
        const paramDef = routeDef["~internal"].params[paramKey]["~internal"];

        if (value === undefined) {
          if (!paramDef.optional) {
            throw TypeRouteError.Missing_required_parameter_when_building_route.create(
              {
                routeName,
                missingParameterName: paramKey,
              }
            );
          }

          continue;
        }
      }
    }

    const routerContext = getRouterContext();

    const { arraySeparator, queryStringSerializer, baseUrl } = routerContext;

    const paramsWithDefault = { ...params };

    Object.keys(routeDef["~internal"].params).forEach((paramName) => {
      const paramDef = routeDef["~internal"].params[paramName];

      if (
        paramsWithDefault[paramName] === undefined &&
        paramDef["~internal"].default !== undefined
      ) {
        paramsWithDefault[paramName] = paramDef["~internal"].default;
      }
    });

    const location = createLocation({
      paramCollection: paramsWithDefault,
      paramDefCollection: routeDef["~internal"].params,
      arraySeparator,
      queryStringSerializer,
      pathDefs,
      baseUrl,
    });

    return buildRoute({
      routeName,
      params: paramsWithDefault,
      location,
      routerContext,
    }) as any;
  };

  Object.defineProperty(build, "name", { value: routeName });

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
