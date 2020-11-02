import { noMatch } from "./noMatch";
import { History } from "history";

export type Compute<A extends any> = A extends Function
  ? A
  : {
      [K in keyof A]: A[K];
    } & {};

export type KeysMatching<TObject, TCondition> = {
  [TKey in keyof TObject]: TObject[TKey] extends TCondition ? TKey : never;
}[keyof TObject];

export type KeysDiffering<TObject, TCondition> = {
  [TKey in keyof TObject]: TObject[TKey] extends TCondition ? never : TKey;
}[keyof TObject];

export type ErrorDef = {
  errorCode: number;
  getDetails: (...args: any[]) => string[];
};

export type BuildPathDefErrorContext = {
  routeName: string;
  rawPath: string;
};

/**
 * Object for configuring a custom query string serializer. You likely
 * do not need this level of customization for your application.
 *
 * @see https://typehero.org/type-route/docs/api-reference/types/query-string-serializer
 */
export type QueryStringSerializer = {
  /**
   * Accepts the query string (without the leading ?) and returns
   * a mapping of parameter names to unserialized parameter values.
   * Individual parameter value serializer take care of the parsing
   * parameter values.
   *
   * @see https://typehero.org/type-route/docs/api-reference/types/query-string-serializer
   */
  parse: (raw: string) => Record<string, string>;

  /**
   * Accepts an object keyed by query parameter names and generates
   * a stringified version of the object.
   *
   * @see https://typehero.org/type-route/docs/api-reference/types/query-string-serializer
   */
  stringify: (
    queryParams: Record<
      string,
      { valueSerializerId?: string; array: boolean; value: string }
    >
  ) => string;
};

export type ParamDefKind = "path" | "query" | "state";

/**
 * Object for configuring a custom parameter value serializer.
 *
 * @see https://typehero.org/type-route/docs/api-reference/types/value-serializer
 */
export type ValueSerializer<TValue = unknown> = {
  id?: string;
  urlEncode?: boolean;
  parse(raw: string): TValue | typeof noMatch;
  stringify(value: TValue): string;
};

export type ParamDef<TParamDefKind, TValue = unknown> = {
  ["~internal"]: {
    type: "ParamDef";
    kind: TParamDefKind;
    valueSerializer: ValueSerializer<TValue>;
    array: boolean;
    optional: boolean;
    default: TValue | undefined;
    trailing?: boolean;
  };
};
export type UmbrellaParamDef = ParamDef<ParamDefKind>;

export type RouterContext = {
  queryStringSerializer: QueryStringSerializer;
  navigate: NavigateFunction;
  arraySeparator: string;
  history: History;
  routeDefs: UmbrellaRouteDefCollection;
  routes: Record<string, UmbrellaRouteBuilder>;
  baseUrl: string;
};

export type ParamDefCollection<TParamDefKind> = {
  [parameterName: string]: ParamDef<TParamDefKind>;
};
export type UmbrellaParamDefCollection = ParamDefCollection<ParamDefKind>;

export type PathParamDef<TValue = unknown> = ParamDef<"path", TValue>;

export type NamedPathParamDef<TValue = unknown> = PathParamDef<TValue> & {
  paramName: string;
};

export type RouterLocation = {
  fullPath: string;
  path?: string;
  query?: string;
  state?: Record<string, string>;
};

export type PathSegmentDef = {
  leading: string;
  trailing: string;
  namedParamDef: NamedPathParamDef | null;
};

export type PathDef = PathSegmentDef[];

export type ParamIdCollection = {
  [paramName: string]: string;
};

export type GetRawPath = (
  paramIdCollection: ParamIdCollection
) => string | string[];

export type PathParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { ["~internal"]: { kind: "path" } }
>;
type OptionalParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { ["~internal"]: { optional: true } }
>;
type RequiredParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { ["~internal"]: { optional: false } }
>;
type RequiredOutputParamsNames<TParamDefCollection> =
  | RequiredParamNames<TParamDefCollection>
  | KeysDiffering<
      TParamDefCollection,
      { ["~internal"]: { optional: true; default: undefined } }
    >;
