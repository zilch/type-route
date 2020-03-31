import { ParamDefCollection, Location, PathDef } from "./types";
import { queryStringSerializer } from "./queryStringSerializer";

export function createLocation(
  paramCollection: Record<string, unknown>,
  paramDefCollection: ParamDefCollection,
  pathDef: PathDef
): Location {
  const params = {
    path: {} as Record<string, string>,
    query: {} as Record<string, string>,
    state: {} as Record<string, string>
  };

  for (const paramName in paramCollection) {
    const paramDef = paramDefCollection[paramName];
    const paramValue = paramDef.valueSerializer.stringify(
      paramCollection[paramName]
    );
    const urlEncodeDefault = paramDef.type !== "state" && !paramDef.trailing;

    params[paramDef.type][paramName] =
      paramDef.valueSerializer.urlEncode ?? urlEncodeDefault
        ? encodeURIComponent(paramValue)
        : paramValue;
  }

  const path =
    "/" +
    pathDef
      .map(pathSegmentDef => {
        const rawParam = pathSegmentDef.namedParamDef
          ? params.path[pathSegmentDef.namedParamDef.name]
          : "";
        return pathSegmentDef.leading + rawParam + pathSegmentDef.trailing;
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
