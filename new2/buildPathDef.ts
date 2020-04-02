import { TypeRouteError } from "./TypeRouteError";
import {
  PathParamDef,
  NamedPathParamDef,
  BuildPathDefErrorContext,
  GetRawPath,
  PathDef,
  ParamIdCollection
} from "./types";

export function buildPathDef(
  routeName: string,
  pathParamDefCollection: Record<string, PathParamDef>,
  getRawPath: GetRawPath
): PathDef {
  const namedPathParamDefs = Object.keys(pathParamDefCollection).map(
    paramName => {
      const namedPathParameterDefinition: NamedPathParamDef = {
        paramName,
        ...pathParamDefCollection[paramName]
      };

      return namedPathParameterDefinition;
    }
  );

  const paramIdCollection: ParamIdCollection = {};

  namedPathParamDefs.forEach(({ paramName }) => {
    if (
      paramName.includes("$") ||
      paramName.includes("{") ||
      paramName.includes("}") ||
      paramName.includes("/")
    ) {
      throw TypeRouteError.Path_parameter_name_must_not_include_curly_brackets_dollar_signs_or_the_forward_slash_character.create(
        routeName,
        paramName
      );
    }

    paramIdCollection[paramName] = getParamId(paramName);
  });

  const rawPath = getRawPath(paramIdCollection);

  const errorContext: BuildPathDefErrorContext = {
    rawPath,
    routeName
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

  const usedPathParams = new Set<string>();
  const pathDef: PathDef = [];

  for (const rawSegment of rawPathSegments) {
    if (rawSegment.length === 0) {
      throw TypeRouteError.Path_may_not_include_empty_segments.create(
        errorContext
      );
    }

    let includedParamDef: NamedPathParamDef<unknown> | null = null;

    for (const paramDef of namedPathParamDefs) {
      if (rawSegment.includes(getParamId(paramDef.paramName))) {
        if (includedParamDef !== null) {
          throw TypeRouteError.Path_may_have_at_most_one_parameter_per_segment.create(
            errorContext,
            [paramDef.paramName, includedParamDef.paramName]
          );
        }

        if (usedPathParams.has(paramDef.paramName)) {
          throw TypeRouteError.Path_parameters_may_not_be_used_more_than_once_when_building_a_path.create(
            errorContext,
            paramDef.paramName
          );
        }

        includedParamDef = paramDef;
        usedPathParams.add(paramDef.paramName);
      }
    }

    if (includedParamDef) {
      const [leading, trailing] = rawSegment.split(
        getParamId(includedParamDef.paramName)
      );

      if (
        encodeURIComponent(leading) !== leading ||
        encodeURIComponent(trailing) !== trailing
      ) {
        throw TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded.create(
          errorContext,
          {
            leading,
            paramId: getParamId(includedParamDef.paramName),
            trailing
          }
        );
      }

      if (includedParamDef.optional && (leading !== "" || trailing !== "")) {
        throw TypeRouteError.Optional_path_parameters_may_not_have_any_text_around_the_parameter.create(
          errorContext,
          includedParamDef.paramName,
          leading,
          trailing
        );
      }

      pathDef.push({
        leading,
        trailing,
        namedParamDef: includedParamDef
      });
    } else {
      if (encodeURIComponent(rawSegment) !== rawSegment) {
        throw TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded.create(
          errorContext,
          { leading: rawSegment }
        );
      }

      pathDef.push({
        leading: rawSegment,
        trailing: "",
        namedParamDef: null
      });
    }
  }

  const numOptionalOrTrailingParams = pathDef.filter(
    part => part.namedParamDef?.optional || part.namedParamDef?.trailing
  ).length;

  if (numOptionalOrTrailingParams > 1) {
    throw TypeRouteError.Path_may_have_at_most_one_optional_or_trailing_parameter.create(
      errorContext,
      numOptionalOrTrailingParams
    );
  }

  const lastPathSegmentParameterDefinition =
    pathDef[pathDef.length - 1].namedParamDef;

  if (
    numOptionalOrTrailingParams === 1 &&
    !lastPathSegmentParameterDefinition?.optional &&
    !lastPathSegmentParameterDefinition?.trailing
  ) {
    throw TypeRouteError.Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment.create(
      errorContext
    );
  }

  const unusedPathParameterDefinitions = namedPathParamDefs
    .map(({ paramName: name }) => name)
    .filter(name => !usedPathParams.has(name));

  if (unusedPathParameterDefinitions.length > 0) {
    throw TypeRouteError.All_path_parameters_must_be_used_in_path_construction.create(
      errorContext,
      unusedPathParameterDefinitions
    );
  }

  return pathDef;
}

function getParamId(parameterName: string) {
  return "${x." + parameterName + "}";
}
