import {
  Router,
  RouterLocation,
  Action,
  RouterConfig,
  QueryStringSerializer,
  SharedRouterProperties,
  RouterSessionHistoryConfig,
  UmbrellaRouteDefInstance,
  UmbrellaRouter,
  UmbrellaNavigationHandler,
  UmbrellaRoute,
  Match,
  LocationState,
  UmbrellaRouterConfig,
  UmbrellaRouteDefBuilderCollection,
} from "./types";
import { buildRouteDef } from "./buildRouteDef";
import {
  createBrowserHistory,
  History,
  Location as HistoryLocation,
  createMemoryHistory,
} from "history";
import { createQueryStringSerializer } from "./createQueryStringSerializer";
import { assert } from "./assert";
import { TypeRouteError } from "./TypeRouteError";
import { areLocationsEqual } from "./areLocationsEqual";
import { getLocationFromUrl } from "./getLocationFromUrl";
import { buildAddons } from "./buildAddons";

export function createRouter<TRouteDefCollection>(
  routeDefs: TRouteDefCollection
): Router<TRouteDefCollection, {}>;
export function createRouter<TRouteDefCollection, TAddons = {}>(
  config: RouterConfig<TAddons>,
  routeDefs: TRouteDefCollection
): Router<TRouteDefCollection, TAddons>;
export function createRouter(...args: any[]): UmbrellaRouter {
  const config: UmbrellaRouterConfig = args.length === 1 ? {} : args[0];
  const routeDefs: UmbrellaRouteDefBuilderCollection =
    args.length === 1 ? args[0] : args[1];

  if (__DEV__) {
    assert("createRouter", [
      assert.numArgs([].slice.call(arguments), 1, 2),
      assert.type("object", "config", config),
      assert.collectionOfType("RouteDefBuilder", "routeDefs", routeDefs),
    ]);

    if (config.arrayFormat?.queryString && config.queryStringSerializer) {
      throw TypeRouteError.Query_string_array_format_and_custom_query_string_serializer_may_not_both_be_provided.create();
    }
  }

  const arraySeparator = config.arrayFormat?.separator ?? ",";

  let history: History<LocationState>;
  let routes: Record<string, UmbrellaRouteDefInstance> = {};

  for (const routeName of Object.keys(routeDefs)) {
    routes[routeName] = buildRouteDef(
      routeName,
      routeDefs[routeName],
      getSharedRouterProperties,
      config.addons ?? {}
    );
  }

  const navigationHandlers: {
    id: number;
    handler: UmbrellaNavigationHandler;
  }[] = [];
  let initialRoute: UmbrellaRoute;
  let prevRoute: UmbrellaRoute | undefined;
  let unblock: (() => void) | undefined = undefined;
  let addons: Record<string, (...args: any[]) => any>;
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

  function initializeRouter(config: UmbrellaRouterConfig) {
    const sessionConfig: RouterSessionHistoryConfig = config.session ?? {
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
    } else {
      history = createBrowserHistory({
        forceRefresh: sessionConfig.forceRefresh,
      });
    }

    addons = config.addons ?? {};
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
      history[replace ? "replace" : "push"](href, {
        stateParams: state,
      });
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
      const navigationHandlerResult = handler(nextRoute, prevRoute ?? null, {
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

    if (scrollToTop && (action === "push" || action === "pop")) {
      window?.scrollTo?.({ top: 0 });
    }

    prevRoute = nextRoute;
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
        return buildRoute(routeName, match.params);
      }

      if (
        nonExactMatch === false ||
        match.numExtraneousParams < nonExactMatch.numExtraneousParams
      ) {
        nonExactMatch = { ...match, routeName };
      }
    }

    if (nonExactMatch) {
      return buildRoute(nonExactMatch.routeName, nonExactMatch.params);
    }

    return buildRoute(false, {});
  }

  function getSharedRouterProperties(): SharedRouterProperties {
    return {
      navigate,
      queryStringSerializer,
      arraySeparator,
    };
  }

  function buildRoute(
    routeName: string | false,
    params: Record<string, unknown>
  ): UmbrellaRoute {
    return {
      name: routeName,
      params: params,
      href,
      link,
      push,
      replace,
      addons: buildAddons({
        routeName,
        href,
        link,
        push,
        replace,
        addons,
        getAddonArgsAndParams: (args) => {
          return { args, params };
        },
      }),
    };

    function href() {
      if (routeName === false) {
        return "";
      }
      return routes[routeName].href(params);
    }

    function link() {
      if (routeName === false) {
        return { href: "", onClick: () => {} };
      }
      return routes[routeName].link(params);
    }

    function push() {
      if (routeName === false) {
        return false;
      }
      return routes[routeName].push(params);
    }

    function replace() {
      if (routeName === false) {
        return false;
      }
      return routes[routeName].replace(params);
    }
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
