import { KeysMatching } from "./types";
import { TypeRouteError } from "./TypeRouteError";

type PathParamNames<TParamDefCollection> = KeysMatching<
  TParamDefCollection,
  { type: "path" }
>;

type PathParams<TParamDefCollection> = {
  [TParamName in PathParamNames<TParamDefCollection>]: string;
};

export type PathFn<TParamDefCollection> = (
  x: PathParams<TParamDefCollection>
) => string;

export type RouteDefBuilder<TParamDefCollection> = {
  params: TParamDefCollection;
  path: PathFn<TParamDefCollection>;

  extend<TExtensionParamDefCollection>(
    params: TExtensionParamDefCollection,
    path: PathFn<TExtensionParamDefCollection>
  ): RouteDefBuilder<TParamDefCollection & TExtensionParamDefCollection>;
};

export function defineRoute<TParamDefCollection>(
  params: TParamDefCollection,
  path: PathFn<TParamDefCollection>
) {
  const parent = { params, path };

  const routeDefBuilder: RouteDefBuilder<TParamDefCollection> = {
    ...parent,
    extend<TExtensionParamDefCollection>(
      params: TExtensionParamDefCollection,
      path: PathFn<TExtensionParamDefCollection>
    ) {
      const parentParamNames = Object.keys(parent.params);
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
          ...parent.params
        },
        x => {
          return (
            parent.path(
              filter(parentParamNames) as PathParams<TParamDefCollection>
            ) +
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
