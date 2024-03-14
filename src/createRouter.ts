import {
  CoreRouter,
  Action,
  SessionOpts,
  UmbrellaRouteBuilder,
  UmbrellaCoreRouter,
  UmbrellaRoute,
  UmbrellaRouteDefCollection,
  RouterContext,
  UmbrellaBlocker,
  RouterOpts,
  NavigateOptions,
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
import { stringUtils } from "./stringUtils";
import { attemptScrollToTop } from "./attemptScrollToTop";
import { serializeStateParams } from "./serializeStateParams";

const { startsWith, splitFirst } = stringUtils;

export function createRouter<
  TRouteDefCollection extends { [routeName: string]: any }
>(routeDefs: TRouteDefCollection): CoreRouter<TRouteDefCollection>;
export function createRouter<
  TRouteDefCollection extends { [routeName: string]: any }
>(
  opts: RouterOpts,
  routeDefs: TRouteDefCollection
): CoreRouter<TRouteDefCollection>;
export function createRouter(...args: any[]): UmbrellaCoreRouter {
  const { routeDefs, opts } = parseArgs(args);

  const navigationHandlerManager = createNavigationHandlerManager({
    startListening: () => {
      unlisten = history.listen((update) => {
        if (skipNextEnvironmentTriggeredNavigation) {
          skipNextEnvironmentTriggeredNavigation = false;
          return;
        }

        const location = convertToRouterLocationFromHistoryLocation(
          update.location,
          baseUrl
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

  const baseUrl = opts.baseUrl ?? "/";
  const arraySeparator = opts.arrayFormat?.separator ?? ",";
  const queryStringSerializer =
    opts.queryStringSerializer ??
    createQueryStringSerializer({
      queryStringArrayFormat: opts.arrayFormat?.queryString,
      arraySeparator,
    });

  let history: History;
  let unlisten: (() => void) | undefined;
  let skipNextEnvironmentTriggeredNavigation = false;
  let skipHandlingNextApplicationTriggeredNavigation = false;
  let initialRoute: UmbrellaRoute | null = null;
  let previousRoute: UmbrellaRoute | null = null;
  let blockerCollection: UmbrellaBlocker[] = [];

  applySessionOpts(opts.session);

  const routes = createRouteBuilderCollection(getRouterContext);

  const router: UmbrellaCoreRouter = {
    routes,
    session: {
      push(href, state, options: NavigateOptions) {
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

        return navigate({ ...route, action: "push" }, primaryPath, options);
      },
      replace(href, state, options: NavigateOptions) {
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

        return navigate({ ...route, action: "replace" }, primaryPath, options);
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
            convertToRouterLocationFromHistoryLocation(
              history.location,
              baseUrl
            ),
            getRouterContext()
          );

          if (!result.primaryPath) {
            skipHandlingNextApplicationTriggeredNavigation = true;
            result.route.replace();
            result = getMatchingRoute(
              convertToRouterLocationFromHistoryLocation(
                history.location,
                baseUrl
              ),
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

        return applySessionOpts(session);
      },
      block(blocker) {
        blockerCollection.push(blocker);

        const unblock = history.block((update) => {
          const { route } = getMatchingRoute(
            convertToRouterLocationFromHistoryLocation(
              update.location,
              baseUrl
            ),
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
      listen: (handler) => navigationHandlerManager.add(handler),
    },
  };

  return router;

  function applySessionOpts(
    sessionOpts: SessionOpts = {
      type:
        typeof window !== "undefined" && typeof window.document !== "undefined"
          ? "browser"
          : "memory",
    }
  ) {
    initialRoute = null;
    if (sessionOpts.type === "memory") {
      history = createMemoryHistory({
        initialEntries: sessionOpts.initialEntries,
        initialIndex: sessionOpts.initialIndex,
      });
    } else if (sessionOpts.type === "hash") {
      history = createHashHistory({
        window: sessionOpts.window,
      });
    } else {
      history = createBrowserHistory({
        window: sessionOpts.window,
      });
    }
  }

  function navigate(
    route: UmbrellaRoute,
    primaryPath: boolean,
    options?: NavigateOptions
  ) {
    debugger;
    if (blockerCollection.length > 0) {
      blockerCollection.forEach((blocker) => {
        blocker({
          route,
          retry: () => {
            route[route.action === "push" ? "push" : "replace"](options);
          },
        });
      });

      return;
    }

    const state = serializeStateParams(route, routeDefs);

    if (
      previousRoute?.href === route.href &&
      JSON.stringify(serializeStateParams(previousRoute, routeDefs)) ===
        JSON.stringify(state)
    ) {
      return;
    }

    if (skipHandlingNextApplicationTriggeredNavigation) {
      skipHandlingNextApplicationTriggeredNavigation = false;
    } else if (options?.skipRender) {
      // do nothing
    } else {
      handleNavigation(route, primaryPath);
    }

    skipNextEnvironmentTriggeredNavigation = true;

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

    attemptScrollToTop(route, opts.scrollToTop);

    previousRoute = route;
  }

  function getRouterContext(): RouterContext {
    return {
      queryStringSerializer,
      arraySeparator,
      navigate,
      history,
      routeDefs,
      getRoutes: () => routes,
      baseUrl,
    };
  }
}

export function parseArgs(args: any[]) {
  const routeDefs: UmbrellaRouteDefCollection =
    args.length === 1 ? args[0] : args[1];
  const opts: RouterOpts = args.length === 1 ? {} : args[0];

  if (__DEV__) {
    assert("createRouter", [
      assert.numArgs(args, 1, 2),
      assert.collectionOfType("RouteDef", "routeDefs", routeDefs),
      assert.type("object", "opts", opts),
    ]);

    if (opts.arrayFormat?.queryString && opts.queryStringSerializer) {
      throw TypeRouteError.Query_string_array_format_and_custom_query_string_serializer_may_not_both_be_provided.create();
    }

    if (typeof opts.baseUrl === "string") {
      if (!startsWith(opts.baseUrl, "/")) {
        throw TypeRouteError.Base_url_must_start_with_a_forward_slash.create(
          opts.baseUrl
        );
      }

      if (
        opts.baseUrl
          .split("/")
          .some((part) => encodeURIComponent(part) !== part)
      ) {
        throw TypeRouteError.Base_url_must_not_contain_any_characters_that_must_be_url_encoded.create(
          opts.baseUrl
        );
      }
    }
  }

  return { routeDefs, opts };
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