type OptionalOutputParamsNames<TParamDefCollection> = Exclude<
  keyof TParamDefCollection,
  RequiredOutputParamsNames<TParamDefCollection>
>;

export type ParamValue<TParamDef> = TParamDef extends {
  "~internal": {
    array: boolean;
    valueSerializer: ValueSerializer<infer TValue>;
  };
}
  ? TParamDef["~internal"]["array"] extends true
    ? TValue[]
    : TValue
  : never;

type InputRouteParams<TParamDefCollection> = Compute<
  Pick<
    {
      [TParamName in keyof TParamDefCollection]: ParamValue<
        TParamDefCollection[TParamName]
      >;
    },
    RequiredParamNames<TParamDefCollection>
  > &
    Pick<
      {
        [TParamName in keyof TParamDefCollection]?: ParamValue<
          TParamDefCollection[TParamName]
        >;
      },
      OptionalParamNames<TParamDefCollection>
    >
>;

type OutputRouteParams<TParamDefCollection> = Compute<
  Pick<
    {
      [TParamName in keyof TParamDefCollection]?: ParamValue<
        TParamDefCollection[TParamName]
      >;
    },
    OptionalOutputParamsNames<TParamDefCollection>
  > &
    Pick<
      {
        [TParamName in keyof TParamDefCollection]: ParamValue<
          TParamDefCollection[TParamName]
        >;
      },
      RequiredOutputParamsNames<TParamDefCollection>
    >
>;

export type PathParams<TParamDefCollection> = {
  [TParamName in PathParamNames<TParamDefCollection>]: string;
};

export type PathFn<TParamDefCollection> = (
  x: PathParams<TParamDefCollection>
) => string | string[];

export type RouteDef<TParamDefCollection> = {
  ["~internal"]: {
    type: "RouteDef";
    params: TParamDefCollection;
    path: PathFn<TParamDefCollection>;
  };

  /**
   * Create a new route definition by extending the current one.
   *
   * @see https://typehero.org/type-route/docs/api-reference/route-definition/extend
   */
  extend<TExtensionParamDefCollection>(
    params: TExtensionParamDefCollection,
    path: PathFn<TExtensionParamDefCollection>
  ): RouteDef<TParamDefCollection & TExtensionParamDefCollection>;

  /**
   * Create a new route definition by extending the current one.
   *
   * @see https://typehero.org/type-route/docs/api-reference/route-definition/extend
   */
  extend(path: string | string[]): RouteDef<TParamDefCollection>;
};
export type UmbrellaRouteDef = RouteDef<UmbrellaParamDefCollection>;

export type NavigateFunction = (
  route: UmbrellaRoute,
  primaryPath: boolean
) => void;

export type OnClickHandler = (event?: any) => void;

export type Link = {
  href: string;
  onClick: OnClickHandler;
};

type RouteParamsFunction<TParamDefCollection, TReturnType> = KeysMatching<
  TParamDefCollection,
  {}
> extends never
  ? () => TReturnType
  : RequiredParamNames<TParamDefCollection> extends never
  ? (params?: InputRouteParams<TParamDefCollection>) => TReturnType
  : (params: InputRouteParams<TParamDefCollection>) => TReturnType;

export type Match = {
  params: Record<string, unknown>;
  numExtraneousParams: number;
  primaryPath: boolean;
};

export type RouteBuilder<TRouteName, TParamDefCollection> = RouteParamsFunction<
  TParamDefCollection,
  Route<TRouteName, TParamDefCollection>
> & {
  /**
   * Name of the route
   */
  name: TRouteName;
  ["~internal"]: {
    type: "RouteBuilder";
    match: (args: {
      routerLocation: RouterLocation;
      queryStringSerializer: QueryStringSerializer;
      arraySeparator: string;
    }) => Match | false;
    pathDefs: PathDef[];
    Route: Route<TRouteName, TParamDefCollection>;
  };
};
export type UmbrellaRouteBuilder = RouteBuilder<
  string,
  UmbrellaParamDefCollection
>;

