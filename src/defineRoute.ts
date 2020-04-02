import {
  PathFn,
  RouteDefBuilder,
  PathParams,
  UmbrellaParamDefCollection,
  UmbrellaRouteDefBuilder
} from "./types";
import { TypeRouteError } from "./TypeRouteError";

export function defineRoute<TParamDefCollection>(
  params: TParamDefCollection,
  path: PathFn<TParamDefCollection>
): RouteDefBuilder<TParamDefCollection>;
export function defineRoute(
  params: UmbrellaParamDefCollection,
  path: PathFn<UmbrellaParamDefCollection>
): UmbrellaRouteDefBuilder {
  const _internal = { params, path };

  const routeDefBuilder: UmbrellaRouteDefBuilder = {
    _internal,
    extend<TExtensionParamDefCollection>(
      params: TExtensionParamDefCollection,
      path: PathFn<TExtensionParamDefCollection>
    ) {
      const parentParamNames = Object.keys(_internal.params);
      const extensionParamNames = Object.keys(params);

      const duplicateParamNames = parentParamNames.filter(name =>
        extensionParamNames.includes(name)
      );

      if (duplicateParamNames.length > 0) {
        throw TypeRouteError.Extension_route_definition_parameter_names_may_not_be_the_same_as_base_route_definition_parameter_names.create(
          duplicateParamNames
        );
      }

      return defineRoute(
        {
          ...params,
          ..._internal.params
        },
        x => {
          return (
            _internal.path(filter(parentParamNames)) +
            path(
              filter(extensionParamNames) as PathParams<
                TExtensionParamDefCollection
              >
            )
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
