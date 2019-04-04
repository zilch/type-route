import { RouteDefinitionCollection, Route, Action } from "./types";
import { Location } from "history";

export function getRoute<T extends RouteDefinitionCollection>(
  routes: T,
  location: Location,
  action: Action
): Route<T> {
  const routeNames = Object.keys(routes);

  for (const name of routeNames) {
    const match = routes[name].match({
      pathName: location.pathname,
      queryString: location.search
    });

    if (match === null) {
      continue;
    }

    return {
      name,
      params: match,
      action
    } as any;
  }

  return {
    name: null,
    params: {},
    action
  };
}
