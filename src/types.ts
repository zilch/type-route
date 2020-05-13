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

export type RouteDefBuilder<TParamDefCollection> = {
  ["~internal"]: {
    type: "RouteDefBuilder";
    params: TParamDefCollection;
    path: PathFn<TParamDefCollection>;
  };

  extend<TExtensionParamDefCollection>(
    params: TExtensionParamDefCollection,
    path: PathFn<TExtensionParamDefCollection>
  ): RouteDefBuilder<TParamDefCollection & TExtensionParamDefCollection>;
  extend(path: string): RouteDefBuilder<TParamDefCollection>;
};
export type UmbrellaRouteDefBuilder = RouteDefBuilder<
  UmbrellaParamDefCollection
>;

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

type RouteDefAddon<TParamDefCollection, TAddon> = TAddon extends (
  context: any,
  ...addonParams: infer TAddonParameters
) => infer TAddonReturnType
  ? RouteParamsFunction<TParamDefCollection, TAddonReturnType, TAddonParameters>
  : never;

type RouteDefAddonCollection<TParamDefCollection, TAddons> = {
  [TAddonName in keyof TAddons]: RouteDefAddon<
    TParamDefCollection,
    TAddons[TAddonName]
  >;
};

type RouteAddon<TAddon> = TAddon extends (
  context: any,
  ...addonParams: infer TAddonParameters
) => infer TAddonReturnType
  ? (...addonParams: TAddonParameters) => TAddonReturnType
  : never;

type RouteAddonCollection<TAddons> = {
  [TAddonName in keyof TAddons]: RouteAddon<TAddons[TAddonName]>;
};

export type RouteDef<TRouteName, TParamDefCollection, TAddons> = {
  name: TRouteName;
  href: RouteParamsFunction<TParamDefCollection, string>;
  push: RouteParamsFunction<TParamDefCollection, boolean>;
  replace: RouteParamsFunction<TParamDefCollection, boolean>;
  link: RouteParamsFunction<TParamDefCollection, Link>;
  addons: RouteDefAddonCollection<TParamDefCollection, TAddons>;
  ["~internal"]: {
    type: "RouteDef";
    match: (args: {
      routerLocation: RouterLocation;
      queryStringSerializer: QueryStringSerializer;
      arraySeparator: string;
    }) => Match | false;
    Route: Route<TRouteName, TParamDefCollection, TAddons>;
  };
};
export type UmbrellaRouteDefInstance = RouteDef<
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

export type Action = "push" | "replace" | "pop";

export type NotFoundRoute<TAddons> = Route<false, {}, TAddons>;

export type LocationState =
  | {
      navigationResolverId?: string;
      stateParams?: Record<string, string>;
    }
  | undefined;

export type RouteDefBuilderCollectionRoute<
  TRouteDefBuilderCollection,
  TAddons
> = TRouteDefBuilderCollection extends Record<string, RouteDefBuilder<any>>
  ?
      | {
          [TRouteName in keyof TRouteDefBuilderCollection]: Route<
            TRouteName,
            TRouteDefBuilderCollection[TRouteName]["~internal"]["params"],
            TAddons
          >;
        }[keyof TRouteDefBuilderCollection]
      | NotFoundRoute<TAddons>
  : never;

export type Route<TName, TParamDefCollection, TAddons> = {
  name: TName;
  params: OutputRouteParams<TParamDefCollection>;
  addons: RouteAddonCollection<TAddons>;
  link: () => Link;
  href: () => string;
  push: () => boolean;
  replace: () => boolean;
};

export type GetRoute<T> = T extends RouteDef<any, any, any>
  ? T["~internal"]["Route"]
  : T extends RouteDefGroup
  ? T["~internal"]["Route"]
  : T extends Record<string, RouteDef<any, any, any>>
  ?
      | T[keyof T]["~internal"]["Route"]
      | NotFoundRoute<
          T[keyof T]["~internal"]["Route"]["addons"] extends RouteAddonCollection<
            infer TAddons
          >
            ? TAddons
            : {}
        >
  : never;

export type UmbrellaRoute = Route<
  string | false,
  Record<string, any>,
  Record<string, (...args: any[]) => any>
>;

export type NavigationEvent = {
  action: Action;
};

export type NavigationHandler<TRouteDefBuilderCollection, TAddons> = (
  nextRoute: RouteDefBuilderCollectionRoute<
    TRouteDefBuilderCollection,
    TAddons
  >,
  prevRoute: RouteDefBuilderCollectionRoute<
    TRouteDefBuilderCollection,
    TAddons
  > | null,
  event: NavigationEvent
) => boolean | void;
export type UmbrellaNavigationHandler = NavigationHandler<
  UmbrellaRouteDefBuilderCollection,
  unknown
>;

export type RouterSessionHistory<TRouteDefBuilderCollection, TAddons> = {
  push(url: string, state?: any): boolean;
  replace(url: string, state?: any): boolean;
  getInitialRoute(): RouteDefBuilderCollectionRoute<
    TRouteDefBuilderCollection,
    TAddons
  >;
  back(amount?: number): void;
  forward(amount?: number): void;
  reset(options: RouterSessionHistoryConfig): void;
};
export type UmbrellaRouterHistory = RouterSessionHistory<
  UmbrellaRouteDefBuilderCollection,
  unknown
>;

export type MemorySessionHistoryConfig = {
  type: "memory";
  initialEntries?: string[];
  initialIndex?: number;
};

export type BrowserSessionHistoryConfig = {
  type: "browser";
  forceRefresh?: boolean;
};

export type RouterSessionHistoryConfig =
  | MemorySessionHistoryConfig
  | BrowserSessionHistoryConfig;

export type QueryStringArrayFormat =
  | "singleKey"
  | "singleKeyWithBracket"
  | "multiKey"
  | "multiKeyWithBracket";

export type ArrayFormat = {
  separator?: string;
  queryString?: QueryStringArrayFormat;
};

export type RouterConfig<TAddons extends { [addonName: string]: any }> = {
  addons?: TAddons;
  session?: RouterSessionHistoryConfig;
  queryStringSerializer?: QueryStringSerializer;
  arrayFormat?: ArrayFormat;
  scrollToTop?: boolean;
  forceRefresh?: boolean;
};
export type UmbrellaRouterConfig = RouterConfig<
  Record<string, (...args: any[]) => any>
>;

export type UmbrellaRouteDefBuilderCollection = Record<
  string,
  UmbrellaRouteDefBuilder
>;

export type Router<
  TRouteDefBuilderCollection extends { [routeName: string]: any },
  TAddons
> = {
  routes: {
    [TRouteName in keyof TRouteDefBuilderCollection]: RouteDef<
      TRouteName,
      TRouteDefBuilderCollection[TRouteName]["~internal"]["params"],
      TAddons
    >;
  };
  session: RouterSessionHistory<TRouteDefBuilderCollection, TAddons>;
  listen: (
    handler: NavigationHandler<TRouteDefBuilderCollection, TAddons>
  ) => () => void;
};
export type UmbrellaRouter = Router<
  UmbrellaRouteDefBuilderCollection,
  Record<string, any>
>;

export type RouteDefGroup<T extends any[] = any[]> = {
  ["~internal"]: {
    type: "RouteDefGroup";
    Route: T[number]["~internal"]["Route"];
  };
  routeNames: T[number]["~internal"]["Route"]["name"][];
  has(route: Route<any, any, any>): route is T[number]["~internal"]["Route"];
};
