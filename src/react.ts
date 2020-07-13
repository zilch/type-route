import {
  CoreRouter,
  UmbrellaRouteDefCollection,
  UmbrellaRoute,
  RouteDefCollectionRoute,
  RouterOpts,
} from "./types";
import { createRouter as coreCreateRouter, parseArgs } from "./createRouter";
import { TypeRouteError } from "./TypeRouteError";
import React from "react";
import { attemptScrollToTop } from "./attemptScrollToTop";

if (typeof __DEV__ === "boolean" && __DEV__) {
  const [major, minor] = React.version
    .split(".")
    .map((value: string) => parseInt(value, 10));

  if (major < 16 || (major === 16 && minor < 8)) {
    throw TypeRouteError.Invalid_React_version.create(React.version);
  }
}

export { defineRoute } from "./defineRoute";
export { param } from "./param";
export { createGroup } from "./createGroup";
export { noMatch } from "./noMatch";
export { preventDefaultLinkClickBehavior } from "./preventDefaultLinkClickBehavior";
export {
  GetRoute as Route,
  Link,
  ValueSerializer,
  QueryStringSerializer,
  SessionOpts,
  RouterOpts,
} from "./types";

type Router<
  TRouteDefCollection extends { [routeName: string]: any }
> = CoreRouter<TRouteDefCollection> & {
  /**
   * React hook for retrieving the current route.
   *
   * @see https://typehero.org/type-route/docs/api-reference/router/use-route
   */
  useRoute: () => RouteDefCollectionRoute<TRouteDefCollection>;

  /**
   * React component which connects React to Type Route and provides the current route to the rest of the application.
   *
   * @see https://typehero.org/type-route/docs/api-reference/router/route-provider
   */
  RouteProvider: (props: { children?: any }) => any;
};
type UmbrellaRouter = Router<UmbrellaRouteDefCollection>;

export function createRouter<
  TRouteDefCollection extends { [routeName: string]: any }
>(routeDefs: TRouteDefCollection): Router<TRouteDefCollection>;
export function createRouter<
  TRouteDefCollection extends { [routeName: string]: any }
>(
  opts: RouterOpts,
  routeDefs: TRouteDefCollection
): Router<TRouteDefCollection>;
export function createRouter(...args: any[]): UmbrellaRouter {
  const { opts, routeDefs } = parseArgs(args);
  const router = coreCreateRouter({ ...opts, scrollToTop: false }, routeDefs);
  const routeContext = React.createContext<UmbrellaRoute | null>(null);

  return {
    ...router,
    RouteProvider,
    useRoute,
  };

  function RouteProvider(props: { children?: any }) {
    const [route, setRoute] = React.useState(router.session.getInitialRoute());
    const unlistenRef = React.useRef<(() => void) | null>(null);

    if (unlistenRef.current === null) {
      unlistenRef.current = router.session.listen(setRoute);
    }

    React.useEffect(() => {
      return () => unlistenRef.current?.();
    }, []);

    React.useEffect(() => {
      attemptScrollToTop(route, opts.scrollToTop);
    }, [route]);

    return React.createElement(
      routeContext.Provider,
      { value: route },
      props.children
    );
  }

  function useRoute() {
    const route = React.useContext(routeContext);

    if (__DEV__) {
      if (route === null) {
        throw TypeRouteError.App_should_be_wrapped_in_a_RouteProvider_component.create();
      }
    }

    return route!;
  }
}
