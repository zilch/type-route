type ErrorDefinition = {
  errorCode: number;
  getDetails: (...args: any[]) => string[];
};

export type BuildPathDefinitionErrorContext = {
  routeName: string;
  rawPath: string;
};

function getBuildPathDefinitionRouteNameMessage(routeName: string) {
  return `This problem occurred when building the route definition for the "${routeName}" route.`;
}

function getBuildPathDefinitionErrorMessage(
  context: BuildPathDefinitionErrorContext
) {
  return [
    getBuildPathDefinitionRouteNameMessage(context.routeName),
    `The path was constructed as \`${context.rawPath}\``
  ];
}

export const TypeRouteError = buildErrorCollection({
  Path_may_not_be_an_empty_string: {
    errorCode: 1000,
    getDetails: getBuildPathDefinitionErrorMessage
  },

  Path_must_start_with_a_forward_slash: {
    errorCode: 1001,
    getDetails: getBuildPathDefinitionErrorMessage
  },

  Path_may_not_end_with_a_forward_slash: {
    errorCode: 1002,
    getDetails: getBuildPathDefinitionErrorMessage
  },

  Path_may_not_include_characters_that_must_be_URL_encoded: {
    errorCode: 1003,
    getDetails: (
      context: BuildPathDefinitionErrorContext,
      segment: {
        leading: string;
        parameterId?: string;
        trailing?: string;
      }
    ) => {
      const leading = segment.leading;
      const trailing = segment.trailing ?? "";
      const parameterId = segment.parameterId ?? "";

      const invalidCharacters = (leading + trailing)
        .split("")
        .filter(character => character !== encodeURIComponent(character));

      return [
        ...getBuildPathDefinitionErrorMessage(context),
        `The path segment \`${
          leading + parameterId + trailing
        }\` has the following invalid characters: ${invalidCharacters.join(
          ", "
        )}`
      ];
    }
  },

  Path_may_not_include_empty_segments: {
    errorCode: 1004,
    getDetails: (context: BuildPathDefinitionErrorContext) => {
      return [
        ...getBuildPathDefinitionErrorMessage(context),
        "Empty segments can be spotted by finding the place in the path with two consecutive forward slashes '//'."
      ];
    }
  },

  Path_may_have_at_most_one_parameter_per_segment: {
    errorCode: 1005,
    getDetails: (
      context: BuildPathDefinitionErrorContext,
      parameterNames: string[]
    ) => {
      return [
        ...getBuildPathDefinitionErrorMessage(context),
        `A single segment of the path included the following parameters: ${parameterNames}`
      ];
    }
  },

  Path_parameters_may_not_be_used_more_than_once_when_building_a_path: {
    errorCode: 1005,
    getDetails: (
      context: BuildPathDefinitionErrorContext,
      parameterName: string
    ) => {
      return [
        ...getBuildPathDefinitionErrorMessage(context),
        `The parameter "${parameterName}" was used more than once.`
      ];
    }
  },

  Optional_path_parameters_may_not_have_any_text_around_the_parameter: {
    errorCode: 1006,
    getDetails: (
      context: BuildPathDefinitionErrorContext,
      parameterName: string,
      leadingText: string,
      trailingText: string
    ) => {
      const messages = getBuildPathDefinitionErrorMessage(context);

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
    }
  },

  Path_may_have_at_most_one_optional_or_trailing_parameter: {
    errorCode: 1007,
    getDetails(
      context: BuildPathDefinitionErrorContext,
      numOptionalTrailingParameterNames: number
    ) {
      return [
        ...getBuildPathDefinitionErrorMessage(context),
        `At most one optional/trailing parameter should be given but ${numOptionalTrailingParameterNames} were provided.`
      ];
    }
  },

  Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment: {
    errorCode: 1008,
    getDetails: getBuildPathDefinitionErrorMessage
  },

  All_path_parameters_must_be_used_in_path_construction: {
    errorCode: 1009,
    getDetails(
      context: BuildPathDefinitionErrorContext,
      unusedParameters: string[]
    ) {
      return [
        ...getBuildPathDefinitionErrorMessage(context),
        `The following parameters were not used: ${unusedParameters.join(", ")}`
      ];
    }
  },

  Path_parameter_name_must_not_include_curly_brackets_dollar_signs_or_the_forward_slash_character: {
    errorCode: 1010,
    getDetails(routeName: string, parameterName: string) {
      return [
        getBuildPathDefinitionRouteNameMessage(routeName),
        `The $ { } or / character was used in this parameter name: ${parameterName}`
      ];
    }
  }
});

function buildErrorCollection<T extends Record<string, ErrorDefinition>>(
  definitions: T
) {
  const errors: Record<
    string,
    {
      name: string;
      errorCode: number;
      create(...args: any[]): Error;
    }
  > = {};

  Object.keys(definitions).forEach(key => {
    const name = key.replace(/_/g, " ") + ".";
    const { errorCode, getDetails } = definitions[key];
    const messageTitle = `TR${errorCode} · ${name}`;

    errors[key] = {
      errorCode,
      name,
      create(...args: any[]) {
        const message = (getDetails?.(...args) ?? [])
          .map(detail => `- ${detail}`)
          .join("\n");

        const error = new Error(
          message ? `\n\n${messageTitle}\n\n${message}` : `\n\n${messageTitle}`
        );
        error.name = `(hopefully helpful 😄) TypeRouteError`;

        return error;
      }
    };
  });

  return errors as {
    [K in keyof T]: {
      create(...args: Parameters<T[K]["getDetails"]>): Error;
      name: K;
      errorCode: T[K]["errorCode"];
    };
  };
}
