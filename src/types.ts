import { MemoryHistory, History } from "history";

export type QueryParamString = "query.param.string";
export type QueryParamNumber = "query.param.number";
export type PathParamString = "path.param.string";
export type PathParamNumber = "path.param.number";
export type QueryParamStringOptional = "query.param.string.optional";
export type QueryParamNumberOptional = "query.param.number.optional";

export type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T];

export type ParsedPathParameter = {
  name: string;
  kind: PathParamNumber | PathParamString;
  id: string;
};

export type ParsedPath = (string | ParsedPathParameter)[];

export type ParsedPathParameterCollection = {
  [name: string]: ParsedPathParameter;
};

export type ParameterDefinition =
  | QueryParamString
  | QueryParamNumber
  | PathParamString
  | PathParamNumber
  | QueryParamStringOptional
  | QueryParamNumberOptional;

export type QueryParameterDefinitionCollection = {
  [parameterName: string]:
    | QueryParamNumber
    | QueryParamString
    | QueryParamNumberOptional
    | QueryParamStringOptional;
};

export type ParameterDefinitionCollection = {
  [parameterName: string]: ParameterDefinition;
};

export type PathParameterDefinitionCollection = {
  [parameterName: string]: PathParamNumber | PathParamString;
};

export type PathFn<T extends ParameterDefinitionCollection> = (
  params: Record<KeysMatching<T, PathParamNumber | PathParamString>, string>
) => string;

export type MatchFnParams = {
  pathName: string;
  queryString?: string;
};

export type MatchFn<T extends ParameterDefinitionCollection> = (
  params: MatchFnParams
) => RouteParameters<T> | false;

export type RouteParameters<T extends ParameterDefinitionCollection> = Record<
  KeysMatching<T, QueryParamString | PathParamString>,
  string
> &
  Record<KeysMatching<T, QueryParamNumber | PathParamNumber>, number> &
  Partial<Record<KeysMatching<T, QueryParamStringOptional>, string>> &
  Partial<Record<KeysMatching<T, QueryParamNumberOptional>, number>>;

type RouteParameterFunction<
  T extends ParameterDefinitionCollection,
  R
> = KeysMatching<
  T,
  QueryParamString | QueryParamNumber | PathParamNumber | PathParamString
> extends never
  ? (params?: RouteParameters<T>) => R
  : (params: RouteParameters<T>) => R;

export type RouteDefinitionData<T extends ParameterDefinitionCollection> = {
  params: T;
  path: PathFn<T>;
};

export type OnClickHandler = (event?: { preventDefault?: () => void }) => void;

export type RouteDefinition<K, T extends ParameterDefinitionCollection> = {
  name: K;

  href: RouteParameterFunction<T, string>;

  push: RouteParameterFunction<T, Promise<boolean>>;

  link: RouteParameterFunction<T, { href: string; onClick: OnClickHandler }>;

  replace: RouteParameterFunction<T, Promise<boolean>>;

  match: MatchFn<T>;

  [".data"]: RouteDefinitionData<T>;
};

export type RouteDefinitionDataCollection = {
  [routeName: string]: RouteDefinitionData<any>;
};

export type RouteDefinitionCollection = {
  [routeName: string]: RouteDefinition<any, any>;
};

export type Action = "push" | "replace" | "pop" | "initial";

export type Route<
  T extends RouteDefinitionCollection | RouteDefinitionDataCollection
> =
  | {
      [K in keyof T]: {
        name: K;
        action: Action;
        params: T extends RouteDefinitionCollection
          ? RouteParameters<T[K][".data"]["params"]>
          : T extends RouteDefinitionDataCollection
          ? RouteParameters<T[K]["params"]>
          : never;
      }
    }[keyof T]
  | {
      name: false;
      action: Action;
      params: {};
    };

export type NavigationHandler<T extends RouteDefinitionDataCollection> = (
  nextRoute: Route<T>
) => Promise<false | void> | false | void;

export type Router<
  T extends RouteDefinitionDataCollection,
  H extends History | MemoryHistory
> = {
  routes: { [K in keyof T]: RouteDefinition<K, T[K]["params"]> };

  listen: (
    handler: NavigationHandler<T>
  ) => {
    remove: () => void;
  };

  getCurrentRoute: () => Route<T>;

  history: H;
};
