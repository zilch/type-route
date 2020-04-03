import {
  PathFn,
  RouteDefBuilder,
  UmbrellaParamDefCollection,
  UmbrellaRouteDefBuilder
} from "./types";
import { TypeRouteError } from "./TypeRouteError";
import { assert } from "./assert";

export function defineRoute<TParamDefCollection>(
  params: TParamDefCollection,
  path: PathFn<TParamDefCollection>
): RouteDefBuilder<TParamDefCollection>;
export function defineRoute(path: string): RouteDefBuilder<{}>;
export function defineRoute(...args: any[]): UmbrellaRouteDefBuilder {
  assertDefineRouteOrExtendArgs("defineRoute", args);

  const parent = parseArgs(args);

  const routeDefBuilder: UmbrellaRouteDefBuilder = {
    _internal: {
      type: "RouteDefBuilder",
      params: parent.params,
      path: parent.path
    },
    extend(...args: any[]) {
      assertDefineRouteOrExtendArgs("extend", args);

      const { params, path } = parseArgs(args);

      const parentParamNames = Object.keys(parent.params);
      const extensionParamNames = Object.keys(params);

      const duplicateParamNames = parentParamNames.filter(
        name => extensionParamNames.indexOf(name) >= 0
      );

      if (duplicateParamNames.length > 0) {
        throw TypeRouteError.Extension_route_definition_parameter_names_may_not_be_the_same_as_base_route_definition_parameter_names.create(
          duplicateParamNames
        );
      }

      return defineRoute(
        {
          ...params,
          ...parent.params
        },
        x => {
          return (
            parent.path(filter(parentParamNames)) +
            path(filter(extensionParamNames))
          );

          function filter(allowedKeys: string[]) {
            const filteredX: Record<string, string> = {};

            allowedKeys.forEach(key => {
              filteredX[key] = (x as Record<string, string>)[key];
            });

            return filteredX;
          }
        }
      );
    }
  };

  return routeDefBuilder;
}

function assertDefineRouteOrExtendArgs(functionName: string, args: any[]) {
  if (args.length === 1) {
    assert(functionName, [assert.type("string", "path", args[0])]);
  } else {
    assert(functionName, [
      assert.numArgs(args, 1, 2),
      assert.collectionOfType("ParamDef", "params", args[0]),
      assert.type("function", "path", args[1])
    ]);
  }
}

function parseArgs(
  args: any[]
): {
  params: UmbrellaParamDefCollection;
  path: PathFn<UmbrellaParamDefCollection>;
} {
  return args.length === 1
    ? {
        params: {},
        path: () => args[0]
      }
    : {
        params: args[0],
        path: args[1]
      };
}
