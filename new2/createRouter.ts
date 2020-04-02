import {
  Router,
  RouteDef,
  Location,
  NavigationHandler,
  Route,
  Action,
  RouterOptions,
  QueryStringSerializer,
  SharedRouterProperties,
  HistoryOptions
} from "./types";
import { buildRouteDef } from "./buildRouteDef";
import {
  createBrowserHistory,
  History,
  Location as HistoryLocation,
  createMemoryHistory
} from "history";
import { defaultQueryStringSerializer } from "./defaultQueryStringSerializer";

const stateParamsKey = "stateParams";

export function createRouter<TRouteDefs>(
  routeDefs: TRouteDefs,
  options: RouterOptions = {}
): Router<TRouteDefs> {
  let history: History;
  let routes: Record<string, RouteDef> = {};

  for (const routeName of Object.keys(routeDefs)) {
    routes[routeName] = buildRouteDef(
      routeName,
      routeDefs[routeName],
      getSharedRouterProperties
    );
  }

  const navigationHandlers: {
    id: number;
    handler: NavigationHandler;
  }[] = [];
  let initialRoute: Route;
  let navigationHandlerIdCounter = 0;
  let unblock: (() => void) | undefined = undefined;
  let nextLocation: Location;
  let nextAction: Action;
  let navigationResolverIdCounter = 0;
  let navigationResolverIdBase = Date.now().toString();
  let navigationResolvers: {
    [id: string]: ((result: boolean) => void) | undefined;
  } = {};
  let queryStringSerializer: QueryStringSerializer;

  initializeRouter(options);

  return {
    routes,
    listen,
    history: {
      push: (url, state) => navigate(getLocation(url, state)),
      replace: (url, state) => navigate(getLocation(url, state), true),
      back: (amount = 1) => {
        history.go(-amount);
      },
      forward: (amount = 1) => {
        history.go(amount);
      },
      getInitialRoute: () => initialRoute,
      reset: history => initializeRouter({ history, queryStringSerializer })
    }
  };

  function initializeRouter(options: RouterOptions) {
    const historyOptions: HistoryOptions = options.history ?? {
      type:
        typeof window !== "undefined" && typeof window.document !== "undefined"
          ? "browser"
          : "memory"
    };

    if (historyOptions.type === "memory") {
      history = createMemoryHistory({
        getUserConfirmation,
        initialEntries: historyOptions.initialEntries,
        initialIndex: historyOptions.initialIndex
      });
    } else {
      history = createBrowserHistory({
        getUserConfirmation,
        forceRefresh: historyOptions.forceRefresh
      });
    }

    queryStringSerializer =
      options.queryStringSerializer ?? defaultQueryStringSerializer;
    initialRoute = getRoute(getTypeRouteLocation(history.location), "initial");
  }

  function listen(handler: NavigationHandler) {
    const id = addNavigationHandler(handler);

    return removeListener;

    function removeListener() {
      removeNavigationHandler(id);
    }
  }

  function getNextNavigationResolverId() {
    navigationResolverIdCounter++;
    return `${navigationResolverIdBase}-${navigationResolverIdCounter}`;
  }

  function navigate({ path, query, state }: Location, replace?: boolean) {
    return new Promise<boolean>(resolve => {
      const navigationResolverId = getNextNavigationResolverId();
      navigationResolvers[navigationResolverId] = resolve;

      const href = query ? `${path}?${query}` : path;
      history[replace ? "replace" : "push"](href, {
        navigationResolverId,
        [stateParamsKey]: state
      });
    });
  }

  function addNavigationHandler(handler: NavigationHandler) {
    const id = navigationHandlerIdCounter++;

    navigationHandlers.push({
      id,
      handler
    });

    if (navigationHandlers.length === 1) {
      unblock = history.block((historyLocation, historyAction) => {
        nextLocation = getTypeRouteLocation(historyLocation);
        nextAction = historyAction.toLowerCase() as Action;
        return "";
      });
    }

    return id;
  }

  function removeNavigationHandler(idToRemove: number) {
    const indexToRemove = navigationHandlers.findIndex(
      ({ id }) => id === idToRemove
    );
    navigationHandlers.splice(indexToRemove, 1);

    if (unblock === undefined) {
      throw new Error(`\n\nUnexpected error: "unblock" should be defined\n`);
    }

    if (navigationHandlers.length === 0) {
      unblock();
    }
  }

  async function handleNavigation(location: Location, action: Action) {
    const nextRoute = getRoute(location, action);

    for (const { handler } of navigationHandlers) {
      const proceed = await handler(nextRoute);

      if (proceed === false) {
        return false;
      }
    }

    return true;
  }

  async function getUserConfirmation(
    _: string,
    callback: (proceed: boolean) => void
  ) {
    const navigationResolverId = nextLocation.state?.navigationResolverId;
    const result = await handleNavigation(nextLocation, nextAction);

    const resolve = navigationResolvers[navigationResolverId!];
    if (resolve) {
      resolve(result);
      delete navigationResolvers[navigationResolverId!];
    }

    callback(result);
  }

  function getRoute(location: Location, action: Action): Route {
    for (const routeName in routes) {
      const route = routes[routeName];
      const params = route.match(location, queryStringSerializer);

      if (params) {
        return {
          name: routeName,
          action,
          params
        };
      }
    }

    return {
      name: false,
      action,
      params: {}
    };
  }

  function getLocation(url: string, state?: any): Location {
    const [path, ...rest] = url.split("?");
    const query = rest.length === 0 ? undefined : rest.join("?");
    return { path, query, state };
  }

  function getTypeRouteLocation(historyLocation: HistoryLocation): Location {
    return {
      path: historyLocation.pathname,
      query: historyLocation.search || undefined,
      state: historyLocation.state?.[stateParamsKey] || undefined
    };
  }

  function getSharedRouterProperties(): SharedRouterProperties {
    return { navigate, queryStringSerializer };
  }
}
