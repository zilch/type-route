import {
  Router,
  Location,
  Action,
  RouterOptions,
  QueryStringSerializer,
  SharedRouterProperties,
  RouterSessionHistoryOptions,
  UmbrellaRouteDef,
  UmbrellaRouter,
  UmbrellaRouteDefBuilder,
  UmbrellaNavigationHandler,
  UmbrellaRoute,
  Match,
  LocationState,
} from "./types";
import { buildRouteDef } from "./buildRouteDef";
import {
  createBrowserHistory,
  History,
  Location as HistoryLocation,
  createMemoryHistory,
} from "history";
import { defaultQueryStringSerializer } from "./defaultQueryStringSerializer";
import { assert } from "./assert";

export function createRouter<TRouteDefBuilders>(
  routeDefBuilders: TRouteDefBuilders,
  options?: RouterOptions
): Router<TRouteDefBuilders>;
export function createRouter(
  routeDefBuilders: Record<string, UmbrellaRouteDefBuilder>,
  options: RouterOptions = {}
): UmbrellaRouter {
  assert("createRouter", [
    assert.numArgs([].slice.call(arguments), 1, 2),
    assert.collectionOfType(
      "RouteDefBuilder",
      "routeDefBuilders",
      routeDefBuilders
    ),
    assert.type(["undefined", "object"], "options", options),
  ]);

  let history: History<LocationState>;
  let routes: Record<string, UmbrellaRouteDef> = {};

  for (const routeName of Object.keys(routeDefBuilders)) {
    routes[routeName] = buildRouteDef(
      routeName,
      routeDefBuilders[routeName],
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
  let nextNavigationResolverId: string | undefined;
  let navigationResolverIdCounter = 0;
  let navigationResolverIdBase = Date.now().toString();
  let navigationResolvers: {
    [id: string]: ((result: boolean) => void) | undefined;
  } = {};
  let queryStringSerializer: QueryStringSerializer;
  let pendingNavigationHandler: Promise<boolean> | null = null;

  initializeRouter(options);

  return {
    routes,
    listen,
    session: {
      push(url, state) {
        assert("[RouterSessionHistory].push", [
          assert.numArgs([].slice.call(arguments), 1, 2),
          assert.type("string", "url", url),
          assert.type(["object", "undefined"], "state", state),
        ]);

        return navigate(getLocationFromUrl(url, state));
      },
      replace(url, state) {
        assert("[RouterSessionHistory].replace", [
          assert.numArgs([].slice.call(arguments), 1, 2),
          assert.type("string", "url", url),
          assert.type(["object", "undefined"], "state", state),
        ]);

        return navigate(getLocationFromUrl(url, state), true);
      },
      back(amount = 1) {
        assert("[RouterSessionHistory].back", [
          assert.numArgs([].slice.call(arguments), 0, 1),
          assert.type("number", "amount", amount),
        ]);

        history.go(-amount);
      },
      forward(amount = 1) {
        assert("[RouterSessionHistory].forward", [
          assert.numArgs([].slice.call(arguments), 0, 1),
          assert.type("number", "amount", amount),
        ]);

        history.go(amount);
      },
      getInitialRoute() {
        assert("[RouterSessionHistory].getInitialRoute", [
          assert.numArgs([].slice.call(arguments), 0),
        ]);

        return initialRoute;
      },
      reset(session) {
        assert("[RouterSessionHistory].reset", [
          assert.numArgs([].slice.call(arguments), 1),
          assert.type("object", "session", session),
        ]);

        return initializeRouter({ session, queryStringSerializer });
      },
    },
  };

  function initializeRouter(options: RouterOptions) {
    const sessionOptions: RouterSessionHistoryOptions = options.session ?? {
      type:
        typeof window !== "undefined" && typeof window.document !== "undefined"
          ? "browser"
          : "memory",
    };

    if (sessionOptions.type === "memory") {
      history = createMemoryHistory({
        getUserConfirmation,
        initialEntries: sessionOptions.initialEntries,
        initialIndex: sessionOptions.initialIndex,
      });
    } else {
      history = createBrowserHistory({
        getUserConfirmation,
        forceRefresh: sessionOptions.forceRefresh,
      });
    }

    queryStringSerializer =
      options.queryStringSerializer ?? defaultQueryStringSerializer;
    initialRoute = getRoute(
      getLocationFromHistoryLocation(history.location),
      "initial"
    );
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
    // Necessary b/c the type declaration generation step of the build has
    // has issues with Promise for some reason
    // @ts-ignore
    return new Promise<boolean>((resolve) => {
      const navigationResolverId = getNextNavigationResolverId();
      navigationResolvers[navigationResolverId] = resolve;

      const href = query ? `${path}?${query}` : path;
      history[replace ? "replace" : "push"](href, {
        navigationResolverId,
        stateParams: state,
      });
    });
  }

  function addNavigationHandler(handler: UmbrellaNavigationHandler) {
    const id = navigationHandlerIdCounter++;

    navigationHandlers.push({
      id,
      handler,
    });

    if (navigationHandlers.length === 1) {
      unblock = history.block((historyLocation, historyAction) => {
        nextLocation = getLocationFromHistoryLocation(historyLocation);
        nextNavigationResolverId = historyLocation.state?.navigationResolverId;
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

    if (navigationHandlers.length === 0) {
      unblock?.();
    }
  }

  async function handleNavigation(location: Location, action: Action) {
    const nextRoute = getRoute(location, action);

    const currentLocation = getLocationFromHistoryLocation(history.location);

    if (locationsEqual(location, currentLocation)) {
      return false;
    }

    for (const { handler } of navigationHandlers) {
      const navigationHandlerResult = await handler(nextRoute);

      assert("NavigationHandler", [
        assert.type(
          ["boolean", "undefined"],
          "navigationHandlerResult",
          navigationHandlerResult
        ),
      ]);

      if (navigationHandlerResult === false) {
        return false;
      }
    }

    return true;
  }

  async function getUserConfirmation(
    _: string,
    callback: (proceed: boolean) => void
  ) {
    const navigationResolverId = nextNavigationResolverId;
    const location = nextLocation;
    const action = nextAction;
    while (pendingNavigationHandler) {
      await pendingNavigationHandler;
    }
    pendingNavigationHandler = handleNavigation(location, action);
    const result = await pendingNavigationHandler;
    pendingNavigationHandler = null;

    if (navigationResolverId) {
      navigationResolvers[navigationResolverId]?.(result);
      delete navigationResolvers[navigationResolverId];
    }

    callback(result);
  }

  function getRoute(location: Location, action: Action): UmbrellaRoute {
    let nonExactMatch: (Match & { routeName: string }) | false = false;

    for (const routeName in routes) {
      const match = routes[routeName]["~internal"].match(
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
          params: match.params,
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
        action,
      };
    }

    return {
      name: false,
      action,
      params: {},
    };
  }

  function getLocationFromUrl(url: string, state?: any): Location {
    const [path, ...rest] = url.split("?");
    const query = rest.length === 0 ? undefined : rest.join("?");
    return { path, query, state };
  }

  function getLocationFromHistoryLocation(
    historyLocation: HistoryLocation<LocationState>
  ): Location {
    return {
      path: historyLocation.pathname,
      query: historyLocation.search
        ? historyLocation.search.slice(1)
        : undefined,
      state: historyLocation.state?.stateParams || undefined,
    };
  }

  function getSharedRouterProperties(): SharedRouterProperties {
    return { navigate, queryStringSerializer };
  }

  function locationsEqual(locationA: Location, locationB: Location) {
    if (
      locationA.path !== locationB.path ||
      locationA.query !== locationB.query
    ) {
      return false;
    }

    if (locationA.state === undefined || locationB.state === undefined) {
      return locationA.state === locationB.state;
    }

    const locationAKeys = Object.keys(locationA.state ?? {});
    const locationBKeys = Object.keys(locationB.state ?? {});

    if (locationAKeys.length !== locationBKeys.length) {
      return false;
    }

    for (const key of locationAKeys) {
      if (
        !locationBKeys.includes(key) ||
        locationA.state[key] !== locationB.state[key]
      ) {
        return false;
      }
    }

    return true;
  }
}
