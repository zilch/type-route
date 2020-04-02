import { noMatch } from "./noMatch";

export type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

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

export type ParamDefType = "path" | "query" | "state";

export type ValueSerializer<TValue = unknown> = {
  urlEncode?: boolean;
  parse(raw: string): TValue | typeof noMatch;
  stringify(value: TValue): string;
};

export type ParamDef<TParamDefType, TValue = unknown> = {
  type: TParamDefType;
  valueSerializer: ValueSerializer<TValue>;
  optional: boolean;
  trailing?: boolean;
};

export type SharedRouterProperties = {
  queryStringSerializer: QueryStringSerializer;
  navigate: NavigateFn;
};

export type ParamDefCollection<TParamDefType> = {
  [parameterName: string]: ParamDef<TParamDefType>;
};

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
  { type: "path" }
>;
type OptionalParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { optional: true }
>;
type RequiredParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { optional: false }
>;

type ParamValue<TParamDef> = TParamDef extends ParamDef<any, infer TValue>
  ? TValue
  : never;

type RouteParams<TParamCollection> = {
  [K in RequiredParamNames<TParamCollection>]: ParamValue<TParamCollection[K]>;
} &
  {
    [K in OptionalParamNames<TParamCollection>]?: ParamValue<
      TParamCollection[K]
    >;
  };

export type PathParams<TParamDefCollection> = {
  [TParamName in PathParamNames<TParamDefCollection>]: string;
};

export type PathFn<TParamDefCollection> = (
  x: PathParams<TParamDefCollection>
) => string;

export type RouteDefBuilder<TParamDefCollection> = {
  params: TParamDefCollection;
  path: PathFn<TParamDefCollection>;

  extend<TExtensionParamDefCollection>(
    params: TExtensionParamDefCollection,
    path: PathFn<TExtensionParamDefCollection>
  ): RouteDefBuilder<TParamDefCollection & TExtensionParamDefCollection>;
};

export type NavigateFn = (
  location: Location,
  replace?: boolean
) => Promise<boolean>;

export type OnClickHandler = (event?: any) => void;

export type Link = {
  href: string;
  onClick: OnClickHandler;
};

type RouteParamsFunction<TParamDefCollection, TReturnType> = RequiredParamNames<
  TParamDefCollection
> extends never
  ? (params?: RouteParams<TParamDefCollection>) => TReturnType
  : (params: RouteParams<TParamDefCollection>) => TReturnType;

export type RouteDef<TRouteName, TRouteParams> = {
  name: TRouteName;
  href: RouteParamsFunction<TRouteParams, string>;
  push: RouteParamsFunction<TRouteParams, Promise<boolean>>;
  replace: RouteParamsFunction<TRouteParams, Promise<boolean>>;
  link: RouteParamsFunction<TRouteParams, Link>;
  match(
    location: Location,
    queryStringSerializer: QueryStringSerializer
  ): Record<string, unknown> | false;
};

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

export type Route = {
  name: string | false;
  action: Action;
  params: Record<string, unknown>;
};

export type NavigationHandler = (
  nextRoute: Route
) => Promise<boolean | void> | boolean | void;

export type RouterHistory = {
  push(url: string, state?: any): Promise<boolean>;
  replace(url: string, state?: any): Promise<boolean>;
  getInitialRoute(): Route;
  back(amount?: number): void;
  forward(amount?: number): void;
  reset(options: HistoryOptions): void;
};

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

export type Router<TRouteDefs> = {
  routes: {
    [TRouteName in keyof TRouteDefs]: RouteDef<
      TRouteName,
      TRouteDefs[TRouteName]["params"]
    >;
  };
  history: RouterHistory;
  listen: (handler: NavigationHandler) => () => void;
};
