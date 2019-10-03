import {
  RouteDefinitionBuilder,
  RouteDefinition,
  ParameterDefinitionCollection,
  PathParameterDefinitionCollection,
  QueryParameterDefinitionCollection,
  MatchFnParams,
  RouteParameters,
  ClickEvent
} from "./types";
import qs from "querystringify";
import { getPathMatch } from "./getPathMatch";
import { getQueryMatch } from "./getQueryMatch";
import { getParsedPath } from "./getParsedPath";
import { validate } from "./validate";

export function buildRouteDefinition(
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
    [".builder"]: builder,
    [".type"]: null as any
  };

  return routeDefinition;

  function link(params: Record<string, string | number> = {}) {
    validate["[route].link"](Array.from(arguments), builder.params);

    return {
      href: href(params),
      onClick: (event: ClickEvent = {}) => {
        const isModifiedEvent = !!(
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        );

        const isSelfTarget =
          !event.target ||
          !event.target.target ||
          event.target.target === "_self";

        if (
          isSelfTarget && // Ignore everything but links with target self
          !event.defaultPrevented && // onClick prevented default
          event.button === 0 && // ignore everything but left clicks
          !isModifiedEvent // ignore clicks with modifier keys
        ) {
          if (event && event.preventDefault) {
            event.preventDefault();
          }

          navigate(href(params));
        }
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
        if (params[name] !== undefined) {
          queryParams[name] = params[name];
        }
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
