import {
  Location,
  PathDef,
  QueryStringSerializer,
  UmbrellaParamDefCollection,
} from "./types";
import { assert } from "./assert";

export function createLocation(
  paramCollection: Record<string, unknown>,
  paramDefCollection: UmbrellaParamDefCollection,
  pathDef: PathDef,
  queryStringSerializer: QueryStringSerializer
): Location {
  const params = {
    path: {} as Record<string, string>,
    query: {} as Record<string, string>,
    state: {} as Record<string, string>,
  };

  for (const paramName in paramCollection) {
    const paramValue = paramCollection[paramName];

    if (paramValue === undefined) {
      continue;
    }

    const paramDef = paramDefCollection[paramName];
    const result = paramDef["~internal"].valueSerializer.stringify(paramValue);

    assert("[ValueSerializer].stringify", [
      assert.type("string", "result", result),
    ]);

    const urlEncodeDefault =
      paramDef["~internal"].kind !== "state" && !paramDef["~internal"].trailing;

    params[paramDef["~internal"].kind][paramName] =
      paramDef["~internal"].valueSerializer.urlEncode ?? urlEncodeDefault
        ? encodeURIComponent(result)
        : result;
  }

  const path =
    "/" +
    pathDef
      .map(({ namedParamDef, leading, trailing }) => {
        const rawParam = namedParamDef
          ? params.path[namedParamDef.paramName]
          : "";
        return leading + rawParam + trailing;
      })
      .join("/");

  const hasQueryParams = Object.keys(params.query).length > 0;

  const query = hasQueryParams
    ? queryStringSerializer.stringify(params.query)
    : undefined;

  if (hasQueryParams) {
    assert("query", [assert.type("string", "query", query)]);
  }

  const state =
    Object.keys(params.state).length === 0 ? undefined : params.state;

  return { path, query, state };
}
