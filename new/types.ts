import { noMatch } from "./constants";

export type PathPart = {
  leading: string;
  trailing: string;
  param?: Param<ParamType, "optional" | "required">;
};

export type Action = "push" | "replace" | "pop" | "initial";

export type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type ParamType = "path" | "query" | "state";

export type NamedParam<T, O, V = unknown> = Param<T, O, V> & { name: string };

export type Param<T, O, V = unknown> = {
  _internal: {
    paramType: T;
    paramValueSerializer: ParamValueSerializer<V>;
    optionality: O;
    trailing: boolean;
  };
};

export type ParamValueSerializer<Value = unknown> = {
  urlEncode?: boolean;
  parse: (raw: string) => Value | typeof noMatch;
  toString: (value: Value) => string;
};

export type PathParamNames<T> = KeysMatching<T, { paramType: "path" }>;
export type OptionalParamNames<T> = KeysMatching<
  T,
  { optionality: "optional" }
>;
export type RequiredParamNames<T> = KeysMatching<
  T,
  { optionality: "required" }
>;

export type PathFn<T> = (params: Record<PathParamNames<T>, string>) => string;

export type RouteDefinitionBuilder<T> = {
  _internal: {
    params: T;
    path: PathFn<T>;
  };
  extend<K>(params: K, path: PathFn<K>): RouteDefinitionBuilder<T & K>;
  extend(path: string): RouteDefinitionBuilder<T>;
};

type ParamValue<T> = T extends Param<any, any, infer V> ? V : never;

type RouteParams<T> = {
  [K in RequiredParamNames<T>]: ParamValue<T[K]>;
} &
  {
    [K in OptionalParamNames<T>]?: ParamValue<T[K]>;
  };

export type OnClickHandler = (event?: any) => void;

export type Link = {
  href: string;
  onClick: OnClickHandler;
};

type RouteParamsFunction<T, R> = RequiredParamNames<T> extends never
  ? (params?: RouteParams<T>) => R
  : (params: RouteParams<T>) => R;

export type RouteDefinition<K, T> = {
  name: K;
  href: RouteParamsFunction<T, string>;
  push: RouteParamsFunction<T, Promise<boolean>>;
  replace: RouteParamsFunction<T, Promise<boolean>>;
  link: RouteParamsFunction<T, Link>;
  _internal: {
    type: {
      name: K;
      action: Action;
      params: RouteParams<T>;
    };
  };
};

type QueryStringSerializer = {
  parse: (raw: string) => Record<string, string>;
  toString: (value: Record<string, string>) => string;
};

export type RouterOptions = {
  type?: "memory" | "browser";
  queryStringSerializer?: QueryStringSerializer;
};

type HistoryEntry = {
  url: string;
  state?: any;
};

export type NotFoundRoute = {
  name: false;
  action: Action;
  params: {};
};

export type Route<T> = T extends RouteDefinition<any, any>
  ? {
      name: T["name"];
      action: Action;
      params: T["_internal"]["type"]["params"];
    }
  : T extends RouteDefinitionGroup<any>
  ? T["_internal"][]
  :
      | {
          [K in keyof T]: {
            name: K;
            action: Action;
            params: T[K] extends RouteDefinition<any, any>
              ? T[K]["_internal"]["type"]["params"]
              : never;
          };
        }[keyof T]
      | NotFoundRoute;

type RouterHistory<T> = {
  push(url: string, state?: any): Promise<boolean>;
  replace(url: string, state?: any): Promise<boolean>;
  getInitialRoute(): Route<T>;
  getEntries(): Route<T>[];
  back(amount?: number): Promise<boolean>;
  forward(amount?: number): Promise<boolean>;
  reset(initialState?: {
    entries?: (string | HistoryEntry)[];
    index?: number;
  }): void;
};

export type RouteDefinitionGroup<T extends any> = {
  _internal: {
    type: T[number]["_internal"]["type"];
  };
  routeNames: T[number]["_internal"]["type"]["name"][];
  has(route: Route<any>): route is T[number]["_internal"]["type"];
};

export type NavigationHandler<T> = (
  nextRoute: Route<T>
) => Promise<boolean | void> | boolean | void;

export type Router<T> = {
  routes: {
    [K in keyof T]: RouteDefinition<
      K,
      T[K] extends RouteDefinitionBuilder<any>
        ? T[K]["_internal"]["params"]
        : never
    >;
  };

  history: RouterHistory<T>;

  listen: (handler: NavigationHandler<T>) => () => void;
};
