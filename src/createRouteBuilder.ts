import {
  UmbrellaRouteDef,
  UmbrellaRouteBuilder,
  UmbrellaRoute,
  RouterContext,
} from "./types";
import { buildPathDefs } from "./buildPathDefs";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";
import { createMatcher } from "./createMatcher";
import { assert } from "./assert";
import { preventDefaultLinkClickBehavior } from "./preventDefaultAnchorClickBehavior";

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
    const { history, navigate } = routerContext;

    const location = createLocation({
      routeName,
      paramCollection: params,
      routerContext,
    });

    const href = history.createHref({
      pathname: location.path,
      search: location.query,
    });

    const route: UmbrellaRoute = {
      name: routeName,
      params,
      href,
      link: {
        href,
        onClick: (event) => {
          if (preventDefaultLinkClickBehavior(event)) {
            navigate(route, true, false);
          }
        },
      },
      push: () => navigate(route, true, false),
      replace: () => navigate(route, true, true),
    };

    return route as any;
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
