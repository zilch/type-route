import {
  RouteDefinitionBuilderCollection,
  Router,
  NavigationHandler,
  Action
} from "./types";
import {
  History,
  MemoryHistory,
  createBrowserHistory,
  createMemoryHistory,
  Location
} from "history";
import { mapObject } from "./mapObject";
import { buildRouteDefinition } from "./buildRouteDefinition";
import { getRoute } from "./getRoute";
import { error, validate } from "./validate";

export function createRouter<T>(routeDefinitions: T): Router<T, History>;
export function createRouter<T>(
  historyType: "browser",
  routeDefinitions: T
): Router<T, History>;
export function createRouter<T>(
  historyType: "memory",
  routeDefinitions: T
): Router<T, MemoryHistory>;
export function createRouter(...args: any[]) {
  validate["createRouter"](Array.from(arguments));

  let historyType: "memory" | "browser";
  let routeDefinitionBuilderCollection: RouteDefinitionBuilderCollection;

  if (args.length === 1) {
    historyType = "browser";
    routeDefinitionBuilderCollection = args[0];
  } else {
    historyType = args[0];
    routeDefinitionBuilderCollection = args[1];
  }

  const createHistory =
    historyType === "browser" ? createBrowserHistory : createMemoryHistory;

  const history = createHistory({ getUserConfirmation });
  const routes = mapObject(routeDefinitionBuilderCollection, (builder, name) =>
    buildRouteDefinition(navigate, builder, name as string)
  );

  const navigationHandlers: {
    id: number;
    handler: NavigationHandler<any>;
  }[] = [];
  let currentRoute = getRoute(routes, history.location, "initial");
  let navigationHandlerIdCounter = 0;
  let unblock: (() => void) | undefined = undefined;
  let nextLocation: Location;
  let nextAction: "pop" | "push" | "replace";
  let navigationResolverIdCounter = 0;
  let navigationResolverIdBase = Date.now().toString();
  let navigationResolvers: { [id: string]: (result: boolean) => void } = {};

  const router: Router<any, any> = {
    routes,
    listen,
    history,
    getCurrentRoute() {
      validate["[router].getCurrentRoute"](Array.from(arguments));
      return currentRoute;
    }
  };

  return router;

  function listen(handler: NavigationHandler<any>) {
    validate["[router].listen"](Array.from(arguments));

    const id = addNavigationHandler(handler);

    return {
      remove() {
        validate["[router].listen.remove"](Array.from(arguments));

        removeNavigationHandler(id);
      }
    };
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
