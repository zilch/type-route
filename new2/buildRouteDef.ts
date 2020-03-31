import { ParamDefCollection, Location, RouteDefBuilder } from "./types";
import { createMatcher } from "./createMatcher";
import { buildPathDef } from "./buildPathDef";
import { getParamDefsOfType } from "./getParamDefsOfType";
import { createLocation } from "./createLocation";

type NavigateFn = (location: Location, replace?: boolean) => Promise<boolean>;

export type OnClickHandler = (event?: any) => void;

export type Link = {
  href: string;
  onClick: OnClickHandler;
};

type RouteDef = {
  name: string;
  href(params?: Record<string, unknown>): string;
  push(params?: Record<string, unknown>): Promise<boolean>;
  replace(params?: Record<string, unknown>): Promise<boolean>;
  link(params?: Record<string, unknown>): Link;
  match(location: Location): Record<string, unknown> | false;
};

export type ClickEvent = {
  preventDefault?: () => void;
  button?: number | null;
  defaultPrevented?: boolean | null;
  metaKey?: boolean | null;
  altKey?: boolean | null;
  ctrlKey?: boolean | null;
  shiftKey?: boolean | null;
  target?: { target?: string | null } | null;
};

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
  const match = createMatcher({ params: builder.params, pathDef });

  return {
    name: routeName,
    match,
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

          navigate(createRouteLocation(params));
        }
      }
    };
  }

  function href(params: Record<string, unknown>) {
    const location = createRouteLocation(params);

    let href = location.path;
    if (location.query) {
      href += `?${location.query}`;
    }

    return href;
  }

  function push(params: Record<string, unknown>) {
    return navigate(createRouteLocation(params));
  }

  function replace(params: Record<string, unknown>) {
    return navigate(createRouteLocation(params), true);
  }

  function createRouteLocation(params: Record<string, unknown>): Location {
    return createLocation(params, builder.params, pathDef);
  }
}
