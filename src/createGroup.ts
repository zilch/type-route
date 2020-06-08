import { RouteGroup, UmbrellaRoute, UmbrellaRouteBuilder } from "./types";
import { assert } from "./assert";

export function createGroup<T extends any[]>(groupItems: T): RouteGroup<T> {
  if (__DEV__) {
    assert("createGroup", [
      assert.numArgs([].slice.call(arguments), 1),
      assert.arrayOfType(
        ["RouteGroup", "RouteBuilder"],
        "groupItems",
        groupItems
      ),
    ]);
  }

  const routeNames: Record<string, true> = {};

  groupItems.forEach((item) => {
    if (isRouteGroup(item)) {
      item.routeNames.forEach((name) => {
        routeNames[name] = true;
      });
    } else {
      routeNames[item.name] = true;
    }
  });

  return {
    "~internal": {
      type: "RouteGroup",
      Route: null as any,
    },
    routeNames: Object.keys(routeNames),
    has(route: UmbrellaRoute): route is UmbrellaRoute {
      if (__DEV__) {
        assert("[RouteGroup].has", [
          assert.numArgs([].slice.call(arguments), 1),
          assert.type("Route", "groupItems", groupItems),
        ]);
      }

      if (route.name === false) {
        return false;
      }

      return !!routeNames[route.name];
    },
  };
}

function isRouteGroup(
  value: RouteGroup | UmbrellaRouteBuilder
): value is RouteGroup {
  return !!(value as RouteGroup).routeNames;
}
