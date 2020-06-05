import {
  UmbrellaRoute,
  RouterLocation,
  RouterContext,
  HiddenRouteProperties,
} from "./types";
import { mapObject } from "./mapObject";
import { preventDefaultLinkClickBehavior } from "./preventDefaultLinkClickBehavior";

export function buildRoute({
  routeName,
  params,
  location,
  routerContext,
}: {
  routeName: string | false;
  params: Record<string, unknown>;
  location: RouterLocation;
  routerContext: RouterContext;
}): UmbrellaRoute {
  const { navigate, history } = routerContext;

  const href = history.createHref({
    pathname: location.path,
    search: location.query,
  });

  const baseRoute: UmbrellaRoute = {
    name: routeName,
    params,
    href,
    link: {
      href,
      onClick: (event) => {
        if (preventDefaultLinkClickBehavior(event)) {
          return route.push();
        }
      },
    },
    action: null,
    push: () => navigate(route, true, false),
    replace: () => navigate(route, true, true),
  };

  const hiddenRouteProperties: HiddenRouteProperties = {
    location,
  };

  const route: UmbrellaRoute = Object.create(
    { "~internal": hiddenRouteProperties },
    mapObject(baseRoute, (value) => ({
      enumerable: true,
      writable: true,
      value,
    }))
  );

  return route;
}
