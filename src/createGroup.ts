import {
  Route,
  RouteDefinition,
  ParameterDefinitionCollection,
  RouteDefinitionGroup,
} from "./types";
import { validate } from "./validate";

export function createGroup<T extends any[]>(
  groupItems: T
): RouteDefinitionGroup<T> {
  validate["createGroup"](Array.from(arguments));

  const routeDefinitionNames: {
    [key: string]: true;
  } = {};

  groupItems.forEach(
    (
      item:
        | RouteDefinition<string, ParameterDefinitionCollection>
        | RouteDefinitionGroup<
            RouteDefinition<string, ParameterDefinitionCollection>[]
          >
    ) => {
      if (isRouteDefinitionGroup(item)) {
        item.routeNames.forEach((name) => {
          routeDefinitionNames[name] = true;
        });
      } else {
        routeDefinitionNames[item.name] = true;
      }
    }
  );

  return {
    [".type"]: null as any,
    routeNames: Object.keys(routeDefinitionNames),
    has(route: Route<any>): route is any {
      validate["[group].has"](Array.from(arguments));

      if (route.name === false) {
        return false;
      }

      const value = routeDefinitionNames[route.name];

      return value === true ? true : false;
    },
  };
}

function isRouteDefinitionGroup(
  groupItem:
    | RouteDefinition<string, ParameterDefinitionCollection>
    | RouteDefinitionGroup<
        RouteDefinition<string, ParameterDefinitionCollection>[]
      >
): groupItem is RouteDefinitionGroup<
  RouteDefinition<string, ParameterDefinitionCollection>[]
> {
  return Array.isArray(
    (groupItem as RouteDefinitionGroup<
      RouteDefinition<string, ParameterDefinitionCollection>[]
    >).routeNames
  );
}
