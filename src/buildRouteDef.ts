import {
  ClickEvent,
  Link,
  SharedRouterProperties,
  UmbrellaRouteDefBuilder,
  UmbrellaRouteDef
} from "./types";
import { buildPathDef } from "./buildPathDef";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";
import { createMatcher } from "./createMatcher";
import { assert } from "./assert";

export function buildRouteDef(
  routeName: string,
  builder: UmbrellaRouteDefBuilder,
  getSharedRouterProperties: () => SharedRouterProperties
): UmbrellaRouteDef {
  const pathDef = buildPathDef(
    routeName,
    getParamDefsOfType("path", builder._internal.params),
    builder._internal.path
  );

  return {
    name: routeName,
    href,
    replace,
    push,
    link,
    _internal: {
      type: "RouteDef",
      match: createMatcher({ pathDef, params: builder._internal.params }),
      Route: null as any
    }
  };

  function link(params: Record<string, unknown> = {}): Link {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    return {
      href: href(params),
      onClick: (event: ClickEvent = {}) => {
        const isModifiedEvent = !!(
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        );

        const isSelfTarget =
          !event.target ||
          !event.target.target ||
          event.target.target === "_self";

        if (
          isSelfTarget && // Ignore everything but links with target self
          !event.defaultPrevented && // onClick prevented default
          event.button === 0 && // ignore everything but left clicks
          !isModifiedEvent // ignore clicks with modifier keys
        ) {
          if (event && event.preventDefault) {
            event.preventDefault();
          }

          const {
            navigate,
            queryStringSerializer
          } = getSharedRouterProperties();

          navigate(
            createLocation(
              params,
              builder._internal.params,
              pathDef,
              queryStringSerializer
            )
          );
        }
      }
    };
  }

  function href(params: Record<string, unknown> = {}) {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    const { queryStringSerializer } = getSharedRouterProperties();

    const location = createLocation(
      params,
      builder._internal.params,
      pathDef,
      queryStringSerializer
    );

    return location.path + (location.query ? `?${location.query}` : "");
  }

  function push(params: Record<string, unknown> = {}) {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    const { navigate, queryStringSerializer } = getSharedRouterProperties();

    return navigate(
      createLocation(
        params,
        builder._internal.params,
        pathDef,
        queryStringSerializer
      )
    );
  }

  function replace(params: Record<string, unknown> = {}) {
    assertRouteDefFnArgs("link", [].slice.call(arguments), params);

    const { navigate, queryStringSerializer } = getSharedRouterProperties();

    return navigate(
      createLocation(
        params,
        builder._internal.params,
        pathDef,
        queryStringSerializer
      ),
      true
    );
  }

  function assertRouteDefFnArgs(
    fnName: string,
    args: any[],
    params: Record<string, unknown>
  ) {
    assert(`routes.${routeName}.${fnName}`, [
      assert.numArgs(args, 0, 1),
      assert.type("object", "params", params)
    ]);
  }
}
