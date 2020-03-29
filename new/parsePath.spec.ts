import { param } from "./param";
import { parsePath } from "./parsePath";
import { TypeRouteError } from "./TypeRouteError";
import { PathPart } from "./types";

describe("parsePath", () => {
  it("should work for simple example", () => {
    const actual = parsePath(
      {
        userId: param.path.string
      },
      x => `/user/${x.userId}`,
      "test"
    );

    const expected: PathPart[] = [
      {
        leading: "user",
        trailing: ""
      },
      {
        leading: "",
        trailing: "",
        param: param.path.string
      }
    ];

    expect(actual).toEqual(expected);
  });

  it("should work with other parameters", () => {
    const actual = parsePath(
      {
        userId: param.path.string,
        hi: param.query.number
      },
      x => `/${x.userId}`,
      "test"
    );

    const expected: PathPart[] = [
      {
        leading: "",
        trailing: "",
        param: param.path.string
      }
    ];

    expect(actual).toEqual(expected);
  });

  it("should work with leading and trailing text around paramter", () => {
    const actual = parsePath(
      {
        userId: param.path.string
      },
      x => `/hello-${x.userId}-there`,
      "test"
    );

    const expected: PathPart[] = [
      {
        leading: "hello-",
        trailing: "-there",
        param: param.path.string
      }
    ];

    expect(actual).toEqual(expected);
  });

  it("should error if the path is an empty string", () => {
    expectTypeRouteError(TypeRouteError.Path_may_not_be_an_empty_string, () =>
      parsePath({}, () => "", "test")
    );
  });

  it("should error if the path does not start with a slash", () => {
    expectTypeRouteError(
      TypeRouteError.Path_must_start_with_a_forward_slash,
      () => parsePath({}, () => "hello/there", "test")
    );
  });

  it("should error if the path ends with a forward slash", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_end_with_a_forward_slash,
      () => parsePath({}, () => "/hello/", "test")
    );
  });

  it("should error if the path contains any empty segments", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_empty_segments,
      () => parsePath({}, () => "/hello//there", "test")
    );
  });

  it("should error if the path has more than one paramter per segment", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_have_at_most_one_parameter_per_segment,
      () =>
        parsePath(
          {
            first: param.path.string,
            second: param.path.number
          },
          x => `/hello/${x.first}-${x.second}/hi`,
          "test"
        )
    );
  });

  it("should error if a path parameter is used multiple times when building a path", () => {
    expectTypeRouteError(
      TypeRouteError.Path_parameters_may_not_be_used_more_than_once_when_building_a_path,
      () =>
        parsePath(
          { repeat: param.path.string },
          x => `/${x.repeat}/${x.repeat}`,
          "test"
        )
    );
  });

  it("should error if the < or > or / character is used in a parameter name", () => {
    ["<hello/there>", "<hello", "hello/there", "there>"].forEach(paramName => {
      expectTypeRouteError(
        TypeRouteError.Path_parameter_name_must_not_include_the_greater_than_less_than_or_forward_slash_character,
        () =>
          parsePath(
            { hello: param.path.string, [paramName]: param.path.number },
            x => `/${x.hello}/${x[paramName]}`,
            "test"
          )
      );
    });
  });

  it("should error if the path contains characters that must be url encoded", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_not_include_characters_that_must_be_URL_encoded,
      () => parsePath({}, () => `/hello%/there`, "test")
    );
  });

  it("should error if optional path parameter contains text around the paramter", () => {
    expectTypeRouteError(
      TypeRouteError.Optional_path_parameters_may_not_have_any_text_around_the_parameter,
      () =>
        parsePath(
          { hello: param.path.optional.string },
          x => `/hi/hello-${x.hello}`,
          "test"
        )
    );
  });

  it("should error if there is more than one optional/trailing paramter", () => {
    expectTypeRouteError(
      TypeRouteError.Path_may_have_at_most_one_optional_or_trailing_parameter,
      () =>
        parsePath(
          { test: param.path.optional.number, hi: param.path.trailing.string },
          x => `/${x.test}/${x.hi}`,
          "test"
        )
    );
  });

  it("should error if an optional/trailing paramter appears anywhere but the last path segment", () => {
    expectTypeRouteError(
      TypeRouteError.Optional_or_trailing_path_parameters_may_only_appear_in_the_last_path_segment,
      () =>
        parsePath(
          { test: param.path.optional.number, hi: param.path.string },
          x => `/${x.test}/${x.hi}`,
          "test"
        )
    );
  });

  it("should error if not all path parameters are used", () => {
    expectTypeRouteError(
      TypeRouteError.All_path_parameters_must_be_used_in_path_construction,
      () =>
        parsePath(
          {
            hello: param.query.number,
            test: param.path.optional.number,
            hi: param.path.string
          },
          x => `/${x.hi}`,
          "test"
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
