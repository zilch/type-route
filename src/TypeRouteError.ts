import { ErrorDef, BuildPathDefErrorContext } from "./types";
import { typeOf } from "./typeOf";

function getBuildPathDefRouteNameMessage(routeName: string) {
  return `This problem occurred when building the route definition for the "${routeName}" route.`;
}

function getBuildPathDefErrorMessage(context: BuildPathDefErrorContext) {
  return [
    getBuildPathDefRouteNameMessage(context.routeName),
    `The path was constructed as \`${context.rawPath}\``,
  ];
}

export const TypeRouteError = buildErrorCollection({
  Path_may_not_be_an_empty_string: {
    errorCode: 1000,
    getDetails: getBuildPathDefErrorMessage,
  },

  Path_must_start_with_a_forward_slash: {
    errorCode: 1001,
    getDetails: getBuildPathDefErrorMessage,
  },

  Path_may_not_end_with_a_forward_slash: {
    errorCode: 1002,
    getDetails: getBuildPathDefErrorMessage,
  },

  Path_may_not_include_characters_that_must_be_URL_encoded: {
    errorCode: 1003,
    getDetails: (
      context: BuildPathDefErrorContext,
      segment: {
        leading: string;
        paramId?: string;
        trailing?: string;
      }
    ) => {
      const leading = segment.leading;
      const trailing = segment.trailing ?? "";
      const paramId = segment.paramId ?? "";

      const invalidCharacters = (leading + trailing)
        .split("")
        .filter((character) => character !== encodeURIComponent(character));

      return [
        ...getBuildPathDefErrorMessage(context),
        `The path segment \`${
          leading + paramId + trailing
        }\` has the following invalid characters: ${invalidCharacters.join(
          ", "
        )}`,
      ];
    },
  },

  Path_may_not_include_empty_segments: {
    errorCode: 1004,
    getDetails: (context: BuildPathDefErrorContext) => {
      return [
        ...getBuildPathDefErrorMessage(context),
        "Empty segments can be spotted by finding the place in the path with two consecutive forward slashes '//'.",
      ];
    },
  },

  Path_may_have_at_most_one_parameter_per_segment: {
    errorCode: 1005,
    getDetails: (
      context: BuildPathDefErrorContext,
      parameterNames: string[]
    ) => {
      return [
        ...getBuildPathDefErrorMessage(context),
        `A single segment of the path included the following parameters: ${parameterNames}`,
        "Consider using ofType with a customer ValueSerializer for this scenario.",
      ];
    },
  },

  Path_parameters_may_not_be_used_more_than_once_when_building_a_path: {
    errorCode: 1005,
    getDetails: (context: BuildPathDefErrorContext, parameterName: string) => {
      return [
        ...getBuildPathDefErrorMessage(context),
        `The parameter "${parameterName}" was used more than once.`,
      ];
    },
  },

  Optional_path_parameters_may_not_have_any_text_around_the_parameter: {
    errorCode: 1006,
    getDetails: (
      context: BuildPathDefErrorContext,
      parameterName: string,
      leadingText: string,
      trailingText: string
    ) => {
      const messages = getBuildPathDefErrorMessage(context);

      if (leadingText) {
        messages.push(
          `The parameter "${parameterName}" cannot be preceded by "${leadingText}".`
        );
      }

      if (trailingText) {
        messages.push(
          `The parameter "${parameterName}" cannot be followed by "${trailingText}".`
        );
      }

      return messages;
    },
  },

  Path_may_have_at_most_one_optional_or_trailing_parameter: {
    errorCode: 1007,
    getDetails(
      context: BuildPathDefErrorContext,
      numOptionalTrailingParameterNames: number
    ) {
      return [
        ...getBuildPathDefErrorMessage(context),
        `At most one optional/trailing parameter should be given but ${numOptionalTrailingParameterNames} were provided.`,
      ];
    },
  },

  Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment: {
    errorCode: 1008,
    getDetails: getBuildPathDefErrorMessage,
  },

  All_path_parameters_must_be_used_in_path_construction: {
    errorCode: 1009,
    getDetails(context: BuildPathDefErrorContext, unusedParameters: string[]) {
      return [
        ...getBuildPathDefErrorMessage(context),
        `The following parameters were not used: ${unusedParameters.join(
          ", "
        )}`,
      ];
    },
  },

  Path_parameter_name_must_not_include_curly_brackets_dollar_signs_or_the_forward_slash_character: {
    errorCode: 1010,
    getDetails(routeName: string, paramName: string) {
      return [
        getBuildPathDefRouteNameMessage(routeName),
        `The $ { } or / character was used in this parameter name: ${paramName}`,
      ];
    },
  },

  Extension_route_definition_parameter_names_may_not_be_the_same_as_base_route_definition_parameter_names: {
    errorCode: 1011,
    getDetails(duplicateParameterNames: string[]) {
      return [
        `The following parameter names were used in both the base route definition and the extension: ${duplicateParameterNames.join(
          ", "
        )}`,
      ];
    },
  },

  Expected_type_does_not_match_actual_type: {
    errorCode: 1012,
    getDetails({
      context,
      value,
      valueName,
      expectedType,
      actualType,
    }: {
      context: string;
      valueName: string;
      expectedType: string | string[];
      actualType: string;
      value: any;
    }) {
      return [
        `Problem found with your usage of \`${context}\``,
        `\`${valueName}\` was expected to be of type \`${
          Array.isArray(expectedType) ? expectedType.join(" | ") : expectedType
        }\` but was of type \`${actualType}\``,
        `The actual value provided was: ${
          typeOf(value) === "object"
            ? "\n" +
              JSON.stringify(value, null, 2)
                .split("\n")
                .map((line) => `  ${line}`)
                .join("\n")
            : "`" + value + "`"
        }`,
      ];
    },
  },

  Expected_number_of_arguments_does_match_actual_number: {
    errorCode: 1013,
    getDetails({
      context,
      args,
      min,
      max,
    }: {
      context: string;
      args: any[];
      min: number;
      max: number;
    }) {
      return [
        `Problem found with your usage of \`${context}\``,
        `Expected ${min}${min === max ? "" : " - " + max} but received ${
          args.length
        } argument${args.length === 1 ? "" : "s"}`,
      ];
    },
  },

  Query_string_array_format_and_custom_query_string_serializer_may_not_both_be_provided: {
    errorCode: 1014,
    getDetails() {
      return [
        "You may not provide both options.arrayFormat.queryString and options.queryStringSerializer. These options are not compatible.",
      ];
    },
  },
});

function buildErrorCollection<
  TErrorDefCollection extends Record<string, ErrorDef>
>(definitions: TErrorDefCollection) {
  const errors: Record<
    string,
    {
      name: string;
      errorCode: number;
      create(...args: any[]): Error;
    }
  > = {};

  Object.keys(definitions).forEach((key) => {
    const name = key.replace(/_/g, " ") + ".";
    const { errorCode, getDetails } = definitions[key];
    const messageTitle = `TR${errorCode} · ${name}`;

    errors[key] = {
      errorCode,
      name,
      create(...args: any[]) {
        const message = (getDetails?.(...args) ?? [])
          .map((detail) => `- ${detail}`)
          .join("\n");

        const error = new Error(
          message
            ? `\n\n${messageTitle}\n\n${message}\n`
            : `\n\n${messageTitle}\n`
        );
        error.name = `(hopefully helpful 😄) TypeRouteError`;

        return error;
      },
    };
  });

  return errors as {
    [TName in keyof TErrorDefCollection]: {
      create(
        ...args: Parameters<TErrorDefCollection[TName]["getDetails"]>
      ): Error;
      name: TName;
      errorCode: TErrorDefCollection[TName]["errorCode"];
    };
  };
}
