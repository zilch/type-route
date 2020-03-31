import { ParamDefCollection, Location, PathDef } from "./types";
import { getPathMatch } from "./getPathMatch";
import { getStateMatch } from "./getStateMatch";
import { getQueryMatch } from "./getQueryMatch";
import { getParamDefsOfType } from "./getParamDefsOfType";

export function createMatcher({
  pathDef,
  params
}: {
  pathDef: PathDef;
  params: ParamDefCollection;
}) {
  const queryParamDefCollection = getParamDefsOfType("query", params);
  const stateParamDefCollection = getParamDefsOfType("state", params);

  return (location: Location) => {
    const pathMatch = getPathMatch(location.path, pathDef);
    if (pathMatch === false) {
      return false;
    }

    const queryMatch = getQueryMatch(location.query, queryParamDefCollection);
    if (queryMatch === false) {
      return false;
    }

    const stateMatch = getStateMatch(location.state, stateParamDefCollection);
    if (stateMatch === false) {
      return false;
    }

    return { ...pathMatch, ...queryMatch, ...stateMatch };
  };
}
