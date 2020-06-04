import {
  ClickEvent,
  Link,
  SharedRouterProperties,
  UmbrellaRouteDef,
  UmbrellaRouteBuilder,
  UmbrellaRoute,
} from "./types";
import { buildPathDef } from "./buildPathDef";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";
import { createMatcher } from "./createMatcher";
import { assert } from "./assert";
import { preventDefaultLinkClickBehavior } from "./preventDefaultAnchorClickBehavior";

export function createRouteBuilder(
  routeName: string,
  routeDef: UmbrellaRouteDef,
  getSharedRouterProperties: () => SharedRouterProperties
): UmbrellaRouteBuilder {
  const pathDef = buildPathDef(
    routeName,
    getParamDefsOfType("path", routeDef["~internal"].params),
    routeDef["~internal"].path
  );

  const build: UmbrellaRouteBuilder = function (
    params: Record<string, unknown> = {}
  ) {
    assertRouteDefFnArgs("build", [].slice.call(arguments), params);

    const route: UmbrellaRoute = {
      name: routeName,
      params,
      href: href(params),
      link: link(params),
      push: () => push(params),
      replace: () => replace(params),
    };

    return route as any;
  };

  build.routeName = routeName;
  build["~internal"] = {
    type: "RouteBuilder",
    match: createMatcher({
      pathDef,
      params: routeDef["~internal"].params,
    }) as any,
    Route: null as any,
  };

  return build;

  function link(params: Record<string, unknown>): Link {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    return {
      href: href(params),
      onClick: (event: ClickEvent = {}) => {
        if (preventDefaultLinkClickBehavior(event)) {
          const {
            navigate,
            queryStringSerializer,
            arraySeparator,
          } = getSharedRouterProperties();

          navigate(
            createLocation({
              paramCollection: params,
              paramDefCollection: routeDef["~internal"].params,
              pathDef,
              queryStringSerializer,
              arraySeparator,
            })
          );
        }
      },
    };
  }

  function href(params: Record<string, unknown>) {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    const {
      queryStringSerializer,
      arraySeparator,
      history,
    } = getSharedRouterProperties();

    const location = createLocation({
      paramCollection: params,
      paramDefCollection: routeDef["~internal"].params,
      pathDef,
      queryStringSerializer,
      arraySeparator,
    });

    return history.createHref({
      pathname: location.path,
      search: location.query,
    });
  }

  function push(params: Record<string, unknown>) {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    const {
      navigate,
      queryStringSerializer,
      arraySeparator,
    } = getSharedRouterProperties();

    return navigate(
      createLocation({
        paramCollection: params,
        paramDefCollection: routeDef["~internal"].params,
        pathDef,
        queryStringSerializer,
        arraySeparator,
      })
    );
  }

  function replace(params: Record<string, unknown>) {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    const {
      navigate,
      queryStringSerializer,
      arraySeparator,
    } = getSharedRouterProperties();

    return navigate(
      createLocation({
        paramCollection: params,
        paramDefCollection: routeDef["~internal"].params,
        pathDef,
        queryStringSerializer,
        arraySeparator,
      }),
      true
    );
  }

  function assertRouteDefFnArgs(
    fnName: string,
    args: any[],
    params: Record<string, unknown>
  ) {
    if (__DEV__) {
      assert(`routes.${routeName}.${fnName}`, [
        assert.numArgs(args, 0, 1),
        assert.type("object", "params", params),
      ]);
    }
  }
}
