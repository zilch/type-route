import {
  Route,
  RouteDefinition,
  ParameterDefinitionCollection,
  RouteDefinitionGroup
} from "./types";

export function createGroup<
  T extends (
    | RouteDefinition<string, ParameterDefinitionCollection>
    | RouteDefinitionGroup<
        RouteDefinition<string, ParameterDefinitionCollection>[]
      >)[]
>(groupItems: T): RouteDefinitionGroup<T> {
  const routeDefinitionNames: {
    [key: string]: true;
  } = {};

  groupItems.forEach(item => {
    if (isRouteDefinitionGroup(item)) {
      item.getRouteNames().forEach(name => {
        routeDefinitionNames[name] = true;
      });
    } else {
      routeDefinitionNames[item.name] = true;
    }
  });

  return {
    [".type"]: null as any,
    getRouteNames() {
      return Object.keys(routeDefinitionNames);
    },
    has(route: Route<any>): route is any {
      if (route.name === false) {
        return false;
      }

      const value = routeDefinitionNames[route.name];

      return value === true ? true : false;
    }
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
  return (
    typeof (groupItem as RouteDefinitionGroup<
      RouteDefinition<string, ParameterDefinitionCollection>[]
    >).getRouteNames === "function"
  );
}