export type ClickEvent = {
  preventDefault?: () => void;
  button?: number | null;
  defaultPrevented?: boolean | null;
  metaKey?: boolean | null;
  altKey?: boolean | null;
  ctrlKey?: boolean | null;
  shiftKey?: boolean | null;
  target?: { target?: string | null } | null;
};

export type Action = "push" | "replace" | "pop";

export type LocationState = {
  state?: Record<string, string>;
} | null;

export type RouteDefCollectionRoute<
  TRouteDefCollection
> = TRouteDefCollection extends Record<string, RouteDef<any>>
  ?
      | {
          [TRouteName in keyof TRouteDefCollection]: Route<
            TRouteName,
            TRouteDefCollection[TRouteName]["~internal"]["params"]
          >;
        }[keyof TRouteDefCollection]
      | NotFoundRoute
  : never;

export type NotFoundRoute = Route<false, {}>;

export type Route<TName, TParamDefCollection> = {
  /**
   * Name of the route.
   */
  name: TName;

  /**
   * Route parameters.
   */
  params: OutputRouteParams<TParamDefCollection>;

  /**
   * How the current route was navigated to.
   * - "push" indicates your application added this route.
   * - "replace" also indicates your application added this route.
   * - "pop" indicates the browser navigated to this route (think
   *    back/forward buttons)
   * - null indicates the route has not yet been navigated to or
   *   its action was not able to be determined (as is the case with
   *   session.getInitialRoute() )
   */
  action: Action | null;

  /**
   * Helper for constructing links
   *
   * @see https://typehero.org/type-route/docs/guides/rendering-links
   */
  link: Link;

  /**
   * The href of the current route without domain but including
   * path, query string, and hash.
   */
  href: string;

  /**
   * Pushes a new route onto the history stack, increasing its length by one.
   * If there were any entries in the stack after the current one, they are
   * lost.
   */
  push: () => void;

  /**
   * Replaces the current route in the history stack with this one.
   */
  replace: () => void;
};

/**
 * Helper to retrieve a Route type.
 *
 * @see https://typehero.org/type-route/docs/api-reference/types/route
 */
export type GetRoute<T> = T extends { ["~internal"]: { Route: any } }
  ? T["~internal"]["Route"]
  : T extends Record<string, { ["~internal"]: { Route: any } }>
  ? T[keyof T]["~internal"]["Route"] | NotFoundRoute
  : never;

export type UmbrellaRoute = Route<string | false, Record<string, any>>;

export type NavigationHandler<TRouteDefCollection> = (
  route: RouteDefCollectionRoute<TRouteDefCollection>
) => void;
export type UmbrellaNavigationHandler = NavigationHandler<
  UmbrellaRouteDefCollection
>;

type Unblock = () => void;

export type Blocker<TRouteDefCollection> = (update: {
  /**
   * The route that would have been navigated to had navigation
   * not been blocked.
   */
  route: RouteDefCollectionRoute<TRouteDefCollection>;

  /**
   * Retry the navigation attempt. Typically is used after getting
   * user confirmation to leave and then unblocking navigation.
   */
  retry: () => void;
}) => void;
export type UmbrellaBlocker = Blocker<UmbrellaRouteDefCollection>;

/**
 * Functions for interacting with the current history session.
 */
export type RouterSession<TRouteDefCollection> = {
  /**
   * Manually add a new item to the history stack.
   */
  push(href: string, state?: any): void;

  /**
   * Replace the currently active item in the history stack.
   */
  replace(href: string, state?: any): void;

  /**
   * Get the initial route. Useful for bootstrapping your application.
   */
  getInitialRoute(): RouteDefCollectionRoute<TRouteDefCollection>;

  /**
   * Move back in history the specified amount.
   */
  back(amount?: number): void;

  /**
   * Move forward in history the specified amount.
   */
  forward(amount?: number): void;

  /**
   * Reconfigures the underlying history instance. Can be useful
   * when using server-side rendering.
   *
   * @see https://typehero.org/type-route/docs/guides/server-side-rendering
   */
  reset(options: SessionOpts): void;

  /**
   * Blocks navigation and registers a listener that is called when
   * navigation is blocked. Returns a function to unblock navigation.
   *
   * @see https://typehero.org/type-route/docs/guides/preventing-navigation
   */
  block(blocker: Blocker<TRouteDefCollection>): Unblock;

  /**
   * Registers a listener that is called when navigation occurs.
   * Returns a function to remove the navigation listener.
   */
  listen(handler: NavigationHandler<TRouteDefCollection>): Unlisten;
};
export type UmbrellaRouterSession = RouterSession<UmbrellaRouteDefCollection>;

