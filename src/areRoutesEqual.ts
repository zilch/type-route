import { UmbrellaRoute } from "./types";
import { getHiddenRouteProperties } from "./getHiddenRouteProperties";

export function areRoutesEqual(routeA: UmbrellaRoute, routeB: UmbrellaRoute) {
  if (routeA.href !== routeB.href) {
    return false;
  }

  const routeAState = getHiddenRouteProperties(routeA).location.state;
  const routeBState = getHiddenRouteProperties(routeB).location.state;

  if (routeAState === undefined || routeBState === undefined) {
    return routeAState === routeBState;
  }

  const routeAKeys = Object.keys(routeAState ?? {});
  const routeBKeys = Object.keys(routeBState ?? {});

  if (routeAKeys.length !== routeBKeys.length) {
    return false;
  }

  for (const key of routeAKeys) {
    if (!routeBKeys.includes(key) || routeAState[key] !== routeBState[key]) {
      return false;
    }
  }

  return true;
}
