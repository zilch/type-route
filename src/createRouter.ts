import {
  RouteDefinitionBuilderCollection,
  Router,
  NavigationHandler,
  Action,
  HistoryConfig,
  Route
} from "./types";
import {
  History,
  createBrowserHistory,
  createMemoryHistory,
  Location,
  MemoryHistory
} from "history";
import { mapObject } from "./mapObject";
import { buildRouteDefinition } from "./buildRouteDefinition";
import { getRoute } from "./getRoute";
import { error, validate } from "./validate";

export function createRouter<T>(routeDefinitions: T): Router<T>;
export function createRouter(...args: any[]) {
  validate["createRouter"](Array.from(arguments));

  let routeDefinitionBuilderCollection: RouteDefinitionBuilderCollection =
    args[0];

  let history:
    | (History & { type: "browser" })
    | (MemoryHistory & { type: "memory" });

  const routes = mapObject(routeDefinitionBuilderCollection, (builder, name) =>
    buildRouteDefinition(navigate, builder, name as string)
  );

  const navigationHandlers: {
    id: number;
    handler: NavigationHandler<any>;
  }[] = [];
  let currentRoute: Route<any>;
  let navigationHandlerIdCounter = 0;
  let unblock: (() => void) | undefined = undefined;
  let nextLocation: Location;
  let nextAction: "pop" | "push" | "replace";
  let navigationResolverIdCounter = 0;
  let navigationResolverIdBase = Date.now().toString();
  let navigationResolvers: { [id: string]: (result: boolean) => void } = {};

  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    configure({ type: "browser" });
  } else {
    configure({ type: "memory" });
  }

  const router: Router<any> = {
    routes,
    listen,
    getCurrentRoute() {
      validate["[router].getCurrentRoute"](Array.from(arguments));
      return currentRoute;
    },
    history: {
      configure,
      getActiveInstance() {
        validate["[router].history.getActiveInstance"](Array.from(arguments));
        return history;
      }
    }
  };

  return router;

  function configure(config: HistoryConfig) {
    validate["[router].history.reset"](Array.from(arguments));

    if (config.type === "browser") {
      history = createBrowserHistory({
        ...config,
        getUserConfirmation
      }) as any;
      history.type = "browser";
    } else {
      history = createMemoryHistory({
        ...config,
        getUserConfirmation
      }) as any;
      history.type = "memory";
    }

    currentRoute = getRoute(routes, history.location, "initial");
  }

  function listen(handler: NavigationHandler<any>) {
    validate["[router].listen"](Array.from(arguments));

    const id = addNavigationHandler(handler);

    return removeListener;

    function removeListener() {
      validate["[router].listen.removeListener"](Array.from(arguments));

      removeNavigationHandler(id);
    }
  }

  function getNextNavigationResolverId() {
    navigationResolverIdCounter++;
    return `${navigationResolverIdBase}-${navigationResolverIdCounter}`;
  }

  function navigate(href: string, replace?: boolean) {
    return new Promise<boolean>(resolve => {
      const navigationResolverId = getNextNavigationResolverId();
      navigationResolvers[navigationResolverId] = resolve;

      if (replace) {
        history.replace(href, { navigationResolverId });
      } else {
        history.push(href, { navigationResolverId });
      }
    });
  }

  function addNavigationHandler(handler: NavigationHandler<{}>) {
    const id = navigationHandlerIdCounter++;

    navigationHandlers.push({
      id,
      handler
    });

    if (navigationHandlers.length === 1) {
      unblock = history.block((location, action) => {
        nextLocation = location;
        nextAction = {
          POP: "pop" as "pop",
          PUSH: "push" as "push",
          REPLACE: "replace" as "replace"
        }[action];
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
      throw error(`\n\nUnexpected error "unblock" should be defined\n`);
    }

    if (navigationHandlers.length === 0) {
      unblock();
    }
  }

  async function handleNavigation(location: Location, action: Action) {
    if (
      location.pathname === history.location.pathname &&
      location.search === history.location.search
    ) {
      return false;
    }

    const nextRoute = getRoute(routes, location, action);

    for (const { handler } of navigationHandlers) {
      const proceed = await handler(nextRoute);

      if (proceed === false) {
        return false;
      }
    }

    currentRoute = nextRoute;
    return true;
  }

  async function getUserConfirmation(
    _: string,
    callback: (proceed: boolean) => void
  ) {
    const navigationResolverId = (nextLocation.state || {})
      .navigationResolverId;
    const result = await handleNavigation(nextLocation, nextAction);

    const resolve = navigationResolvers[navigationResolverId];
    if (resolve) {
      resolve(result);
      delete navigationResolvers[navigationResolverId];
    }

    callback(result);
  }
}
