import {
  RouterLocation,
  PathDef,
  QueryStringSerializer,
  UmbrellaParamDefCollection,
  UmbrellaParamDef,
} from "./types";
import { assert } from "./assert";
import { TypeRouteError } from "./TypeRouteError";
import { typeOf } from "./typeOf";

type ParamWithContextCollection = Record<
  string,
  { valueSerializerId?: string; array: boolean; value: string }
>;

export function createLocation({
  paramCollection,
  paramDefCollection,
  pathDef,
  queryStringSerializer,
  arraySeparator,
}: {
  paramCollection: Record<string, unknown>;
  paramDefCollection: UmbrellaParamDefCollection;
  pathDef: PathDef;
  queryStringSerializer: QueryStringSerializer;
  arraySeparator: string;
}): RouterLocation {
  const params = {
    path: {} as ParamWithContextCollection,
    query: {} as ParamWithContextCollection,
    state: {} as ParamWithContextCollection,
  };

  for (const paramName in paramCollection) {
    const paramValue = paramCollection[paramName];

    if (paramValue === undefined) {
      continue;
    }

    const paramDef = paramDefCollection[paramName];

    const urlEncodeDefault =
      paramDef["~internal"].kind !== "state" && !paramDef["~internal"].trailing;
    const urlEncode =
      paramDef["~internal"].valueSerializer.urlEncode ?? urlEncodeDefault;

    let value: string;

    if (paramDef["~internal"].array) {
      if (!Array.isArray(paramValue)) {
        if (__DEV__) {
          throw TypeRouteError.Expected_type_does_not_match_actual_type.create({
            context: "push/replace/link/href",
            actualType: typeOf(paramValue),
            expectedType: "array",
            value: paramValue,
            valueName: paramName,
          });
        } else {
          throw new Error();
        }
      }

      value = paramValue
        .map((part) => stringify(paramDef, part, urlEncode))
        .join(arraySeparator);
    } else {
      value = stringify(paramDef, paramValue, urlEncode);
    }

    params[paramDef["~internal"].kind][paramName] = {
      valueSerializerId: paramDef["~internal"].valueSerializer.id,
      array: paramDef["~internal"].array,
      value,
    };
  }

  const path =
    "/" +
    pathDef
      .filter(({ namedParamDef }) => {
        return !(
          namedParamDef?.["~internal"].optional &&
          params.path[namedParamDef.paramName] === undefined
        );
      })
      .map(({ namedParamDef, leading, trailing }) => {
        const rawParam = namedParamDef
          ? params.path[namedParamDef.paramName].value
          : "";
        return leading + rawParam + trailing;
      })
      .join("/");

  const hasQueryParams = Object.keys(params.query).length > 0;

  const query = hasQueryParams
    ? queryStringSerializer.stringify(params.query)
    : undefined;

  if (__DEV__) {
    if (hasQueryParams) {
      assert("query", [assert.type("string", "query", query)]);
    }
  }

  const state =
    Object.keys(params.state).length === 0
      ? undefined
      : Object.keys(params.state).reduce(
          (state, key) => ({
            ...state,
            [key]: params.state[key].value,
          }),
          {}
        );

  return { path, query, state };
}

function stringify(
  paramDef: UmbrellaParamDef,
  value: unknown,
  urlEncode: boolean
) {
  const result = paramDef["~internal"].valueSerializer.stringify(value);

  if (__DEV__) {
    assert("[ValueSerializer].stringify", [
      assert.type("string", "result", result),
    ]);
  }

  return urlEncode ? encodeURIComponent(result) : result;
}
