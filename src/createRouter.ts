import {
  Router,
  Action,
  RouterConfig,
  SessionConfig,
  UmbrellaRouteBuilder,
  UmbrellaRouter,
  UmbrellaRoute,
  LocationState,
  UmbrellaRouteDefCollection,
  RouterContext,
  UmbrellaBlocker,
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
import { getMatchingRoute } from "./getMatchingRoute";
import { convertToRouterLocationFromHistoryLocation } from "./convertToRouterLocationFromHistoryLocation";
import { getRouteByHref } from "./getRouteByHref";
import { createNavigationHandlerManager } from "./createNavigationHandlerManager";
import { splitFirst } from "./stringUtils";

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
      unlisten = history.listen((update) => {
        if (skipNextEnvironmentTriggeredNavigation) {
          skipNextEnvironmentTriggeredNavigation = false;
          return;
        }

        const location = convertToRouterLocationFromHistoryLocation(
          update.location
        );
        const action = update.action.toLowerCase() as Action;
        const { route, primaryPath } = getMatchingRoute(
          location,
          getRouterContext()
        );

        handleNavigation({ ...route, action }, primaryPath);
      });
    },
    stopListening: () => unlisten?.(),
  });

  const arraySeparator = config.arrayFormat?.separator ?? ",";
  const queryStringSerializer =
    config.queryStringSerializer ??
    createQueryStringSerializer({
      queryStringArrayFormat: config.arrayFormat?.queryString,
      arraySeparator,
    });

  let history: History<LocationState>;
  let unlisten: (() => void) | undefined;
  let skipNextEnvironmentTriggeredNavigation = false;
  let skipHandlingNextApplicationTriggeredNavigation = false;
  let initialRoute: UmbrellaRoute | null = null;
  let blockerCollection: UmbrellaBlocker[] = [];

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

        return navigate({ ...route, action: "push" }, primaryPath);
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

        return navigate({ ...route, action: "replace" }, primaryPath);
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
          let result = getMatchingRoute(
            convertToRouterLocationFromHistoryLocation(history.location),
            getRouterContext()
          );

          if (!result.primaryPath) {
            skipHandlingNextApplicationTriggeredNavigation = true;
            result.route.replace();
            result = getMatchingRoute(
              convertToRouterLocationFromHistoryLocation(history.location),
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
      block(blocker) {
        blockerCollection.push(blocker);

        const unblock = history.block((update) => {
          const { route } = getMatchingRoute(
            convertToRouterLocationFromHistoryLocation(update.location),
            getRouterContext()
          );

          const action = update.action.toLowerCase() as Action;

          blocker({ route: { ...route, action }, retry: update.retry });
        });

        return () => {
          blockerCollection.splice(
            blockerCollection.findIndex((item) => item === blocker),
            1
          );

          unblock();
        };
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
    if (sessionConfig.type === "memory") {
      history = createMemoryHistory({
        initialEntries: sessionConfig.initialEntries,
        initialIndex: sessionConfig.initialIndex,
      });
    } else if (sessionConfig.type === "hash") {
      history = createHashHistory({
        window: sessionConfig.window,
      });
    } else {
      history = createBrowserHistory({
        window: sessionConfig.window,
      });
    }
  }

  function navigate(route: UmbrellaRoute, primaryPath: boolean) {
    if (blockerCollection.length > 0) {
      blockerCollection.forEach((blocker) => {
        blocker({
          route,
          retry: () => {
            route[route.action === "push" ? "push" : "replace"]();
          },
        });
      });

      return;
    }

    if (skipHandlingNextApplicationTriggeredNavigation) {
      skipHandlingNextApplicationTriggeredNavigation = false;
    } else {
      handleNavigation(route, primaryPath);
    }

    skipNextEnvironmentTriggeredNavigation = true;

    const state: Record<string, string> = {};

    if (route.name) {
      for (const paramName in route.params) {
        const paramDef =
          routeDefs[route.name]["~internal"].params[paramName]["~internal"];

        if (paramDef.kind === "state") {
          const value = route.params[paramName];
          state[paramName] = paramDef.valueSerializer.stringify(value);
        }
      }
    }

    const [pathname, search] = splitFirst(route.href, "?");

    history[route.action === "replace" ? "replace" : "push"](
      {
        pathname,
        search: search ? `?${search}` : "",
        hash: "",
      },
      state ? { state } : undefined
    );
  }

  function handleNavigation(route: UmbrellaRoute, primaryPath: boolean) {
    if (!primaryPath) {
      route.replace();
      return;
    }

    for (const handler of navigationHandlerManager.getHandlers()) {
      handler(route);
    }
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
