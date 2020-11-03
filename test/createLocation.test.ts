import { createLocation } from "../src/createLocation";
import { defineRoute } from "../src/defineRoute";
import { buildPathDefs } from "../src/buildPathDefs";
import { getParamDefsOfType } from "../src/getParamDefsOfType";
import { createQueryStringSerializer } from "../src/createQueryStringSerializer";
import { param } from "../src/param";
import { UmbrellaParamDefCollection, GetRawPath } from "../src/types";

describe("createLocation", () => {
  test("exclude optional path param", () => {
    expectLocation(
      {
        name: param.path.string,
        version: param.path.optional.string,
      },
      (x) => `/software/${x.name}/${x.version}`,
      {
        name: "apache",
      }
    ).toEqual({
      fullPath: "/software/apache",
      path: "/software/apache",
      query: undefined,
      state: undefined,
    });
  });

  test("include optional query param", () => {
    expectLocation(
      {
        name: param.path.string,
        version: param.query.optional.string,
      },
      (x) => `/software/${x.name}`,
      {
        name: "apache",
        version: "2.1.4",
      }
    ).toEqual({
      fullPath: "/software/apache",
      path: "/software/apache",
      query: "version=2.1.4",
      state: undefined,
    });
  });

  test("include optional path param", () => {
    expectLocation(
      {
        name: param.path.string,
        version: param.path.optional.string,
      },
      (x) => `/software/${x.name}/${x.version}`,
      {
        name: "apache",
        version: "2.1.4",
      }
    ).toEqual({
      fullPath: "/software/apache/2.1.4",
      path: "/software/apache/2.1.4",
      query: undefined,
      state: undefined,
    });
  });

  test("state param", () => {
    expectLocation(
      {
        name: param.state.string,
      },
      () => `/foo`,
      {
        name: "apache",
      }
    ).toEqual({
      fullPath: "/foo",
      path: "/foo",
      query: undefined,
      state: { name: "apache" },
    });
  });

  test("array param", () => {
    expectLocation(
      {
        name: param.query.array.string,
      },
      () => `/foo`,
      {
        name: ["one", "two"],
      }
    ).toEqual({
      fullPath: "/foo",
      path: "/foo",
      query: "name[]=one,two",
      state: undefined,
    });
  });

  test.only("default param", () => {
    expectLocation(
      {
        value: param.query.optional.string.default("bar"),
      },
      () => `/foo`,
      {}
    ).toEqual({
      fullPath: "/foo",
      path: "/foo",
      query: undefined,
      state: undefined,
    });
  });
});

function expectLocation(
  paramDefCollection: UmbrellaParamDefCollection,
  path: GetRawPath,
  paramCollection: Record<string, unknown>
) {
  const builder = defineRoute(paramDefCollection, path);

  const pathDefs = buildPathDefs(
    "test",
    getParamDefsOfType("path", builder["~internal"].params),
    path
  );

  return expect(
    createLocation({
      paramCollection,
      paramDefCollection,
      pathDefs,
      queryStringSerializer: createQueryStringSerializer(),
      arraySeparator: ",",
      baseUrl: "/",
    })
  );
}
