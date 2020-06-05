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

export type QueryStringSerializer = {
  parse: (raw: string) => Record<string, string>;
  stringify: (
    queryParams: Record<
      string,
      { valueSerializerId?: string; array: boolean; value: string }
    >
  ) => string;
};

export type ParamDefKind = "path" | "query" | "state";

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
  path: string;
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

export type ParamValue<TParamDef> = TParamDef extends ParamDef<
  any,
  infer TValue
>
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

  extend<TExtensionParamDefCollection>(
    params: TExtensionParamDefCollection,
    path: PathFn<TExtensionParamDefCollection>
  ): RouteDef<TParamDefCollection & TExtensionParamDefCollection>;
  extend(path: string): RouteDef<TParamDefCollection>;
};
export type UmbrellaRouteDef = RouteDef<UmbrellaParamDefCollection>;

export type NavigateFunction = (
  route: UmbrellaRoute,
  primaryPath: boolean,
  replace: boolean
) => boolean;

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
  routeName: TRouteName;
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

export type LocationState =
  | {
      state?: Record<string, string>;
    }
  | undefined;

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

export type HiddenRouteProperties = {
  location: RouterLocation;
};

export type Route<TName, TParamDefCollection> = {
  name: TName;
  params: OutputRouteParams<TParamDefCollection>;
  action: Action | null;
  link: Link;
  href: string;
  push: () => boolean;
  replace: () => boolean;
};

export type GetRoute<T> = T extends { ["~internal"]: { Route: any } }
  ? T["~internal"]["Route"]
  : T extends Record<string, { ["~internal"]: { Route: any } }>
  ? T[keyof T]["~internal"]["Route"] | NotFoundRoute
  : never;

export type UmbrellaRoute = Route<string | false, Record<string, any>>;

export type NavigationHandler<TRouteDefCollection> = (
  nextRoute: RouteDefCollectionRoute<TRouteDefCollection>,
  previousRoute: RouteDefCollectionRoute<TRouteDefCollection> | null
) => boolean | void;
export type UmbrellaNavigationHandler = NavigationHandler<
  UmbrellaRouteDefCollection
>;

export type RouterSessionHistory<TRouteDefCollection> = {
  push(href: string, state?: any): boolean;
  replace(href: string, state?: any): boolean;
  getInitialRoute(): RouteDefCollectionRoute<TRouteDefCollection>;
  back(amount?: number): void;
  forward(amount?: number): void;
  reset(options: SessionConfig): void;
};
export type UmbrellaRouterHistory = RouterSessionHistory<
  UmbrellaRouteDefCollection
>;

export type MemoryHistorySessionConfig = {
  type: "memory";
  initialEntries?: string[];
  initialIndex?: number;
};

export type HashHistorySessionConfig = {
  type: "hash";
  hash?: "hashbang" | "noslash" | "slash";
};

export type BrowserHistorySessionConfig = {
  type: "browser";
  forceRefresh?: boolean;
};

export type SessionConfig =
  | HashHistorySessionConfig
  | MemoryHistorySessionConfig
  | BrowserHistorySessionConfig;

export type QueryStringArrayFormat =
  | "singleKey"
  | "singleKeyWithBracket"
  | "multiKey"
  | "multiKeyWithBracket";

export type ArrayFormat = {
  separator?: string;
  queryString?: QueryStringArrayFormat;
};

export type ScrollRestoration = {
  capture: () => any;
  restore: (scrollData: any) => void;
};

export type RouterConfig = {
  session?: SessionConfig;
  queryStringSerializer?: QueryStringSerializer;
  arrayFormat?: ArrayFormat;
};

export type UmbrellaRouteDefCollection = Record<string, UmbrellaRouteDef>;

export type Router<TRouteDefCollection extends { [routeName: string]: any }> = {
  routes: {
    [TRouteName in keyof TRouteDefCollection]: RouteBuilder<
      TRouteName,
      TRouteDefCollection[TRouteName]["~internal"]["params"]
    >;
  };
  session: RouterSessionHistory<TRouteDefCollection>;
  listen: (handler: NavigationHandler<TRouteDefCollection>) => () => void;
};
export type UmbrellaRouter = Router<UmbrellaRouteDefCollection>;

export type RouteBuilderGroup<T extends any[] = any[]> = {
  ["~internal"]: {
    type: "RouteBuilderGroup";
    Route: T[number]["~internal"]["Route"];
  };
  routeNames: T[number]["~internal"]["Route"]["name"][];
  has(route: Route<any, any>): route is T[number]["~internal"]["Route"];
};
