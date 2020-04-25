import { createLocation } from "../../createLocation";
import { defineRoute } from "../../defineRoute";
import { buildPathDef } from "../../buildPathDef";
import { getParamDefsOfType } from "../../getParamDefsOfType";
import { createQueryStringSerializer } from "../../createQueryStringSerializer";
import { param } from "../../param";
import { UmbrellaParamDefCollection, GetRawPath } from "../../types";

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
      path: "/software/apache",
      query: undefined,
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
      path: "/software/apache/2.1.4",
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
  const builder = defineRoute(
    {
      name: param.path.string,
      version: param.path.optional.string,
    },
    path
  );

  const pathDef = buildPathDef(
    "test",
    getParamDefsOfType("path", builder["~internal"].params),
    path
  );

  return expect(
    createLocation({
      paramCollection,
      paramDefCollection,
      pathDef,
      queryStringSerializer: createQueryStringSerializer(),
      arraySeparator: ",",
    })
  );
}
