import {
  ParamDefCollection,
  RouteDefBuilder,
  NavigateFn,
  RouteDef,
  ClickEvent,
  Link
} from "./types";
import { createMatcher } from "./createMatcher";
import { buildPathDef } from "./buildPathDef";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";

export function buildRouteDef(
  routeName: string,
  builder: RouteDefBuilder<ParamDefCollection>,
  navigate: NavigateFn
): RouteDef {
  const pathDef = buildPathDef(
    { routeName },
    getParamDefsOfType("path", builder.params),
    builder.path
  );

  return {
    name: routeName,
    match: createMatcher({ params: builder.params, pathDef }),
    href,
    replace,
    push,
    link
  };

  function link(params: Record<string, unknown>): Link {
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

          navigate(createLocation(params, builder.params, pathDef));
        }
      }
    };
  }

  function href(params: Record<string, unknown>) {
    const location = createLocation(params, builder.params, pathDef);
    return location.path + (location.query ? `?${location.query}` : "");
  }

  function push(params: Record<string, unknown>) {
    return navigate(createLocation(params, builder.params, pathDef));
  }

  function replace(params: Record<string, unknown>) {
    return navigate(createLocation(params, builder.params, pathDef), true);
  }
}
