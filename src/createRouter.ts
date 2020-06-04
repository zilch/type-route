import {
  Router,
  RouterLocation,
  Action,
  RouterConfig,
  QueryStringSerializer,
  SharedRouterProperties,
  SessionConfig,
  UmbrellaRouteBuilder,
  UmbrellaRouter,
  UmbrellaNavigationHandler,
  UmbrellaRoute,
  Match,
  LocationState,
  UmbrellaRouteDefCollection,
} from "./types";
import { createRouteBuilder } from "./createRouteBuilder";
import {
  createBrowserHistory,
  History,
  Location as HistoryLocation,
  createMemoryHistory,
  createHashHistory,
} from "history";
import { createQueryStringSerializer } from "./createQueryStringSerializer";
import { assert } from "./assert";
import { TypeRouteError } from "./TypeRouteError";
import { areLocationsEqual } from "./areLocationsEqual";
import { getLocationFromUrl } from "./getLocationFromUrl";
import { preventDefaultLinkClickBehavior } from "./preventDefaultAnchorClickBehavior";

export function createRouter<
  TRouteDefCollection extends { [routeName: string]: any }
>(routeDefs: TRouteDefCollection): Router<TRouteDefCollection>;
export function createRouter<
  TRouteDefCollection extends { [routeName: string]: any }
