import {
  RouteDefBuilder,
  ParamDefCollection,
  Router,
  RouteDef,
  Location,
  RouterHistory,
  NavigationHandler,
  Route
} from "./types";
import { buildRouteDef } from "./buildRouteDef";
import { createBrowserHistory } from "history";

export function createRouter(
  routeDefinitions: Record<string, RouteDefBuilder<ParamDefCollection>>
): Router {
  const routes: Record<string, RouteDef> = {};

  for (const routeName in routeDefinitions) {
    routes[routeName] = buildRouteDef(
      routeName,
      routeDefinitions[routeName],
      navigate
    );
  }

  let history = createBrowserHistory();
  let initialRoute = getRoute(history.location);

  return { routes, listen, history: getRouterHistory() };

  function listen(handler: NavigationHandler) {
    return () => {
      // TODO remove it
    };
  }

  function navigate(location: Location, replace = false): Promise<boolean> {
    history[replace ? "replace" : "push"]({
      pathname: location.path,
      search: location.query,
      state: location.state
    });
  }

  function getRouterHistory(): RouterHistory {
    return {
      reset() {
        history = createBrowserHistory();
        initialRoute = getRoute(history.location);
      },
      push(url, state) {
        const [path, query] = url.split("?");
        return navigate({ path, query, state });
      },
      replace(url, state) {
        const [path, query] = url.split("?");
        return navigate({ path, query, state }, true);
      },
      back(amount = -1) {
        history.go(amount);
      },
      forward(amount = 1) {
        history.go(amount);
      },
      getInitialRoute: () => initialRoute
    };
  }

  function getRoute(location: Location): Route {
    for (const routeName in routes) {
      const routeDefinition = routes[routeName];
      const params = routeDefinition.match(location);
      if (params === false) {
        continue;
      }

      return {
        action: "initial",
        name: routeName,
        params
      };
    }

    return {
      action: "initial",
      name: false,
      params: {}
    };
  }
}
