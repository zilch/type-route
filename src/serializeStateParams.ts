import { UmbrellaRoute, UmbrellaRouteDefCollection } from "./types";

export function serializeStateParams(
  route: UmbrellaRoute,
  routeDefs: UmbrellaRouteDefCollection
) {
  const state: Record<string, string> = {};

  if (route.name) {
    const sortedParams = Object.keys(route.params).sort();
    for (const paramName of sortedParams) {
      const paramDef =
        routeDefs[route.name]["~internal"].params[paramName]["~internal"];

      if (paramDef.kind === "state") {
        const value = route.params[paramName];
        state[paramName] = paramDef.valueSerializer.stringify(value);
      }
    }
  }

  return state;
}
