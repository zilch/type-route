import { RouterContext } from "./types";
import { convertToRouterLocationFromHistoryLocation } from "./convertToRouterLocationFromHistoryLocation";
import { getMatchingRoute } from "./getMatchingRoute";
import { stringUtils } from "./stringUtils";

const { splitFirst } = stringUtils;

export function getRouteByHref(
  href: string,
  state: any,
  routerContext: RouterContext
) {
  const [pathname, search] = splitFirst(href, "?");

  const location = convertToRouterLocationFromHistoryLocation(
    {
      pathname,
      search,
      state,
    },
    routerContext.baseUrl
  );

  return getMatchingRoute(location, routerContext);
}
