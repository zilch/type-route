type ErrorDefinition = {
  errorCode: number;
  getMessage?: (...args: any[]) => string[];
};

export type ParsePathErrorArgs = {
  routeName: string;
  path: string;
};

function getParsePathRouteNameMessage(routeName: string) {
  return `This problem occurred when building the route definition for the "${routeName}" route.`;
}

function getParsePathErrorMessage({ routeName, path }: ParsePathErrorArgs) {
  return [
    getParsePathRouteNameMessage(routeName),
    `The path was constructed as "${path}"`
  ];
}

export const TypeRouteError = buildErrorCollection({
  Path_may_not_be_an_empty_string: {
    errorCode: 1000,
    getMessage: getParsePathErrorMessage
  },

  Path_must_start_with_a_forward_slash: {
    errorCode: 1001,
    getMessage: getParsePathErrorMessage
  },

  Path_may_not_end_with_a_forward_slash: {
    errorCode: 1002,
    getMessage: getParsePathErrorMessage
  },

  Path_may_not_include_characters_that_must_be_URL_encoded: {
    errorCode: 1003,
    getMessage: (parsePathErrorArgs: ParsePathErrorArgs, segment: string) => {
      const invalidCharacters = segment
        .split("")
        .filter(character => character !== encodeURIComponent(character));

      return [
        ...getParsePathErrorMessage(parsePathErrorArgs),
        `The path segment "${segment}" has the following invalid characters: ${invalidCharacters.join(
          ", "
        )}`
      ];
    }
  },

  Path_may_not_include_empty_segments: {
    errorCode: 1004,
    getMessage: (parsePathErrorArgs: ParsePathErrorArgs) => {
      return [
        ...getParsePathErrorMessage(parsePathErrorArgs),
        "Empty segments can be spotted by finding the place in the path with two consecutive forward slashes '//'."
      ];
    }
  },

  Path_may_have_at_most_one_parameter_per_segment: {
    errorCode: 1005,
    getMessage: (
      parsePathErrorArgs: ParsePathErrorArgs,
      parameterNames: string[]
    ) => {
      return [
        ...getParsePathErrorMessage(parsePathErrorArgs),
        `A single segment of the path included the following parameters: ${parameterNames}`
      ];
    }
  },

  Path_parameters_may_not_be_used_more_than_once_when_building_a_path: {
    errorCode: 1005,
    getMessage: (
      parsePathErrorArgs: ParsePathErrorArgs,
      parameterName: string
    ) => {
      return [
        ...getParsePathErrorMessage(parsePathErrorArgs),
        `The parameter "${parameterName}" was used more than once.`
      ];
    }
  },

  Optional_path_parameters_may_not_have_any_text_around_the_parameter: {
    errorCode: 1006,
    getMessage: (
      parsePathErrorArgs: ParsePathErrorArgs,
      parameterName: string,
      leadingText: string,
      trailingText: string
    ) => {
      const messages = getParsePathErrorMessage(parsePathErrorArgs);

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
    getMessage(
      parsePathErrorArgs: ParsePathErrorArgs,
      numOptionalTrailingParameterNames: number
    ) {
      return [
        ...getParsePathErrorMessage(parsePathErrorArgs),
        `At most one optional/trailing parameter should be given but ${numOptionalTrailingParameterNames} were provided.`
      ];
    }
  },

  Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment: {
    errorCode: 1008,
    getMessage: getParsePathErrorMessage
  },

  All_path_parameters_must_be_used_in_path_construction: {
    errorCode: 1009,
    getMessage(
      parsePathErrorArgs: ParsePathErrorArgs,
      unusedParameters: string[]
    ) {
      return [
        ...getParsePathErrorMessage(parsePathErrorArgs),
        `The following parameters were not used: ${unusedParameters.join(", ")}`
      ];
    }
  },

  Path_parameter_name_must_not_include_the_greater_than_less_than_or_forward_slash_character: {
    errorCode: 1010,
    getMessage(routeName: string, parameterName: string) {
      return [
        getParsePathRouteNameMessage(routeName),
        `The < > or / character was used in this parameter name: ${parameterName}`
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
      create: (...args: any[]) => Error;
      equals: (error: Error) => boolean;
    }
  > = {};

  Object.keys(definitions).forEach(key => {
    const name = key.replace(/_/g, " ") + ".";
    const { errorCode, getMessage } = definitions[key];
    const messageTitle = `TR${errorCode} · ${name}`;

    errors[key] = {
      errorCode,
      name,
      create(...args: any[]) {
        const message = (getMessage?.(...args) ?? [])
          .map(message => `- ${message}`)
          .join("\n");

        const error = new Error(
          message ? `\n\n${messageTitle}\n\n${message}` : `\n\n${messageTitle}`
        );
        error.name = `(hopefully helpful 😄) TypeRouteError`;

        return error;
      },
      equals(error: Error) {
        return error.message.includes(messageTitle);
      }
    };
  });

  return errors as {
    [K in keyof T]: {
      create(...args: Parameters<T[K]["getMessage"]>): Error;
      name: K;
      errorCode: T[K]["errorCode"];
      equals(error: Error): boolean;
    };
  };
}
