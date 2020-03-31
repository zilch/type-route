import { ParamDefCollection } from "./param";
import { PathDef } from "./buildPathDef";
import { getPathMatch } from "./getPathMatch";
import { getStateMatch } from "./getStateMatch";
import { getQueryMatch } from "./getQueryMatch";
import { getParamDefsOfType } from "./getParamDefsOfType";

export type Location = {
  path: string;
  query?: string;
  state?: Record<string, string>;
};

type MatcherArgs = {
  pathDef: PathDef;
  params: ParamDefCollection;
};

export function createMatcher({ pathDef, params }: MatcherArgs) {
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
