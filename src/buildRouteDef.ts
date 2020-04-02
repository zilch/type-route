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
      match: createMatcher({ pathDef, params: builder._internal.params }),
      Route: null as any
    }
  };

  function link(params: Record<string, unknown> = {}): Link {
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
}
