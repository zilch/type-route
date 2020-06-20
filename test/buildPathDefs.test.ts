import { param } from "../src/param";
import { buildPathDefs } from "../src/buildPathDefs";
import { TypeRouteError } from "../src/TypeRouteError";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { PathDef } from "../src/types";

describe("buildPathDef", () => {
  it("should work for simple example", () => {
    const actual = buildPathDefs(
      "test",
      {
        userId: param.path.string,
      },
      (p) => `/user/${p.userId}`
    );

    const expected: PathDef[] = [
      [
        {
          leading: "user",
          trailing: "",
          namedParamDef: null,
        },
        {
          leading: "",
          trailing: "",
          namedParamDef: { paramName: "userId", ...param.path.string },
        },
      ],
    ];

    expect(actual).toEqual(expected);
  });

  it("should work with leading and trailing text around paramter", () => {
    const actual = buildPathDefs(
      "test",
      {
        userId: param.path.string,
      },
      (p) => `/hello-${p.userId}-there`
    );

    const expected: PathDef[] = [
      [
        {
          leading: "hello-",
          trailing: "-there",
          namedParamDef: { paramName: "userId", ...param.path.string },
        },
      ],
    ];

    expect(actual).toEqual(expected);
  });

  it("should error if the path is an empty string", () => {
    expectTypeRouteError(TypeRouteError.Path_may_not_be_an_empty_string, () =>
      buildPathDefs("test", {}, () => "")
    );
  });

  it("should error if the path does not start with a slash", () => {
    expectTypeRouteError(
      TypeRouteError.Path_must_start_with_a_forward_slash,
      () => buildPathDefs("test", {}, () => "hello/there")
    );
  });

  it("should error if the path ends with a forward slash", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_end_with_a_forward_slash,
      () => buildPathDefs("test", {}, () => "/hello/")
    );
  });

  it("should error if the path contains any empty segments", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_empty_segments,
      () => buildPathDefs("test", {}, () => "/hello//there")
    );
  });

  it("should error if the path has more than one paramter per segment", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_have_at_most_one_parameter_per_segment,
      () =>
        buildPathDefs(
          "test",
          {
            first: param.path.string,
            second: param.path.number,
          },
          (p) => `/hello/${p.first}-${p.second}/hi`
        )
    );
  });

  it("should error if a path parameter is used multiple times when building a path", () => {
    expectTypeRouteError(
      TypeRouteError.Path_parameters_may_not_be_used_more_than_once_when_building_a_path,
      () =>
        buildPathDefs(
          "test",
          { repeat: param.path.string },
          (p) => `/${p.repeat}/${p.repeat}`
        )
    );
  });

  it("should error if the $ or { or } or / character is used in a parameter name", () => {
    // eslint-disable-next-line no-template-curly-in-string
    ["${hello/there}", "$hello", "{hello", "hello/there", "there}"].forEach(
      (paramName) => {
        expectTypeRouteError(
          TypeRouteError.Path_parameter_name_must_not_include_curly_brackets_dollar_signs_or_the_forward_slash_character,
          () =>
            buildPathDefs(
              "test",
              { hello: param.path.string, [paramName]: param.path.number },
              (p) => `/${p.hello}/${p[paramName]}`
            )
        );
      }
    );
  });

  it("should error if the path contains characters that must be url encoded", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded,
      () => buildPathDefs("test", {}, () => `/hello%/there`)
    );
  });

  it("should error if a parameterized path contains characters that must be url encoded", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded,
      () =>
        buildPathDefs(
          "test",
          { hi: param.path.string },
          (p) => `/hello${p.hi}%/there`
        )
    );

    try {
      buildPathDefs(
        "test",
        { hi: param.path.string },
        (p) => `/#hello${p.hi}%/there`
      );
    } catch (error) {
      expect(error.message).toContain(
        // eslint-disable-next-line no-template-curly-in-string
        "The path segment `#hello${p.hi}%` has the following invalid characters: #, %"
      );
    }
  });

  it("should error if optional path parameter contains text around the paramter", () => {
    expectTypeRouteError(
      TypeRouteError.Optional_path_parameters_may_not_have_any_text_around_the_parameter,
      () =>
        buildPathDefs(
          "test",
          { hello: param.path.optional.string },
          (p) => `/hi/hello-${p.hello}`
        )
    );

    expectTypeRouteError(
      TypeRouteError.Optional_path_parameters_may_not_have_any_text_around_the_parameter,
      () =>
        buildPathDefs(
          "test",
          { hello: param.path.optional.string },
          (p) => `/hi/${p.hello}-hello`
        )
    );
  });

  it("should error if there is more than one optional/trailing paramter", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_have_at_most_one_optional_or_trailing_parameter,
      () =>
        buildPathDefs(
          "test",
          { test: param.path.optional.number, hi: param.path.trailing.string },
          (p) => `/${p.test}/${p.hi}`
        )
    );
  });

  it("should error if an optional/trailing paramter appears anywhere but the last path segment", () => {
    expectTypeRouteError(
      TypeRouteError.Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment,
      () =>
        buildPathDefs(
          "test",
          { test: param.path.optional.number, hi: param.path.string },
          (p) => `/${p.test}/${p.hi}`
        )
    );
  });

  it("should error if not all path parameters are used", () => {
    expectTypeRouteError(
      TypeRouteError.All_path_parameters_must_be_used_in_path_construction,
      () =>
        buildPathDefs(
          "test",
          {
            test: param.path.optional.number,
            hi: param.path.string,
          },
          (p) => `/${p.hi}`
        )
    );
  });
});