export type MemoryHistorySessionOpts = {
  type: "memory";

  /**
   * An array of urls representing the what items should
   * start in history when the router is created. This can be useful
   * in a variety of scenarios including server-side rendering
   * (https://typehero.org/type-route/docs/guides/server-side-rendering).
   */
  initialEntries?: string[];

  /**
   * The index of the current url entry when the router is created.
   */
  initialIndex?: number;
};

export type HashHistorySessionOpts = {
  type: "hash";

  /**
   * Provide a custom window function to operate on. Can be useful when
   * using the route in an iframe.
   */
  window?: Window;
};

export type BrowserHistorySessionOpts = {
  type: "browser";

  /**
   * Provide a custom window function to operate on. Can be useful when
   * using the route in an iframe.
   */
  window?: Window;
};

export type SessionOpts =
  | HashHistorySessionOpts
  | MemoryHistorySessionOpts
  | BrowserHistorySessionOpts;

export type QueryStringArrayFormat =
  | "singleKey"
  | "singleKeyWithBracket"
  | "multiKey"
  | "multiKeyWithBracket";

export type ArrayFormat = {
  /**
   * Separator to use for array parameter types. By default ","
   */
  separator?: string;

  /**
   * Query string serialization method.
   *
   * @see https://typehero.org/type-route/docs/guides/custom-query-string
   */
  queryString?: QueryStringArrayFormat;
};

export type RouterOpts = {
  /**
   * Options for what variety of browser history session you're using.
   * There are three types with additional options depending on the
   * session type: "browser", "hash", and "memory".
   */
  session?: SessionOpts;

  /**
   * A custom serializer/deserializer for the query string. This is an
   * advanced feature your application likely does not need.
   *
   * @see https://typehero.org/type-route/docs/guides/custom-query-string
   */
  queryStringSerializer?: QueryStringSerializer;

  /**
   * Object used to configure how arrays are serialized to the url.
   */
  arrayFormat?: ArrayFormat;

  /**
   * A path segment that precedes every route in your application. When using a "hash"
   * router this segment will come before the "#" symbol.
   */
  baseUrl?: string;

  /**
   * If the application should scroll to the top of the page when a new route
   * is pushed onto the history stack. Defaults to true for applications running
   * in a web browser.
   */
  scrollToTop?: boolean;
};

export type Unlisten = {
  (): void;
};

export type UmbrellaRouteDefCollection = Record<string, UmbrellaRouteDef>;

export type CoreRouter<
  TRouteDefCollection extends { [routeName: string]: any }
> = {
  /**
   * Collection of route builders.
   */
  routes: {
    /**
     * Call routes.[routeName](params) to construct a route object.
     */
    [TRouteName in keyof TRouteDefCollection]: RouteBuilder<
      TRouteName,
      TRouteDefCollection[TRouteName]["~internal"]["params"]
    >;
  };

  session: RouterSession<TRouteDefCollection>;
};

export type UmbrellaCoreRouter = CoreRouter<UmbrellaRouteDefCollection>;

export type RouteGroup<T extends any[] = any[]> = {
  ["~internal"]: {
    type: "RouteGroup";
    Route: T[number]["~internal"]["Route"];
  };
  routeNames: T[number]["~internal"]["Route"]["name"][];
  /**
   * Accepts a route and returns whether or not it is part
   * of this group.
   *
   * @see https://typehero.org/type-route/docs/api-reference/route-group/has
   */
  has(route: Route<any, any>): route is T[number]["~internal"]["Route"];
};
