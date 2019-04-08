import {
  RouteDefinitionBuilder,
  RouteDefinition,
  ParameterDefinitionCollection,
  PathParameterDefinitionCollection,
  QueryParameterDefinitionCollection,
  MatchFnParams,
  RouteParameters
} from "./types";
import qs from "querystringify";
import { getPathMatch } from "./getPathMatch";
import { getQueryMatch } from "./getQueryMatch";
import { getParsedPath } from "./getParsedPath";
import { validate } from "./validate";

export function getRouteDefinition(
  navigate: (href: string, replace?: boolean) => Promise<boolean>,
  builder: RouteDefinitionBuilder<{}>,
  name: string
) {
  const pathParameters = getPathParameters(builder.params);
  const queryParameters = getQueryParameters(builder.params);
  const parsedPath = getParsedPath(name, builder.path, builder.params);

  const routeDefinition: RouteDefinition<any, any> = {
    link,
    name,
    href,
    match,
    push(params) {
      validate["[route].push"](Array.from(arguments), builder.params);
      return navigate(href(params));
    },
    replace(params) {
      validate["[route].replace"](Array.from(arguments), builder.params);
      return navigate(href(params), true);
    },
    [".builder"]: builder
  };

  return routeDefinition;

  function link(params: Record<string, string | number> = {}) {
    validate["[route].link"](Array.from(arguments), builder.params);

    return {
      href: href(params),
      onClick: (event?: { preventDefault?: () => void }) => {
        if (event && event.preventDefault) {
          event.preventDefault();
        }

        navigate(href(params)).then(result => {
          console.log("navigate result", result);
        });
      }
    };
  }

  function href(params: Record<string, string | number> = {}) {
    validate["[route].href"](Array.from(arguments), builder.params);

    const pathParams: Record<string, string | number> = {};
    const queryParams: Record<string, string | number> = {};

    Object.keys(params).forEach(name => {
      if (pathParameters[name]) {
        pathParams[name] = params[name];
      } else {
        queryParams[name] = params[name];
      }
    });

    return (
      builder.path(pathParams) +
      qs.stringify(queryParams, Object.keys(queryParams).length > 0)
    );
  }

  function match({
    pathName,
    queryString = ""
  }: MatchFnParams): RouteParameters<{}> | false {
    validate["[route].match"](Array.from(arguments));

    const pathMatch = getPathMatch(pathName, parsedPath);
    const queryMatch = getQueryMatch(queryString, queryParameters);

    if (pathMatch === false || queryMatch === false) {
      return false;
    }

    return { ...pathMatch, ...queryMatch };
  }
}

function getPathParameters(parameters: ParameterDefinitionCollection) {
  const pathParameters: PathParameterDefinitionCollection = {};

  Object.keys(parameters).forEach(name => {
    const kind = parameters[name];
    if (kind === "path.param.number" || kind === "path.param.string") {
      pathParameters[name] = kind;
    }
  });

  return pathParameters;
}

function getQueryParameters(parameters: ParameterDefinitionCollection) {
  const queryParameters: QueryParameterDefinitionCollection = {};

  Object.keys(parameters).forEach(name => {
    const kind = parameters[name];
    if (
      kind === "query.param.number" ||
      kind === "query.param.number.optional" ||
      kind === "query.param.string" ||
      kind === "query.param.string.optional"
    ) {
      queryParameters[name] = kind;
    }
  });

  return queryParameters;
}
