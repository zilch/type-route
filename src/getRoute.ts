import { RouterLocation, UmbrellaRoute, Match, RouterContext } from "./types";
import { preventDefaultLinkClickBehavior } from "./preventDefaultAnchorClickBehavior";

export function getRoute(
  location: RouterLocation,
  { routes, queryStringSerializer, arraySeparator, navigate }: RouterContext
): { route: UmbrellaRoute; primaryPath: boolean } {
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

  const notFoundHref =
    location.path + (location.query ? `?${location.query}` : "");

  const notFoundRoute: UmbrellaRoute = {
    name: false,
    params: {},
    href: notFoundHref,
    link: {
      href: notFoundHref,
      onClick: (event) => {
        if (preventDefaultLinkClickBehavior(event)) {
          navigate(notFoundRoute, true, false);
        }
      },
    },
    push: () => navigate(notFoundRoute, true, false),
    replace: () => navigate(notFoundRoute, true, true),
  };

  return { route: notFoundRoute, primaryPath: true };
}
