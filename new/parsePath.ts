import { Param, ParamType, PathPart } from "./types";
import { TypeRouteError, ParsePathErrorArgs } from "./TypeRouteError";

export function parsePath(
  params: Record<string, Param<ParamType, "optional" | "required">>,
  pathFn: (params: Record<string, string>) => string,
  routeName: string
): PathPart[] {
  const pathParams = Object.keys(params)
    .map(pathParamName => {
      return { name: pathParamName, ...params[pathParamName] };
    })
    .filter(param => param._internal.paramType === "path");

  const preparedParams: Record<string, string> = {};

  pathParams.forEach(({ name }) => {
    if (name.includes("<") || name.includes(">") || name.includes("/")) {
      throw TypeRouteError.Path_parameter_name_must_not_include_the_greater_than_less_than_or_forward_slash_character.create(
        routeName,
        name
      );
    }
    preparedParams[name] = getPathParamId(name);
  });

  const path = pathFn(preparedParams);

  const parsePathErrorArgs: ParsePathErrorArgs = {
    path,
    routeName
  };

  if (path.length === 0) {
    throw TypeRouteError.Path_may_not_be_an_empty_string.create(
      parsePathErrorArgs
    );
  }

  if (path[0] !== "/") {
    throw TypeRouteError.Path_must_start_with_a_forward_slash.create(
      parsePathErrorArgs
    );
  }

  if (path.length === 1) {
    return [];
  }

  if (path.length > 0 && path[path.length - 1] === "/") {
    throw TypeRouteError.Path_may_not_end_with_a_forward_slash.create(
      parsePathErrorArgs
    );
  }

  const [_, ...pathSegments] = path.split("/");

  const usedPathParams = new Set<string>();
  const pathParts: PathPart[] = [];

  for (const segment of pathSegments) {
    if (segment.length === 0) {
      throw TypeRouteError.Path_may_not_include_empty_segments.create(
        parsePathErrorArgs
      );
    }

    let includedParam: typeof pathParams[0] | null = null;

    for (const param of pathParams) {
      if (segment.includes(getPathParamId(param.name))) {
        if (includedParam !== null) {
          throw TypeRouteError.Path_may_have_at_most_one_parameter_per_segment.create(
            parsePathErrorArgs,
            [param.name, includedParam.name]
          );
        }

        if (usedPathParams.has(param.name)) {
          throw TypeRouteError.Path_parameters_may_not_be_used_more_than_once_when_building_a_path.create(
            parsePathErrorArgs,
            param.name
          );
        }

        includedParam = param;
        usedPathParams.add(param.name);
      }
    }

    if (includedParam) {
      const [leading, trailing] = segment.split(
        getPathParamId(includedParam.name)
      );

      const syntheticSegment = `${leading}(path-parameter)${trailing}`;

      if (encodeURIComponent(syntheticSegment) !== syntheticSegment) {
        throw TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded.create(
          parsePathErrorArgs,
          syntheticSegment
        );
      }

      if (
        includedParam._internal.optionality === "optional" &&
        (leading !== "" || trailing !== "")
      ) {
        throw TypeRouteError.Optional_path_parameters_may_not_have_any_text_around_the_parameter.create(
          parsePathErrorArgs,
          includedParam.name,
          leading,
          trailing
        );
      }

      const { name: _, ...param } = includedParam;
      pathParts.push({ leading, trailing, param });
    } else {
      if (encodeURIComponent(segment) !== segment) {
        throw TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded.create(
          parsePathErrorArgs,
          segment
        );
      }

      pathParts.push({ leading: segment, trailing: "" });
    }
  }

  const numOptionalOrTrailingParams = pathParts.filter(
    part =>
      part.param?._internal.optionality === "optional" ||
      part.param?._internal.trailing
  ).length;

  if (numOptionalOrTrailingParams > 1) {
    throw TypeRouteError.Path_may_have_at_most_one_optional_or_trailing_parameter.create(
      parsePathErrorArgs,
      numOptionalOrTrailingParams
    );
  }

  const lastPathPartParam = pathParts[pathParts.length - 1].param;

  if (
    numOptionalOrTrailingParams === 1 &&
    lastPathPartParam._internal.optionality !== "optional" &&
    lastPathPartParam._internal.trailing === false
  ) {
    throw TypeRouteError.Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment.create(
      parsePathErrorArgs
    );
  }

  const unusedPathParams = pathParams
    .map(({ name }) => name)
    .filter(name => !usedPathParams.has(name));

  if (unusedPathParams.length > 0) {
    throw TypeRouteError.All_path_parameters_must_be_used_in_path_construction.create(
      parsePathErrorArgs,
      unusedPathParams
    );
  }

  return pathParts;
}

function getPathParamId(paramName: string) {
  return `<${paramName}>`;
}
