import { noMatch } from "./noMatch";

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

export type SharedRouterProperties = {
  queryStringSerializer: QueryStringSerializer;
  navigate: NavigateFunction;
  arraySeparator: string;
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

export type GetRawPath = (paramIdCollection: ParamIdCollection) => string;

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
) => string;

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
  routerLocation: RouterLocation,
  replace?: boolean
) => boolean;

export type OnClickHandler = (event?: any) => void;

export type Link = {
  href: string;
  onClick: OnClickHandler;
};

type RouteParamsFunction<
  TParamDefCollection,
  TReturnType,
  TAdditionalParams extends any[] = []
> = KeysMatching<TParamDefCollection, {}> extends never
  ? (...additionalParams: TAdditionalParams) => TReturnType
  : RequiredParamNames<TParamDefCollection> extends never
  ? (
      params?: InputRouteParams<TParamDefCollection>,
      ...additionalParams: TAdditionalParams
    ) => TReturnType
  : (
      params: InputRouteParams<TParamDefCollection>,
      ...additionalParams: TAdditionalParams
    ) => TReturnType;

export type Match = {
  params: Record<string, unknown>;
  numExtraneousParams: number;
};

type RouteDefInstanceAddonFunction<
  TParamDefCollection,
  TAddon
> = TAddon extends (
  context: any,
  ...addonParams: infer TAddonParameters
) => infer TAddonReturnType
  ? RouteParamsFunction<TParamDefCollection, TAddonReturnType, TAddonParameters>
  : never;

type RouteDefInstanceAddons<TParamDefCollection, TAddons> = {
  [TAddonName in keyof TAddons]: RouteDefInstanceAddonFunction<
    TParamDefCollection,
    TAddons[TAddonName]
  >;
};

type RouteAddonFunction<TAddon> = TAddon extends (
  context: any,
  ...addonParams: infer TAddonParameters
) => infer TAddonReturnType
  ? (...addonParams: TAddonParameters) => TAddonReturnType
  : never;

type RouteAddons<TAddons> = {
  [TAddonName in keyof TAddons]: RouteAddonFunction<TAddons[TAddonName]>;
};

export type RouteDefInstance<TRouteName, TParamDefCollection, TAddons> = {
  name: TRouteName;
  href: RouteParamsFunction<TParamDefCollection, string>;
  push: RouteParamsFunction<TParamDefCollection, boolean>;
  replace: RouteParamsFunction<TParamDefCollection, boolean>;
  link: RouteParamsFunction<TParamDefCollection, Link>;
  addons: RouteDefInstanceAddons<TParamDefCollection, TAddons>;
  ["~internal"]: {
    type: "RouteDefInstance";
    match: (args: {
      routerLocation: RouterLocation;
      queryStringSerializer: QueryStringSerializer;
      arraySeparator: string;
    }) => Match | false;
    Route: {
      name: TRouteName;
      params: OutputRouteParams<TParamDefCollection>;
      addons: RouteAddons<TAddons>;
      action: Action;
    };
  };
};
export type UmbrellaRouteDefInstance = RouteDefInstance<
  string,
  UmbrellaParamDefCollection,
  unknown
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

export type Action = "push" | "replace" | "pop" | "initial" | "unknown";

export type NotFoundRoute<TAddons> = {
  name: false;
  params: {};
  addons: RouteAddons<TAddons>;
  action: Action;
};

export type LocationState =
  | {
      navigationResolverId?: string;
      stateParams?: Record<string, string>;
    }
  | undefined;

export type RouteDefCollectionRoute<
  TRouteDefCollection,
  TAddons
> = TRouteDefCollection extends Record<string, RouteDef<any>>
  ?
      | {
          [TRouteName in keyof TRouteDefCollection]: {
            name: TRouteName;
            params: OutputRouteParams<
              TRouteDefCollection[TRouteName]["~internal"]["params"]
            >;
            addons: RouteAddons<TAddons>;
            action: Action;
          };
        }[keyof TRouteDefCollection]
      | NotFoundRoute<TAddons>
  : never;

