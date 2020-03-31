import { createMatcher, Location } from "./createMatcher";
import { defineRoute, PathFn } from "./defineRoute";
import { param, ParamDefCollection } from "./param";
import { buildPathDef } from "./buildPathDef";
import { getParamDefsOfType } from "./getParamDefsOfType";

describe("createMatcher", () => {
  it("should do a simple match", () => {
    expectMatch(
      {
        userId: param.query.string
      },
      () => `/user`,
      {
        path: "/user",
        query: "userId=hello"
      }
    ).toEqual({
      userId: "hello"
    });
  });

  it("should allow extraneous state", () => {
    expectMatch(
      {
        userId: param.query.string
      },
      () => `/user`,
      {
        path: "/user",
        query: "userId=hello",
        state: {
          hello: "test"
        }
      }
    ).toEqual({
      userId: "hello"
    });
  });

  it("should not allow extraneous query params", () => {
    expectMatch(
      {
        userId: param.query.string
      },
      () => `/user`,
      {
        path: "/user",
        query: "userId=hello&nice=day",
        state: {
          hello: "test"
        }
      }
    ).toEqual(false);
  });
});

function expectMatch(
  paramDefs: ParamDefCollection,
  path: PathFn<ParamDefCollection>,
  location: Location
) {
  const route = defineRoute(paramDefs, path);

  const match = createMatcher({
    params: route.params,
    pathDef: buildPathDef(
      { routeName: "test" },
      getParamDefsOfType("path", route.params),
      route.path
    )
  });

  return expect(match(location));
}
