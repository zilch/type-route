import { PathParameterDefinition, NamedPathParameterDefinition } from "./param";
import {
  TypeRouteError,
  BuildPathDefinitionErrorContext
} from "./TypeRouteError";

type PathDefinitionSegment = {
  leading: string;
  trailing: string;
  namedParameterDefinition: NamedPathParameterDefinition<unknown> | null;
};

type ParameterIdCollection = {
  [parameterName: string]: string;
};

type GetRawPath = (parameterIdCollection: ParameterIdCollection) => string;

export type PathDefinition = PathDefinitionSegment[];

export type BuildPathDefinitionContext = {
  routeName: string;
};

export function buildPathDefinition(
  context: BuildPathDefinitionContext,
  pathParameterDefinitionCollection: Record<
    string,
    PathParameterDefinition<unknown>
  >,
  getRawPath: GetRawPath
): PathDefinition {
  const namedPathParameterDefinitions = Object.keys(
    pathParameterDefinitionCollection
  ).map(name => {
    const namedPathParameterDefinition: NamedPathParameterDefinition<unknown> = {
      name,
      ...pathParameterDefinitionCollection[name]
    };

    return namedPathParameterDefinition;
  });

  const parameterIdCollection: ParameterIdCollection = {};

  namedPathParameterDefinitions.forEach(({ name }) => {
    if (
      name.includes("$") ||
      name.includes("{") ||
      name.includes("}") ||
      name.includes("/")
    ) {
      throw TypeRouteError.Path_parameter_name_must_not_include_curly_brackets_dollar_signs_or_the_forward_slash_character.create(
        context.routeName,
        name
      );
    }

    parameterIdCollection[name] = getParameterId(name);
  });

  const rawPath = getRawPath(parameterIdCollection);

  const errorContext: BuildPathDefinitionErrorContext = {
    rawPath,
    routeName: context.routeName
  };

  if (rawPath.length === 0) {
    throw TypeRouteError.Path_may_not_be_an_empty_string.create(errorContext);
  }

  if (rawPath[0] !== "/") {
    throw TypeRouteError.Path_must_start_with_a_forward_slash.create(
      errorContext
    );
  }

  if (rawPath.length === 1) {
    return [];
  }

  if (rawPath.length > 0 && rawPath[rawPath.length - 1] === "/") {
    throw TypeRouteError.Path_may_not_end_with_a_forward_slash.create(
      errorContext
    );
  }

  const rawPathSegments = rawPath.split("/").slice(1);

  const usedPathParameters = new Set<string>();
  const pathDefinitionSegments: PathDefinitionSegment[] = [];

  for (const rawSegment of rawPathSegments) {
    if (rawSegment.length === 0) {
      throw TypeRouteError.Path_may_not_include_empty_segments.create(
        errorContext
      );
    }

    let includedParameterDefinition: NamedPathParameterDefinition<
      unknown
    > | null = null;

    for (const parameterDefinition of namedPathParameterDefinitions) {
      if (rawSegment.includes(getParameterId(parameterDefinition.name))) {
        if (includedParameterDefinition !== null) {
          throw TypeRouteError.Path_may_have_at_most_one_parameter_per_segment.create(
            errorContext,
            [parameterDefinition.name, includedParameterDefinition.name]
          );
        }

        if (usedPathParameters.has(parameterDefinition.name)) {
          throw TypeRouteError.Path_parameters_may_not_be_used_more_than_once_when_building_a_path.create(
            errorContext,
            parameterDefinition.name
          );
        }

        includedParameterDefinition = parameterDefinition;
        usedPathParameters.add(parameterDefinition.name);
      }
    }

    if (includedParameterDefinition) {
      const [leading, trailing] = rawSegment.split(
        getParameterId(includedParameterDefinition.name)
      );

      if (
        encodeURIComponent(leading) !== leading ||
        encodeURIComponent(trailing) !== trailing
      ) {
        throw TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded.create(
          errorContext,
          {
            leading,
            parameterId: getParameterId(includedParameterDefinition.name),
            trailing
          }
        );
      }

      if (
        includedParameterDefinition.optional &&
        (leading !== "" || trailing !== "")
      ) {
        throw TypeRouteError.Optional_path_parameters_may_not_have_any_text_around_the_parameter.create(
          errorContext,
          includedParameterDefinition.name,
          leading,
          trailing
        );
      }

      pathDefinitionSegments.push({
        leading,
        trailing,
        namedParameterDefinition: includedParameterDefinition
      });
    } else {
      if (encodeURIComponent(rawSegment) !== rawSegment) {
        throw TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded.create(
          errorContext,
          { leading: rawSegment }
        );
      }

      pathDefinitionSegments.push({
        leading: rawSegment,
        trailing: "",
        namedParameterDefinition: null
      });
    }
  }

  const numOptionalOrTrailingParams = pathDefinitionSegments.filter(
    part =>
      part.namedParameterDefinition?.optional ||
      part.namedParameterDefinition?.trailing
  ).length;

  if (numOptionalOrTrailingParams > 1) {
    throw TypeRouteError.Path_may_have_at_most_one_optional_or_trailing_parameter.create(
      errorContext,
      numOptionalOrTrailingParams
    );
  }

  const lastPathSegmentParameterDefinition =
    pathDefinitionSegments[pathDefinitionSegments.length - 1]
      .namedParameterDefinition;

  if (
    numOptionalOrTrailingParams === 1 &&
    !lastPathSegmentParameterDefinition?.optional &&
    !lastPathSegmentParameterDefinition?.trailing
  ) {
    throw TypeRouteError.Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment.create(
      errorContext
    );
  }

  const unusedPathParameterDefinitions = namedPathParameterDefinitions
    .map(({ name }) => name)
    .filter(name => !usedPathParameters.has(name));

  if (unusedPathParameterDefinitions.length > 0) {
    throw TypeRouteError.All_path_parameters_must_be_used_in_path_construction.create(
      errorContext,
      unusedPathParameterDefinitions
    );
  }

  return pathDefinitionSegments;
}

function getParameterId(parameterName: string) {
  return "${x." + parameterName + "}";
}
