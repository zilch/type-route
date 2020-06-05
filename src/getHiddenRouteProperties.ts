import { UmbrellaRoute, HiddenRouteProperties } from "./types";

export function getHiddenRouteProperties(
  route: UmbrellaRoute
): HiddenRouteProperties {
  return Object.getPrototypeOf(route)["~internal"];
}
