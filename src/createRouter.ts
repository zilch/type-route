import {
  Router,
  RouterLocation,
  Action,
  RouterOptions,
  QueryStringSerializer,
  SharedRouterProperties,
  RouterSessionHistoryOptions,
  UmbrellaRouteDefInstance,
  UmbrellaRouter,
  UmbrellaNavigationHandler,
  UmbrellaRoute,
  Match,
  LocationState,
  UmbrellaRouterOptions,
  AddonContext,
} from "./types";
import { buildRouteDefInstance } from "./buildRouteDefInstance";
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
import { mapObject } from "./mapObject";

export function createRouter<TRouteDefCollection, TAddons = {}>(
  options: RouterOptions<TRouteDefCollection, TAddons>
): Router<TRouteDefCollection, TAddons>;
export function createRouter(options: UmbrellaRouterOptions): UmbrellaRouter {
  assert("createRouter", [
    assert.numArgs([].slice.call(arguments), 1),
    assert.type("object", "options", options),
    assert.collectionOfType("RouteDef", "options.routeDefs", options.routeDefs),
  ]);

  if (options.arrayFormat?.queryString && options.queryStringSerializer) {
    throw TypeRouteError.Query_string_array_format_and_custom_query_string_serializer_may_not_both_be_provided.create();
  }

  const arraySeparator = options.arrayFormat?.separator ?? ",";

  let history: History<LocationState>;
  let routes: Record<string, UmbrellaRouteDefInstance> = {};

  for (const routeName of Object.keys(options.routeDefs)) {
    routes[routeName] = buildRouteDefInstance(
      routeName,
      options.routeDefs[routeName],
      getSharedRouterProperties,
      options.addons ?? {}
    );
  }

  const navigationHandlers: {
    id: number;
    handler: UmbrellaNavigationHandler;
  }[] = [];
  let initialRoute: UmbrellaRoute;
  let prevRoute: UmbrellaRoute | undefined;
  let unblock: (() => void) | undefined = undefined;
  let nextLocation: RouterLocation;
  let nextAction: Action;
  let addons: Record<string, (...args: any[]) => any>;
  let navigationHandlerIdCounter = 0;
  let queryStringSerializer: QueryStringSerializer;
  let scrollToTop: boolean;
  let skipHandlingNextNavigation = false;

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

        if (!initialRoute) {
          initialRoute = getRoute(
            getRouterLocationFromHistoryLocation(history.location),
            "initial"
          );
        }

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

  function initializeRouter(options: Omit<UmbrellaRouterOptions, "routeDefs">) {
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

    addons = options.addons ?? {};
    scrollToTop = options.scrollToTop ?? true;

    queryStringSerializer =
      options.queryStringSerializer ??
      createQueryStringSerializer({
        queryStringArrayFormat: options.arrayFormat?.queryString,
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
        nextLocation = getRouterLocationFromHistoryLocation(historyLocation);
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

  function handleNavigation(location: RouterLocation, action: Action) {
    if (skipHandlingNextNavigation) {
      skipHandlingNextNavigation = false;
      return true;
    }

    const nextRoute = getRoute(location, action);
    const currentLocation = getRouterLocationFromHistoryLocation(
      history.location
    );

    if (areLocationsEqual(location, currentLocation)) {
      return false;
    }

    for (const { handler } of navigationHandlers) {
      const navigationHandlerResult = handler(nextRoute, prevRoute);

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

    if (scrollToTop && (action === "push" || action === "pop")) {
      window?.scrollTo?.({ top: 0 });
    }

    prevRoute = nextRoute;
    return true;
  }

  function getUserConfirmation(
    _: string,
    callback: (proceed: boolean) => void
  ) {
    callback(handleNavigation(nextLocation, nextAction));
  }

  function getRoute(location: RouterLocation, action: Action): UmbrellaRoute {
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
        return {
          name: routeName,
          action,
          params: match.params,
          addons: buildAddons(routeName, match.params, action),
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
        addons: buildAddons(
          nonExactMatch.routeName,
          nonExactMatch.params,
          action
        ),
      };
    }

    return {
      name: false,
      action,
      params: {},
      addons: buildAddons(false, {}, action),
    };
  }

  function getSharedRouterProperties(): SharedRouterProperties {
    return {
      navigate,
      queryStringSerializer,
      arraySeparator,
    };
  }

  function buildAddons(
    routeName: string | false,
    params: Record<string, unknown>,
    action: Action
  ) {
    const ctx: AddonContext<any> = {
      href: (params) => {
        if (routeName === false) {
          return "";
        }

        return routes[routeName].href(params);
      },
      link: (params) => {
        if (routeName === false) {
          return { href: "", onClick: () => {} };
        }

        return routes[routeName].link(params);
      },
      push: (params) => {
        if (routeName === false) {
          return false;
        }

        return routes[routeName].push(params);
      },
      replace: (params) => {
        if (routeName === false) {
          return false;
        }

        return routes[routeName].replace(params);
      },
      route: {
        action,
        params,
        name: routeName,
        addons: {},
      },
    };

    return mapObject(addons, (addon) => {
      return (...args: any[]) => addon(ctx, ...args);
    });
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
