import {
  RouteDefGroup,
  UmbrellaRoute,
  UmbrellaRouteDefInstance,
} from "./types";
import { assert } from "./assert";

export function createGroup<T extends any[]>(groupItems: T): RouteDefGroup<T> {
  if (__DEV__) {
    assert("createGroup", [
      assert.numArgs([].slice.call(arguments), 1),
      assert.arrayOfType(
        ["RouteDefGroup", "RouteDef"],
        "groupItems",
        groupItems
      ),
    ]);
  }

  const routeNames: Record<string, true> = {};

  groupItems.forEach((item) => {
    if (isRouteDefGroup(item)) {
      item.routeNames.forEach((name) => {
        routeNames[name] = true;
      });
    } else {
      routeNames[item.name] = true;
    }
  });

  return {
    "~internal": {
      type: "RouteDefGroup",
      Route: null as any,
    },
    routeNames: Object.keys(routeNames),
    has(route: UmbrellaRoute): route is UmbrellaRoute {
      if (__DEV__) {
        assert("[RouteDefGroup].has", [
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

function isRouteDefGroup(
  value: RouteDefGroup | UmbrellaRouteDefInstance
): value is RouteDefGroup {
  return !!(value as RouteDefGroup).routeNames;
}
