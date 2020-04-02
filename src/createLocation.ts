import {
  Location,
  PathDef,
  QueryStringSerializer,
  UmbrellaParamDefCollection
} from "./types";

export function createLocation(
  paramCollection: Record<string, unknown>,
  paramDefCollection: UmbrellaParamDefCollection,
  pathDef: PathDef,
  queryStringSerializer: QueryStringSerializer
): Location {
  const params = {
    path: {} as Record<string, string>,
    query: {} as Record<string, string>,
    state: {} as Record<string, string>
  };

  for (const paramName in paramCollection) {
    const paramDef = paramDefCollection[paramName];
    const paramValue = paramDef._internal.valueSerializer.stringify(
      paramCollection[paramName]
    );
    const urlEncodeDefault =
      paramDef._internal.type !== "state" && !paramDef._internal.trailing;

    params[paramDef._internal.type][paramName] =
      paramDef._internal.valueSerializer.urlEncode ?? urlEncodeDefault
        ? encodeURIComponent(paramValue)
        : paramValue;
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

  const query =
    Object.keys(params.query).length === 0
      ? undefined
      : queryStringSerializer.stringify(params.query);

  const state =
    Object.keys(params.state).length === 0 ? undefined : params.state;

  return { path, query, state };
}