export type Route<T> = T extends RouteDefInstance<any, any, any>
  ? T["~internal"]["Route"]
  : T extends RouteDefInstanceGroup
  ? T["~internal"]["Route"]
  : T extends Record<string, RouteDefInstance<any, any, any>>
  ?
      | T[keyof T]["~internal"]["Route"]
      | NotFoundRoute<
          T[keyof T]["~internal"]["Route"]["addons"] extends RouteAddons<
            infer TAddons
          >
            ? TAddons
            : {}
        >
  : never;

export type UmbrellaRoute = {
  name: string | false;
  params: Record<string, unknown>;
  addons: Record<string, (...args: any[]) => any>;
  action: Action;
};

export type NavigationHandler<TRouteDefCollection, TAddons> = (
  nextRoute: RouteDefCollectionRoute<TRouteDefCollection, TAddons>,
  prevRoute: RouteDefCollectionRoute<TRouteDefCollection, TAddons> | undefined
) => boolean | void;
export type UmbrellaNavigationHandler = NavigationHandler<
  UmbrellaRouteDefCollection,
  unknown
>;

export type RouterSessionHistory<TRouteDefCollection, TAddons> = {
  push(url: string, state?: any): boolean;
  replace(url: string, state?: any): boolean;
  getInitialRoute(): RouteDefCollectionRoute<TRouteDefCollection, TAddons>;
  back(amount?: number): void;
  forward(amount?: number): void;
  reset(options: RouterSessionHistoryOptions): void;
};
export type UmbrellaRouterHistory = RouterSessionHistory<
  UmbrellaRouteDefCollection,
  unknown
>;

export type MemorySessionHistoryOptions = {
  type: "memory";
  initialEntries?: string[];
  initialIndex?: number;
};

export type BrowserSessionHistoryOptions = {
  type: "browser";
  forceRefresh?: boolean;
};

export type RouterSessionHistoryOptions =
  | MemorySessionHistoryOptions
  | BrowserSessionHistoryOptions;

export type QueryStringArrayFormat =
  | "singleKey"
  | "singleKeyWithBracket"
  | "multiKey"
  | "multiKeyWithBracket";

export type ArrayFormat = {
  separator?: string;
  queryString?: QueryStringArrayFormat;
};

export type RouterOptions<
  TRouteDefCollection extends { [routeName: string]: any },
  TAddons extends { [addonName: string]: any }
> = {
  routeDefs: TRouteDefCollection;
  addons?: TAddons;
  session?: RouterSessionHistoryOptions;
  queryStringSerializer?: QueryStringSerializer;
  arrayFormat?: ArrayFormat;
  scrollToTop?: boolean;
  forceRefresh?: boolean;
};
export type UmbrellaRouterOptions = RouterOptions<
  UmbrellaRouteDefCollection,
  Record<string, (...args: any[]) => any>
>;

export type UmbrellaRouteDefCollection = Record<string, UmbrellaRouteDef>;

export type AddonContext<
  TRouteDefCollection
> = TRouteDefCollection extends Record<string, RouteDef<any>>
  ? {
      href: RouteParamsFunction<UmbrellaParamDefCollection, string>;
      push: RouteParamsFunction<UmbrellaParamDefCollection, boolean>;
      replace: RouteParamsFunction<UmbrellaParamDefCollection, boolean>;
      link: RouteParamsFunction<UmbrellaParamDefCollection, Link>;
      route: RouteDefCollectionRoute<TRouteDefCollection, any>;
    }
  : never;

export type Router<
  TRouteDefCollection extends { [routeName: string]: any },
  TAddons
> = {
  routes: {
    [TRouteName in keyof TRouteDefCollection]: RouteDefInstance<
      TRouteName,
      TRouteDefCollection[TRouteName]["~internal"]["params"],
      TAddons
    >;
  };
  session: RouterSessionHistory<TRouteDefCollection, TAddons>;
  listen: (
    handler: NavigationHandler<TRouteDefCollection, TAddons>
  ) => () => void;
};
export type UmbrellaRouter = Router<
  UmbrellaRouteDefCollection,
  Record<string, any>
>;

export type RouteDefInstanceGroup<T extends any[] = any[]> = {
  ["~internal"]: {
    type: "RouteDefInstanceGroup";
    Route: T[number]["~internal"]["Route"];
  };
  routeNames: T[number]["~internal"]["Route"]["name"][];
  has(route: Route<any>): route is T[number]["~internal"]["Route"];
};
