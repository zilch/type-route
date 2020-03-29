import { param } from "./param";
import {
  buildPathDefinition,
  BuildPathDefinitionContext,
  PathDefinition
} from "./buildPathDefinition";
import { TypeRouteError } from "./TypeRouteError";

const testContext: BuildPathDefinitionContext = {
  routeName: "test"
};

describe("buildPathDefinition", () => {
  it("should work for simple example", () => {
    const actual = buildPathDefinition(
      testContext,
      {
        userId: param.path.string
      },
      x => `/user/${x.userId}`
    );

    const expected: PathDefinition = [
      {
        leading: "user",
        trailing: "",
        namedParameterDefinition: null
      },
      {
        leading: "",
        trailing: "",
        namedParameterDefinition: { name: "userId", ...param.path.string }
      }
    ];

    expect(actual).toEqual(expected);
  });

  it("should work with leading and trailing text around paramter", () => {
    const actual = buildPathDefinition(
      testContext,
      {
        userId: param.path.string
      },
      x => `/hello-${x.userId}-there`
    );

    const expected: PathDefinition = [
      {
        leading: "hello-",
        trailing: "-there",
        namedParameterDefinition: { name: "userId", ...param.path.string }
      }
    ];

    expect(actual).toEqual(expected);
  });

  it("should error if the path is an empty string", () => {
    expectTypeRouteError(TypeRouteError.Path_may_not_be_an_empty_string, () =>
      buildPathDefinition(testContext, {}, () => "")
    );
  });

  it("should error if the path does not start with a slash", () => {
    expectTypeRouteError(
      TypeRouteError.Path_must_start_with_a_forward_slash,
      () => buildPathDefinition(testContext, {}, () => "hello/there")
    );
  });

  it("should error if the path ends with a forward slash", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_end_with_a_forward_slash,
      () => buildPathDefinition(testContext, {}, () => "/hello/")
    );
  });

  it("should error if the path contains any empty segments", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_empty_segments,
      () => buildPathDefinition(testContext, {}, () => "/hello//there")
    );
  });

  it("should error if the path has more than one paramter per segment", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_have_at_most_one_parameter_per_segment,
      () =>
        buildPathDefinition(
          testContext,
          {
            first: param.path.string,
            second: param.path.number
          },
          x => `/hello/${x.first}-${x.second}/hi`
        )
    );
  });

  it("should error if a path parameter is used multiple times when building a path", () => {
    expectTypeRouteError(
      TypeRouteError.Path_parameters_may_not_be_used_more_than_once_when_building_a_path,
      () =>
        buildPathDefinition(
          testContext,
          { repeat: param.path.string },
          x => `/${x.repeat}/${x.repeat}`
        )
    );
  });

  it("should error if the $ or { or } or / character is used in a parameter name", () => {
    ["${hello/there}", "$hello", "{hello", "hello/there", "there}"].forEach(
      paramName => {
        expectTypeRouteError(
          TypeRouteError.Path_parameter_name_must_not_include_curly_brackets_dollar_signs_or_the_forward_slash_character,
          () =>
            buildPathDefinition(
              testContext,
              { hello: param.path.string, [paramName]: param.path.number },
              x => `/${x.hello}/${x[paramName]}`
            )
        );
      }
    );
  });

  it("should error if the path contains characters that must be url encoded", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded,
      () => buildPathDefinition(testContext, {}, () => `/hello%/there`)
    );
  });

  it("should error if a parameterized path contains characters that must be url encoded", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded,
      () =>
        buildPathDefinition(
          testContext,
          { hi: param.path.string },
          x => `/hello${x.hi}%/there`
        )
    );

    try {
      buildPathDefinition(
        testContext,
        { hi: param.path.string },
        x => `/#hello${x.hi}%/there`
      );
    } catch (error) {
      expect(error.message).toContain(
        "The path segment `#hello${x.hi}%` has the following invalid characters: #, %"
      );
    }
  });

  it("should error if optional path parameter contains text around the paramter", () => {
    expectTypeRouteError(
      TypeRouteError.Optional_path_parameters_may_not_have_any_text_around_the_parameter,
      () =>
        buildPathDefinition(
          testContext,
          { hello: param.path.optional.string },
          x => `/hi/hello-${x.hello}`
        )
    );
  });

  it("should error if there is more than one optional/trailing paramter", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_have_at_most_one_optional_or_trailing_parameter,
      () =>
        buildPathDefinition(
          testContext,
          { test: param.path.optional.number, hi: param.path.trailing.string },
          x => `/${x.test}/${x.hi}`
        )
    );
  });

  it("should error if an optional/trailing paramter appears anywhere but the last path segment", () => {
    expectTypeRouteError(
      TypeRouteError.Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment,
      () =>
        buildPathDefinition(
          testContext,
          { test: param.path.optional.number, hi: param.path.string },
          x => `/${x.test}/${x.hi}`
        )
    );
  });

  it("should error if not all path parameters are used", () => {
    expectTypeRouteError(
      TypeRouteError.All_path_parameters_must_be_used_in_path_construction,
      () =>
        buildPathDefinition(
          testContext,
          {
            test: param.path.optional.number,
            hi: param.path.string
          },
          x => `/${x.hi}`
        )
    );
  });
});

function expectTypeRouteError(
  error: typeof TypeRouteError[keyof typeof TypeRouteError],
  fn: () => void
) {
  expect(fn).toThrowError(new RegExp(`TR${error.errorCode}`));
}
