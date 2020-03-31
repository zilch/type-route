import { noMatch } from "./constants";

export type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export interface ErrorDef {
  errorCode: number;
  getDetails: (...args: any[]) => string[];
}

export interface BuildPathDefErrorContext {
  routeName: string;
  rawPath: string;
}

export interface QueryStringSerializer {
  parse: (raw: string) => Record<string, string>;
  stringify: (queryParams: Record<string, string>) => string;
}

export type ParamDefType = "path" | "query" | "state";

export interface ValueSerializer<TValue = unknown> {
  urlEncode?: boolean;
  parse(raw: string): TValue | typeof noMatch;
  stringify(value: TValue): string;
}

export interface ParamDef<
  TParamDefType extends ParamDefType,
  TValue = unknown
> {
  type: TParamDefType;
  valueSerializer: ValueSerializer<TValue>;
  optional: boolean;
  trailing?: boolean;
}

export interface ParamDefCollection<
  TParamDefType extends ParamDefType = ParamDefType
> {
  [parameterName: string]: ParamDef<TParamDefType>;
}

export interface PathParamDef<TValue = unknown>
  extends ParamDef<"path", TValue> {}

export interface NamedPathParamDef<TValue = unknown>
  extends PathParamDef<TValue> {
  name: string;
}

export interface Location {
  path: string;
  query?: string;
  state?: Record<string, string>;
}

export interface PathSegmentDef {
  leading: string;
  trailing: string;
  namedParamDef: NamedPathParamDef | null;
}

export interface ParamIdCollection {
  [paramName: string]: string;
}

export type GetRawPath = (paramIdCollection: ParamIdCollection) => string;

export type PathDef = PathSegmentDef[];

export interface BuildPathDefContext {
  routeName: string;
}

export type PathParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { type: "path" }
>;

export type PathParams<TParamDefCollection> = {
  [TParamName in PathParamNames<TParamDefCollection>]: string;
};

export type PathFn<TParamDefCollection> = (
  x: PathParams<TParamDefCollection>
) => string;

export interface RouteDefBuilder<TParamDefCollection> {
  params: TParamDefCollection;
  path: PathFn<TParamDefCollection>;

  extend<TExtensionParamDefCollection>(
    params: TExtensionParamDefCollection,
    path: PathFn<TExtensionParamDefCollection>
  ): RouteDefBuilder<TParamDefCollection & TExtensionParamDefCollection>;
}