>(
  config: RouterConfig,
  routeDefs: TRouteDefCollection
): Router<TRouteDefCollection>;
export function createRouter(...args: any[]): UmbrellaRouter {
  const routeDefs: UmbrellaRouteDefCollection =
    args.length === 1 ? args[0] : args[1];
  const config: RouterConfig = args.length === 1 ? {} : args[0];

  if (__DEV__) {
    assert("createRouter", [
      assert.numArgs([].slice.call(arguments), 1, 2),
      assert.collectionOfType("RouteDef", "routeDefs", routeDefs),
      assert.type("object", "config", config),
    ]);

    if (config.arrayFormat?.queryString && config.queryStringSerializer) {
      throw TypeRouteError.Query_string_array_format_and_custom_query_string_serializer_may_not_both_be_provided.create();
    }
  }

  const arraySeparator = config.arrayFormat?.separator ?? ",";

  let history: History<LocationState>;
  let routes: Record<string, UmbrellaRouteBuilder> = {};

  for (const routeName of Object.keys(routeDefs)) {
    routes[routeName] = createRouteBuilder(
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
  let previousRoute: UmbrellaRoute | undefined;
  let unblock: (() => void) | undefined = undefined;
  let navigationHandlerIdCounter = 0;
  let queryStringSerializer: QueryStringSerializer;
  let scrollToTop: boolean;
  let skipHandlingNextNavigation = false;

  initializeRouter(config);

  return {
    routes,
    listen,
    session: {
      push(url, state) {
        if (__DEV__) {
          assert("[RouterSessionHistory].push", [
            assert.numArgs([].slice.call(arguments), 1, 2),
            assert.type("string", "url", url),
            assert.type(["object", "undefined"], "state", state),
          ]);
        }

        return navigate(getLocationFromUrl(url, state));
      },
      replace(url, state) {
        if (__DEV__) {
          assert("[RouterSessionHistory].replace", [
            assert.numArgs([].slice.call(arguments), 1, 2),
            assert.type("string", "url", url),
            assert.type(["object", "undefined"], "state", state),
          ]);
        }

        return navigate(getLocationFromUrl(url, state), true);
      },
      back(amount = 1) {
        if (__DEV__) {
          assert("[RouterSessionHistory].back", [
            assert.numArgs([].slice.call(arguments), 0, 1),
            assert.type("number", "amount", amount),
          ]);
        }

        history.go(-amount);
      },
      forward(amount = 1) {
        if (__DEV__) {
          assert("[RouterSessionHistory].forward", [
            assert.numArgs([].slice.call(arguments), 0, 1),
            assert.type("number", "amount", amount),
          ]);
        }

        history.go(amount);
      },
      getInitialRoute() {
        if (__DEV__) {
          assert("[RouterSessionHistory].getInitialRoute", [
            assert.numArgs([].slice.call(arguments), 0),
          ]);
        }

        if (!initialRoute) {
          initialRoute = getRoute(
            getRouterLocationFromHistoryLocation(history.location)
          );
        }

        return initialRoute;
      },
      reset(session) {
        if (__DEV__) {
          assert("[RouterSessionHistory].reset", [
            assert.numArgs([].slice.call(arguments), 1),
            assert.type("object", "session", session),
          ]);
        }

        return initializeRouter({ session, queryStringSerializer });
      },
    },
  };

  function initializeRouter(config: RouterConfig) {
    const sessionConfig: SessionConfig = config.session ?? {
      type:
        typeof window !== "undefined" && typeof window.document !== "undefined"
          ? "browser"
          : "memory",
    };

    if (sessionConfig.type === "memory") {
      history = createMemoryHistory({
        initialEntries: sessionConfig.initialEntries,
        initialIndex: sessionConfig.initialIndex,
      });
    } else if (sessionConfig.type === "hash") {
      history = createHashHistory({
        hashType: sessionConfig.hash,
      });
    } else {
      history = createBrowserHistory({
        forceRefresh: sessionConfig.forceRefresh,
      });
    }

    scrollToTop = config.scrollToTop ?? true;

    queryStringSerializer =
      config.queryStringSerializer ??
      createQueryStringSerializer({
        queryStringArrayFormat: config.arrayFormat?.queryString,
        arraySeparator,
      });
  }

  function listen(handler: UmbrellaNavigationHandler) {
    const id = addNavigationHandler(handler);

    return removeListener;

    function removeListener() {
      removeNavigationHandler(id);
    }
  }

  function navigate(location: RouterLocation, replace?: boolean) {
    const proceed = handleNavigation(location, replace ? "replace" : "push");

    if (proceed) {
      const { query, path, state } = location;
      const href = query ? `${path}?${query}` : path;
      skipHandlingNextNavigation = true;
      history[replace ? "replace" : "push"](
        href,
        state === undefined
          ? undefined
          : {
              stateParams: state,
            }
      );
    }

    return proceed;
  }

  function addNavigationHandler(handler: UmbrellaNavigationHandler) {
    const id = navigationHandlerIdCounter++;

    navigationHandlers.push({
      id,
      handler,
    });

    if (navigationHandlers.length === 1) {
      unblock = history.block((historyLocation, historyAction) => {
        if (skipHandlingNextNavigation) {
          skipHandlingNextNavigation = false;
          return;
        }

        const location = getRouterLocationFromHistoryLocation(historyLocation);
        const action = historyAction.toLowerCase() as Action;

        const proceed = handleNavigation(location, action);

        if (!proceed) {
          return false;
        }
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

  function handleNavigation(location: RouterLocation, action: Action) {
    const nextRoute = getRoute(location);
    const currentLocation = getRouterLocationFromHistoryLocation(
      history.location
    );

    if (areLocationsEqual(location, currentLocation)) {
      return false;
    }

    for (const { handler } of navigationHandlers) {
      const navigationHandlerResult = handler({
        nextRoute,
        previousRoute: previousRoute ?? null,
        action,
      });

      if (__DEV__) {
        assert("NavigationHandler", [
          assert.type(
            ["boolean", "undefined"],
            "navigationHandlerResult",
            navigationHandlerResult
          ),
        ]);
      }

      if (navigationHandlerResult === false) {
        return false;
      }
    }

    if (
      action === "push" &&
      scrollToTop &&
      typeof window === "object" &&
      window !== null
    ) {
      setTimeout(() => {
        window.scrollTo?.(0, 0);
      });
    }

    previousRoute = nextRoute;
    return true;
  }

  function getRoute(location: RouterLocation): UmbrellaRoute {
    let nonExactMatch: (Match & { routeName: string }) | false = false;

    for (const routeName in routes) {
      const match = routes[routeName]["~internal"].match({
        routerLocation: location,
        queryStringSerializer,
        arraySeparator,
      });

      if (match === false) {
        continue;
      }

      if (match.numExtraneousParams === 0) {
        return routes[routeName](match.params);
      }

      if (
        nonExactMatch === false ||
        match.numExtraneousParams < nonExactMatch.numExtraneousParams
      ) {
        nonExactMatch = { ...match, routeName };
      }
    }

    if (nonExactMatch) {
      return routes[nonExactMatch.routeName](nonExactMatch.params);
    }

    const notFoundHref =
      location.path + (location.query ? `?${location.query}` : "");

    const notFoundRoute: UmbrellaRoute = {
      name: false,
      params: {},
      href: notFoundHref,
      link: {
        href: notFoundHref,
        onClick: (event) => {
          if (preventDefaultLinkClickBehavior(event)) {
            navigate(location);
          }
        },
      },
      push: () => navigate(location),
      replace: () => navigate(location, true),
    };

    return notFoundRoute;
  }

  function getSharedRouterProperties(): SharedRouterProperties {
    return {
      navigate,
      queryStringSerializer,
      arraySeparator,
      history,
    };
  }
}

function getRouterLocationFromHistoryLocation(
  historyLocation: HistoryLocation<LocationState>
): RouterLocation {
  return {
    path: historyLocation.pathname,
    query: historyLocation.search ? historyLocation.search.slice(1) : undefined,
    state: historyLocation.state?.stateParams || undefined,
  };
}
