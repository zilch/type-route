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
  stringify: (queryParams: Record<string, string>) => string;
};

export type ParamDefKind = "path" | "query" | "state";

export type ValueSerializer<TValue = unknown> = {
  urlEncode?: boolean;
  parse(raw: string): TValue | typeof noMatch;
  stringify(value: TValue): string;
};

export type ParamDef<TParamDefKind, TValue = unknown> = {
  _internal: {
    type: "ParamDef";
    kind: TParamDefKind;
    valueSerializer: ValueSerializer<TValue>;
    optional: boolean;
    default: TValue | undefined;
    trailing?: boolean;
  };
};
export type UmbrellaParamDef = ParamDef<ParamDefKind>;

export type SharedRouterProperties = {
  queryStringSerializer: QueryStringSerializer;
  navigate: NavigateFn;
};

export type ParamDefCollection<TParamDefKind> = {
  [parameterName: string]: ParamDef<TParamDefKind>;
};
export type UmbrellaParamDefCollection = ParamDefCollection<ParamDefKind>;

export type PathParamDef<TValue = unknown> = ParamDef<"path", TValue>;

export type NamedPathParamDef<TValue = unknown> = PathParamDef<TValue> & {
  paramName: string;
};

export type Location = {
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
  { _internal: { kind: "path" } }
>;
type OptionalParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { _internal: { optional: true } }
>;
type RequiredParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { _internal: { optional: false } }
>;
type RequiredOutputParamsNames<TParamDefCollection> =
  | RequiredParamNames<TParamDefCollection>
  | KeysDiffering<
      TParamDefCollection,
      { _internal: { optional: true; default: undefined } }
    >;
type OptionalOutputParamsNames<TParamDefCollection> = Exclude<
  keyof TParamDefCollection,
  RequiredOutputParamsNames<TParamDefCollection>
>;

export type ParamValue<TParamDef> = TParamDef extends ParamDef<
  any,
  infer TValue
>
  ? TValue
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
  _internal: {
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

export type NavigateFn = (
  location: Location,
  replace?: boolean
) => Promise<boolean>;

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
};

export type RouteDef<TRouteName, TParamDefCollection> = {
  name: TRouteName;
  href: RouteParamsFunction<TParamDefCollection, string>;
  push: RouteParamsFunction<TParamDefCollection, Promise<boolean>>;
  replace: RouteParamsFunction<TParamDefCollection, Promise<boolean>>;
  link: RouteParamsFunction<TParamDefCollection, Link>;
  _internal: {
    type: "RouteDef";
    match: (
      location: Location,
      queryStringSerializer: QueryStringSerializer
    ) => Match | false;
    Route: {
      name: TRouteName;
      action: Action;
      params: OutputRouteParams<TParamDefCollection>;
    };
  };
};
export type UmbrellaRouteDef = RouteDef<string, UmbrellaParamDefCollection>;

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

export type Action = "push" | "replace" | "pop" | "initial";

export type NotFoundRoute = {
  name: false;
  action: Action;
  params: {};
};

export type LocationState =
  | {
      navigationResolverId?: string;
      stateParams?: Record<string, string>;
    }
  | undefined;

export type Route<T> = T extends RouteDef<any, any>
  ? T["_internal"]["Route"]
  : T extends RouteDefGroup
  ? T["_internal"]["Route"]
  : T extends Record<string, RouteDef<any, any>>
  ?
      | {
          [TRouteName in keyof T]: T[TRouteName]["_internal"]["Route"];
        }[keyof T]
      | NotFoundRoute
  : T extends Record<string, RouteDefBuilder<any>>
  ?
      | {
          [TRouteName in keyof T]: {
            name: TRouteName;
            action: Action;
            params: OutputRouteParams<T[TRouteName]["_internal"]["params"]>;
          };
        }[keyof T]
      | NotFoundRoute
  : never;

export type UmbrellaRoute = {
  name: string | false;
  action: Action;
  params: Record<string, unknown>;
};

export type NavigationHandler<TRouteDefBuilderCollection> = (
  nextRoute: Route<TRouteDefBuilderCollection>
) => Promise<boolean | void> | boolean | void;
export type UmbrellaNavigationHandler = NavigationHandler<
  UmbrellaRouteDefBuilderCollection
>;

export type RouterHistory<TRouteDefBuilderCollection> = {
  push(url: string, state?: any): Promise<boolean>;
  replace(url: string, state?: any): Promise<boolean>;
  getInitialRoute(): Route<TRouteDefBuilderCollection>;
  back(amount?: number): void;
  forward(amount?: number): void;
  reset(options: HistoryOptions): void;
};
export type UmbrellaRouterHistory = RouterHistory<
  UmbrellaRouteDefBuilderCollection
>;

export type MemoryHistoryOptions = {
  type: "memory";
  initialEntries?: string[];
  initialIndex?: number;
};

export type BrowserHistoryOptions = {
  type: "browser";
  forceRefresh?: boolean;
};

export type HistoryOptions = MemoryHistoryOptions | BrowserHistoryOptions;

export type RouterOptions = {
  history?: HistoryOptions;
  queryStringSerializer?: QueryStringSerializer;
};

export type UmbrellaRouteDefBuilderCollection = Record<
  string,
  UmbrellaRouteDefBuilder
>;

export type Router<
  TRouteDefBuilderCollection extends { [routeName: string]: any }
> = {
  routes: {
    [TRouteName in keyof TRouteDefBuilderCollection]: RouteDef<
      TRouteName,
      TRouteDefBuilderCollection[TRouteName]["_internal"]["params"]
    >;
  };
  history: RouterHistory<TRouteDefBuilderCollection>;
  listen: (
    handler: NavigationHandler<TRouteDefBuilderCollection>
  ) => () => void;
};
export type UmbrellaRouter = Router<UmbrellaRouteDefBuilderCollection>;

export type RouteDefGroup<T extends any[] = any[]> = {
  _internal: {
    type: "RouteDefGroup";
    Route: T[number]["_internal"]["Route"];
  };
  routeNames: T[number]["_internal"]["Route"]["name"][];
  has(route: Route<any>): route is T[number]["_internal"]["Route"];
};
