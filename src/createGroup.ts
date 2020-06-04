import {
  RouteBuilderGroup,
  UmbrellaRoute,
  UmbrellaRouteBuilder,
} from "./types";
import { assert } from "./assert";

export function createGroup<T extends any[]>(
  groupItems: T
): RouteBuilderGroup<T> {
  if (__DEV__) {
    assert("createGroup", [
      assert.numArgs([].slice.call(arguments), 1),
      assert.arrayOfType(
        ["RouteBuilderGroup", "RouteBuilder"],
        "groupItems",
        groupItems
      ),
    ]);
  }

  const routeNames: Record<string, true> = {};

  groupItems.forEach((item) => {
    if (isRouteBuilderGroup(item)) {
      item.routeNames.forEach((name) => {
        routeNames[name] = true;
      });
    } else {
      routeNames[item.name] = true;
    }
  });

  return {
    "~internal": {
      type: "RouteBuilderGroup",
      Route: null as any,
    },
    routeNames: Object.keys(routeNames),
    has(route: UmbrellaRoute): route is UmbrellaRoute {
      if (__DEV__) {
        assert("[RouteBuilderGroup].has", [
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

function isRouteBuilderGroup(
  value: RouteBuilderGroup | UmbrellaRouteBuilder
): value is RouteBuilderGroup {
  return !!(value as RouteBuilderGroup).routeNames;
}
