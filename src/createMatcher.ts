import {
  Location,
  PathDef,
  QueryStringSerializer,
  UmbrellaParamDefCollection
} from "./types";
import { getPathMatch } from "./getPathMatch";
import { getStateMatch } from "./getStateMatch";
import { getQueryMatch } from "./getQueryMatch";
import { getParamDefsOfType } from "./getParamDefsOfType";

export function createMatcher({
  pathDef,
  params
}: {
  pathDef: PathDef;
  params: UmbrellaParamDefCollection;
}) {
  const queryParamDefCollection = getParamDefsOfType("query", params);
  const stateParamDefCollection = getParamDefsOfType("state", params);

  const defaultParams: Record<string, unknown> = {};

  Object.keys(params).forEach(paramName => {
    const param = params[paramName];
    if (param._internal.default === undefined) {
      return;
    }
    defaultParams[paramName] = param._internal.default;
  });

  return (location: Location, queryStringSerializer: QueryStringSerializer) => {
    const pathMatch = getPathMatch(location.path, pathDef);
    if (pathMatch === false) {
      return false;
    }

    const queryMatch = getQueryMatch(
      location.query,
      queryParamDefCollection,
      queryStringSerializer
    );
    if (queryMatch === false) {
      return false;
    }

    const stateMatch = getStateMatch(location.state, stateParamDefCollection);
    if (stateMatch === false) {
      return false;
    }

    return {
      params: {
        ...defaultParams,
        ...pathMatch.params,
        ...queryMatch.params,
        ...stateMatch.params
      },
      numExtraneousParams:
        pathMatch.numExtraneousParams +
        queryMatch.numExtraneousParams +
        stateMatch.numExtraneousParams
    };
  };
}
