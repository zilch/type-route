import { RouteDefinitionBuilder, PathFn, Param, ParamType } from "./types";

export function defineRoute<T>(
  params: T,
  path: PathFn<T>
): RouteDefinitionBuilder<T>;
export function defineRoute(path: string): RouteDefinitionBuilder<{}>;
export function defineRoute(...args: any[]) {
  return createRouteDefinitionBuilder(
    {
      params: {},
      path: () => ""
    },
    parseArguments(args)
  );
}

function createRouteDefinitionBuilder(
  parent: RouteDefinitionBuilderArgs,
  child: RouteDefinitionBuilderArgs
) {
  const params = {
    ...parent.params,
    ...child.params
  };

  const path = (x: Record<string, string>) =>
    parent.path(filterParams(x, Object.keys(parent.params))) +
    child.path(filterParams(x, Object.keys(child.params)));

  const routeDefinitionBuilder: RouteDefinitionBuilder<{}> = {
    _internal: {
      params,
      path
    },
    extend(...args: any[]) {
      return createRouteDefinitionBuilder(
        { params, path },
        parseArguments(args)
      );
    }
  };

  return routeDefinitionBuilder;
}

type RouteDefinitionBuilderArgs = {
  params: Record<string, Param<ParamType, "optional" | "required">>;
  path: (params: Record<string, string>) => string;
};

function parseArguments(args: any[]): RouteDefinitionBuilderArgs {
  if (args.length === 1) {
    return {
      params: {},
      path: () => args[0]
    };
  } else {
    return {
      params: args[0],
      path: args[1]
    };
  }
}

function filterParams(x: Record<string, string>, allowedKeys: string[]) {
  const filteredX: Record<string, string> = {};

  allowedKeys.forEach(key => {
    if (x[key]) {
      filteredX[key] = x[key];
    }
  });

  return filteredX;
}
