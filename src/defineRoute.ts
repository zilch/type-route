import {
  RouteDefinitionBuilder,
  ParameterDefinitionCollection,
  PathFn,
  PathParams
} from "./types";
import { validate, error } from "./validate";

export function defineRoute<T extends ParameterDefinitionCollection>(
  params: T,
  path: PathFn<T>
): RouteDefinitionBuilder<T>;
export function defineRoute(path: string): RouteDefinitionBuilder<{}>;
export function defineRoute(...args: any[]) {
  validate["defineRoute"](Array.from(arguments));

  return createRouteDefinitionBuilder({
    child: parseArgs(args),
    parent: {
      parameterDefinitions: {},
      buildPath: () => "/"
    }
  });
}

function createRouteDefinitionBuilder<T extends ParameterDefinitionCollection>({
  child,
  parent
}: {
  child: {
    parameterDefinitions: T;
    buildPath: PathFn<T>;
  };
  parent: {
    parameterDefinitions: T;
    buildPath: PathFn<T>;
  };
}): RouteDefinitionBuilder<T> {
  const parameterDefinitions = {
    ...child.parameterDefinitions,
    ...parent.parameterDefinitions
  };

  const buildPath: PathFn<T> = pathParams => {
    let parentPath = parent.buildPath(
      filterParams(pathParams, parent.parameterDefinitions)
    );

    let childPath = child.buildPath(
      filterParams(pathParams, child.parameterDefinitions)
    );

    if (typeof parentPath !== "string" || typeof childPath !== "string") {
      throw error(
        `\n\nError while building route definition.\nReturn type of \`path\` function should be \`string\`.\n`
      );
    }

    if (!childPath.startsWith("/")) {
      throw error(
        `\n\nAll paths must start with "/"\nYou provided "${childPath}"\n`
      );
    }

    if (childPath.trim() === "/") {
      childPath = "";
    }

    if (parentPath.endsWith("/")) {
      parentPath = parentPath.slice(0, -1);
    }

    return parentPath + childPath || "/";
  };

  const routeDefinitionBuilder: RouteDefinitionBuilder<T> = {
    params: parameterDefinitions,
    path: buildPath,
    extend(...args: any[]) {
      validate["[routeDefinitionBuilder].extend"](
        Array.from(arguments),
        parameterDefinitions
      );

      return createRouteDefinitionBuilder<T>({
        child: parseArgs<T>(args),
        parent: {
          parameterDefinitions,
          buildPath
        }
      });
    }
  };

  return routeDefinitionBuilder;
}

function parseArgs<T extends ParameterDefinitionCollection>(args: any[]) {
  let parameterDefinitions: T;
  let buildPath: PathFn<T>;

  if (args.length === 1) {
    parameterDefinitions = {} as T;
    buildPath = () => args[0];
  } else {
    parameterDefinitions = args[0];
    buildPath = args[1];
  }

  return { parameterDefinitions, buildPath };
}

function filterParams<T extends ParameterDefinitionCollection>(
  pathParams: Record<string, string>,
  parameterDefinitions: ParameterDefinitionCollection
) {
  const allowedKeys = Object.keys(parameterDefinitions);

  const filteredParams: Record<string, string> = {};

  allowedKeys.forEach(key => {
    if (pathParams[key]) {
      filteredParams[key] = pathParams[key];
    }
  });

  return filteredParams as PathParams<T>;
}
