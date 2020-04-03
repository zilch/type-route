import {
  Router,
  Location,
  Action,
  RouterOptions,
  QueryStringSerializer,
  SharedRouterProperties,
  HistoryOptions,
  UmbrellaRouteDef,
  UmbrellaRouter,
  UmbrellaRouteDefBuilder,
  UmbrellaNavigationHandler,
  UmbrellaRoute,
  Match,
  LocationState
} from "./types";
import { buildRouteDef } from "./buildRouteDef";
import {
  createBrowserHistory,
  History,
  Location as HistoryLocation,
  createMemoryHistory
} from "history";
import { defaultQueryStringSerializer } from "./defaultQueryStringSerializer";

export function createRouter<TRouteDefs>(
  routeDefs: TRouteDefs,
  options?: RouterOptions
): Router<TRouteDefs>;
export function createRouter(
  routeDefs: Record<string, UmbrellaRouteDefBuilder>,
  options: RouterOptions = {}
): UmbrellaRouter {
  let history: History<LocationState>;
  let routes: Record<string, UmbrellaRouteDef> = {};

  for (const routeName of Object.keys(routeDefs)) {
    routes[routeName] = buildRouteDef(
      routeName,
      routeDefs[routeName],
      getSharedRouterProperties
    );
  }

  const navigationHandlers: {
    id: number;
    handler: UmbrellaNavigationHandler;
  }[] = [];
  let initialRoute: UmbrellaRoute;
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

  function listen(handler: UmbrellaNavigationHandler) {
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
        stateParams: state
      });
    });
  }

  function addNavigationHandler(handler: UmbrellaNavigationHandler) {
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
    const indexToRemove = navigationHandlers
      .map(({ id }) => id)
      .indexOf(idToRemove);
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

  function getRoute(location: Location, action: Action): UmbrellaRoute {
    let nonExactMatch: (Match & { routeName: string }) | false = false;

    for (const routeName in routes) {
      const match = routes[routeName]._internal.match(
        location,
        queryStringSerializer
      );

      if (match === false) {
        continue;
      }

      if (match.numExtraneousParams === 0) {
        return {
          name: routeName,
          action,
          params: match.params
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
        name: nonExactMatch.routeName,
        params: nonExactMatch.params,
        action
      };
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

  function getTypeRouteLocation(
    historyLocation: HistoryLocation<LocationState>
  ): Location {
    return {
      path: historyLocation.pathname,
      query: historyLocation.search
        ? historyLocation.search.slice(1)
        : undefined,
      state: historyLocation.state?.stateParams || undefined
    };
  }

  function getSharedRouterProperties(): SharedRouterProperties {
    return { navigate, queryStringSerializer };
  }
}
