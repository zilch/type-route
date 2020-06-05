import {
  Router,
  Action,
  RouterConfig,
  SessionConfig,
  UmbrellaRouteBuilder,
  UmbrellaRouter,
  UmbrellaNavigationHandler,
  UmbrellaRoute,
  LocationState,
  UmbrellaRouteDefCollection,
  RouterContext,
} from "./types";
import { createRouteBuilder } from "./createRouteBuilder";
import {
  createBrowserHistory,
  History,
  createMemoryHistory,
  createHashHistory,
} from "history";
import { createQueryStringSerializer } from "./createQueryStringSerializer";
import { assert } from "./assert";
import { TypeRouteError } from "./TypeRouteError";
import { areRoutesEqual } from "./areRoutesEqual";
import { getRoute } from "./getRoute";
import { getRouterLocation } from "./getRouterLocation";
import { getRouteByHref } from "./getRouteByHref";
import { createLocation } from "./createLocation";

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
  const { routeDefs, config } = parseArgs(args);
  const routes = createRouteBuilderCollection(getRouterContext);

  const navigationHandlerManager = createNavigationHandlerManager({
    startListening: () => {
      unblock = history.block((rawLocation, rawAction) => {
        if (skipNextEnvironmentTriggeredNavigation) {
          skipNextEnvironmentTriggeredNavigation = false;
          return;
        }

        const location = getRouterLocation(rawLocation);
        const action = rawAction.toLowerCase() as Action;
        const { route, primaryPath } = getRoute(location, getRouterContext());

        const proceed = handleNavigation(route, primaryPath, action);

        if (!proceed) {
          return false;
        }
      });
    },
    stopListening: () => unblock?.(),
  });

  const arraySeparator = config.arrayFormat?.separator ?? ",";
  const queryStringSerializer =
    config.queryStringSerializer ??
    createQueryStringSerializer({
      queryStringArrayFormat: config.arrayFormat?.queryString,
      arraySeparator,
    });

  let history: History<LocationState>;
  let unblock: (() => void) | undefined;
  let skipNextEnvironmentTriggeredNavigation = false;
  let skipNextApplicationTriggeredNavigation = false;
  let previousRoute: UmbrellaRoute | null = null;
  let initialRoute: UmbrellaRoute | null = null;

  applySessionConfig(config.session);

  return {
    routes,
    listen: (handler) => navigationHandlerManager.add(handler),
    session: {
      push(href, state) {
        if (__DEV__) {
          assert("[RouterSessionHistory].push", [
            assert.numArgs([].slice.call(arguments), 1, 2),
            assert.type("string", "href", href),
            assert.type(["object", "undefined"], "state", state),
          ]);
        }

        const { route, primaryPath } = getRouteByHref(
          href,
          state,
          getRouterContext()
        );

        return navigate(route, primaryPath, false);
      },
      replace(href, state) {
        if (__DEV__) {
          assert("[RouterSessionHistory].replace", [
            assert.numArgs([].slice.call(arguments), 1, 2),
            assert.type("string", "href", href),
            assert.type(["object", "undefined"], "state", state),
          ]);
        }

        const { route, primaryPath } = getRouteByHref(
          href,
          state,
          getRouterContext()
        );

        return navigate(route, primaryPath, true);
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
          let result = getRoute(
            getRouterLocation(history.location),
            getRouterContext()
          );

          if (!result.primaryPath) {
            skipNextApplicationTriggeredNavigation = true;
            result.route.replace();
            result = getRoute(
              getRouterLocation(history.location),
              getRouterContext()
            );
          }
          initialRoute = result.route;
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

        return applySessionConfig(session);
      },
    },
  };

  function applySessionConfig(
    sessionConfig: SessionConfig = {
      type:
        typeof window !== "undefined" && typeof window.document !== "undefined"
          ? "browser"
          : "memory",
    }
  ) {
    if (
      typeof window === "object" &&
      typeof window?.history === "object" &&
      window.history !== null
    ) {
      window.history.scrollRestoration = "manual";
    }

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
  }

  function navigate(
    route: UmbrellaRoute,
    primaryPath: boolean,
    replace: boolean
  ) {
    const proceed =
      skipNextApplicationTriggeredNavigation ||
      handleNavigation(route, primaryPath, replace ? "replace" : "push");

    if (skipNextApplicationTriggeredNavigation) {
      skipNextApplicationTriggeredNavigation = false;
    }

    if (proceed) {
      skipNextEnvironmentTriggeredNavigation = true;
      const state =
        route.name === false
          ? undefined
          : createLocation({
              routeName: route.name,
              paramCollection: route.params,
              routerContext: getRouterContext(),
            }).state;

      history[replace ? "replace" : "push"](
        route.href,
        state ? { state } : undefined
      );
    }

    return proceed;
  }

  function handleNavigation(
    nextRoute: UmbrellaRoute,
    primaryPath: boolean,
    action: Action
  ) {
    if (!primaryPath) {
      return nextRoute.replace();
    }

    if (
      previousRoute !== null &&
      areRoutesEqual(previousRoute, nextRoute, getRouterContext())
    ) {
      return false;
    }

    for (const handler of navigationHandlerManager.getHandlers()) {
      const proceed = handler({
        nextRoute,
        previousRoute,
        action,
      });

      if (__DEV__) {
        assert("NavigationHandler", [
          assert.type(
            ["boolean", "undefined"],
            "navigationHandlerResult",
            proceed
          ),
        ]);
      }

      if (proceed === false) {
        return false;
      }
    }

    previousRoute = nextRoute;

    return true;
  }

  function getRouterContext(): RouterContext {
    return {
      queryStringSerializer,
      arraySeparator,
      navigate,
      history,
      routeDefs,
      routes,
    };
  }
}

function createNavigationHandlerManager({
  startListening,
  stopListening,
}: {
  startListening: () => void;
  stopListening: () => void;
}) {
  const handlerIdList: {
    handler: UmbrellaNavigationHandler;
    id: number;
  }[] = [];
  let idCounter = 0;

  return { add, getHandlers };

  function getHandlers() {
    return handlerIdList.map(({ handler }) => handler);
  }

  function add(handler: UmbrellaNavigationHandler) {
    const id = idCounter++;
    handlerIdList.push({ id, handler });

    if (handlerIdList.length === 1) {
      startListening();
    }

    return remove;

    function remove() {
      const index = handlerIdList.map(({ id }) => id).indexOf(id);
      if (index >= 0) {
        handlerIdList.splice(index, 1);
        if (handlerIdList.length === 0) {
          stopListening();
        }
      }
    }
  }
}

function parseArgs(args: any[]) {
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

  return { routeDefs, config };
}

function createRouteBuilderCollection(getRouterContext: () => RouterContext) {
  const routes: Record<string, UmbrellaRouteBuilder> = {};
  const { routeDefs } = getRouterContext();

  for (const routeName in routeDefs) {
    const routeDef = routeDefs[routeName];
    routes[routeName] = createRouteBuilder(
      routeName,
      routeDef,
      getRouterContext
    );
  }

  return routes;
}
