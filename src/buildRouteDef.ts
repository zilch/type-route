import {
  ClickEvent,
  Link,
  SharedRouterProperties,
  UmbrellaRouteDefBuilder,
  UmbrellaRouteDefInstance,
} from "./types";
import { buildPathDef } from "./buildPathDef";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";
import { createMatcher } from "./createMatcher";
import { assert } from "./assert";
import { preventDefaultLinkClickBehavior } from "./preventDefaultAnchorClickBehavior";
import { buildAddons } from "./buildAddons";

export function buildRouteDef(
  routeName: string,
  routeDef: UmbrellaRouteDefBuilder,
  getSharedRouterProperties: () => SharedRouterProperties,
  addons: Record<string, (...args: any[]) => any>
): UmbrellaRouteDefInstance {
  const pathDef = buildPathDef(
    routeName,
    getParamDefsOfType("path", routeDef["~internal"].params),
    routeDef["~internal"].path
  );

  return {
    name: routeName,
    href,
    replace,
    push,
    link,
    addons: buildAddons({
      routeName,
      link,
      href,
      push,
      replace,
      addons,
      getAddonArgsAndParams: (args: any[]) => {
        let params: Record<string, unknown> = {};
        if (Object.keys(routeDef["~internal"].params).length > 0) {
          params = args[0] ?? {};
          args = args.slice(1);
        }
        return { params, args };
      },
    }),
    "~internal": {
      type: "RouteDef",
      match: createMatcher({ pathDef, params: routeDef["~internal"].params }),
      Route: null as any,
    },
  };

  function link(params: Record<string, unknown> = {}): Link {
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

  function href(params: Record<string, unknown> = {}) {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    const {
      queryStringSerializer,
      arraySeparator,
    } = getSharedRouterProperties();

    const location = createLocation({
      paramCollection: params,
      paramDefCollection: routeDef["~internal"].params,
      pathDef,
      queryStringSerializer,
      arraySeparator,
    });

    return location.path + (location.query ? `?${location.query}` : "");
  }

  function push(params: Record<string, unknown> = {}) {
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

  function replace(params: Record<string, unknown> = {}) {
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
