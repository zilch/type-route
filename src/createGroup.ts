import { Route, RouteDefinition, ParameterDefinitionCollection } from "./types";

export function createGroup<
  T extends RouteDefinition<string, ParameterDefinitionCollection>[]
>(routeDefinitions: T) {
  const routeDefinitionNames: {
    [key: string]: true;
  } = {};

  routeDefinitions.forEach(({ name }) => (routeDefinitionNames[name] = true));

  return {
    [".routeDefinitions"]: routeDefinitions,
    has(route: Route<any>): route is Route<T[number]> {
      if (route.name === false) {
        return false;
      }

      const value = routeDefinitionNames[route.name];

      return value === true ? true : false;
    }
  };
}
