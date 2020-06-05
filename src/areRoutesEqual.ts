import { UmbrellaRoute, RouterContext } from "./types";
import { createLocation } from "./createLocation";

export function areRoutesEqual(
  routeA: UmbrellaRoute,
  routeB: UmbrellaRoute,
  routerContext: RouterContext
) {
  if (routeA.href !== routeB.href) {
    return false;
  }

  const routeAState = getState(routeA);
  const routeBState = getState(routeB);

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

  function getState(route: UmbrellaRoute) {
    return route.name === false
      ? undefined
      : createLocation({
          routeName: route.name,
          paramCollection: route.params,
          routerContext,
        }).state;
  }
}
