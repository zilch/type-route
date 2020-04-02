import { RouteDefGroup, UmbrellaRoute, UmbrellaRouteDef } from "./types";

export function createGroup<T extends any[]>(groupItems: T): RouteDefGroup<T> {
  const routeNames: Record<string, true> = {};

  groupItems.forEach(item => {
    if (isRouteDefGroup(item)) {
      item.routeNames.forEach(name => {
        routeNames[name] = true;
      });
    } else {
      routeNames[item.name] = true;
    }
  });

  return {
    _internal: {
      Route: null as any
    },
    routeNames: Object.keys(routeNames),
    has(route: UmbrellaRoute): route is UmbrellaRoute {
      if (route.name === false) {
        return false;
      }

      return !!routeNames[route.name];
    }
  };
}

function isRouteDefGroup(
  value: RouteDefGroup | UmbrellaRouteDef
): value is RouteDefGroup {
  return !!(value as RouteDefGroup).routeNames;
}
