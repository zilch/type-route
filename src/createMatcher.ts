import {
  RouterLocation,
  PathDef,
  QueryStringSerializer,
  UmbrellaParamDefCollection,
} from "./types";
import { getPathMatch } from "./getPathMatch";
import { getStateMatch } from "./getStateMatch";
import { getQueryMatch } from "./getQueryMatch";
import { getParamDefsOfType } from "./getParamDefsOfType";

export function createMatcher({
  pathDefs,
  params,
}: {
  pathDefs: PathDef[];
  params: UmbrellaParamDefCollection;
}) {
  const queryParamDefCollection = getParamDefsOfType("query", params);
  const stateParamDefCollection = getParamDefsOfType("state", params);

  const defaultParams: Record<string, unknown> = {};

  Object.keys(params).forEach((paramName) => {
    const param = params[paramName];
    if (param["~internal"].default === undefined) {
      return;
    }
    defaultParams[paramName] = param["~internal"].default;
  });

  return ({
    routerLocation,
    arraySeparator,
    queryStringSerializer,
  }: {
    routerLocation: RouterLocation;
    queryStringSerializer: QueryStringSerializer;
    arraySeparator: string;
  }) => {
    if (routerLocation.path === undefined) {
      return false;
    }

    const pathMatch = getPathMatch({
      path: routerLocation.path,
      pathDefs,
      arraySeparator,
    });

    if (pathMatch === false) {
      return false;
    }

    const queryMatch = getQueryMatch(
      routerLocation.query,
      queryParamDefCollection,
      queryStringSerializer,
      arraySeparator
    );
    if (queryMatch === false) {
      return false;
    }

    const stateMatch = getStateMatch(
      routerLocation.state,
      stateParamDefCollection,
      arraySeparator
    );
    if (stateMatch === false) {
      return false;
    }

    return {
      primaryPath: pathMatch.primaryPath,
      params: {
        ...defaultParams,
        ...pathMatch.params,
        ...queryMatch.params,
        ...stateMatch.params,
      },
      numExtraneousParams:
        pathMatch.numExtraneousParams +
        queryMatch.numExtraneousParams +
        stateMatch.numExtraneousParams,
    };
  };
}
