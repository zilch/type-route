import { UmbrellaRoute, RouterLocation, RouterContext } from "./types";
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
    search: location.query ? "?" + location.query : undefined,
  });

  const route: UmbrellaRoute = {
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
    push: () => navigate({ ...route, action: "push" }, true),
    replace: () => navigate({ ...route, action: "replace" }, true),
  };

  return route;
}
