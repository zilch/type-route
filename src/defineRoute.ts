import {
  RouteDefinitionBuilder,
  ParameterDefinitionCollection,
  PathFn
} from "./types";
import { validate } from "./validate";

export function defineRoute<T extends ParameterDefinitionCollection>(
  params: T,
  path: PathFn<T>
): RouteDefinitionBuilder<T>;
export function defineRoute(path: string): RouteDefinitionBuilder<{}>;
export function defineRoute(...args: any[]) {
  validate["defineRoute"](Array.from(arguments));

  let params: ParameterDefinitionCollection;
  let path: PathFn<{}>;

  if (args.length === 1) {
    params = {};
    path = () => args[0];
  } else {
    params = args[0];
    path = args[1];
  }

  const routeDefinitionData: RouteDefinitionBuilder<{}> = {
    params,
    path
  };

  return routeDefinitionData;
}
