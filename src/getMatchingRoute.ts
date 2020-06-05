import { RouterLocation, UmbrellaRoute, Match, RouterContext } from "./types";
import { buildRoute } from "./buildRoute";

export function getMatchingRoute(
  location: RouterLocation,
  routerContext: RouterContext
): { route: UmbrellaRoute; primaryPath: boolean } {
  const { routes, queryStringSerializer, arraySeparator } = routerContext;

  let nonExactMatch: (Match & { routeName: string }) | false = false;

  for (const routeName in routes) {
    const match = routes[routeName]["~internal"].match({
      routerLocation: location,
      queryStringSerializer,
      arraySeparator,
    });

    if (match === false) {
      continue;
    }

    if (match.numExtraneousParams === 0) {
      return {
        route: routes[routeName](match.params),
        primaryPath: match.primaryPath,
      };
    }

    if (
      nonExactMatch === false ||
      match.numExtraneousParams < nonExactMatch.numExtraneousParams
    ) {
      nonExactMatch = { ...match, routeName };
    }
  }

  if (nonExactMatch) {
    return {
      route: routes[nonExactMatch.routeName](nonExactMatch.params),
      primaryPath: nonExactMatch.primaryPath,
    };
  }

  return {
    route: buildRoute({
      routeName: false,
      params: {},
      location,
      routerContext,
    }),
    primaryPath: true,
  };
}
