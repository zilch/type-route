import {
  RouteDefinitionData,
  ParameterDefinitionCollection,
  PathFn
} from "./types";
import { validate } from "./validate";

export function defineRoute(path: string): RouteDefinitionData<{}>;
export function defineRoute<T extends ParameterDefinitionCollection>(
  params: T,
  path: PathFn<T>
): RouteDefinitionData<T>;
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

  const routeDefinitionData: RouteDefinitionData<{}> = {
    params,
    path
  };

  return routeDefinitionData;
}
