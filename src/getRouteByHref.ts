import { RouterContext } from "./types";
import { splitFirst } from "./splitFirst";
import { getRouterLocation } from "./getRouterLocation";
import { getRoute } from "./getRoute";

export function getRouteByHref(
  href: string,
  state: any,
  routerContext: RouterContext
) {
  const [pathname, search] = splitFirst(href, "?");

  const location = getRouterLocation({
    pathname,
    search,
    state,
    hash: splitFirst(href, "#")[1],
  });

  return getRoute(location, routerContext);
}
