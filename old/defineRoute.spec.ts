import { defineRoute } from "./defineRoute";
import { ParameterDefinitionCollection, PathFn } from "./types";
import { createRouter } from "./createRouter";

describe("defineRoute", () => {
  it("should error for invalid arguments", () => {
    expect(() => {
      // @ts-ignore
      defineRoute();
    }).toThrowError();

    expect(() => {
      // @ts-ignore
      defineRoute({}, () => "", "extra");
    }).toThrowError();

    expect(() => {
      // @ts-ignore
      defineRoute(2);
    }).toThrowError();

    expect(() => {
      // @ts-ignore
      defineRoute({}, "");
    }).toThrowError();

    expect(() => {
      defineRoute(
        {
          // @ts-ignore
          test: "invalid"
        },
        () => ""
      );
    }).toThrowError();
  });

  it("should accept valid arguments", () => {
    expect(() => {
      defineRoute("/home");
    }).not.toThrowError();

    expect(() => {
      defineRoute(
        {
          p1: "path.param.number",
          p2: "path.param.string",
          q1: "query.param.number",
          q2: "query.param.number.optional",
          q3: "query.param.string",
          q4: "query.param.string.optional"
        },
        p => `/${p.p1}/${p.p2}/`
      );
    }).not.toThrowError();
  });

  it("should error on using path params more than once", () => {
    expect(() => {
      getRouteDefinition(
        {
          p1: "path.param.number"
        },
        p => `/${p.p1}/${p.p1}/`
      );
    }).toThrowError();
  });

  it("should error on using path params zero times", () => {
    expect(() => {
      getRouteDefinition(
        {
          p1: "path.param.number"
        },
        () => `/hello`
      );
    }).toThrowError();
  });
});

describe("defineRoute.getMatch", () => {
  it("should properly match for simple route", () => {
    const routeDefinition = getRouteDefinition({}, () => "/home");

    const match = routeDefinition.match({
      pathName: "/home"
    });

    expect(match).toEqual({});
  });

  it("should match for parameterized route", () => {
    const routeDefinition = getRouteDefinition(
      { userId: "path.param.string" },
      p => `/user/${p.userId}`
    );

    const match = routeDefinition.match({
      pathName: "/user/abc"
    });

    expect(match).toEqual({
      userId: "abc"
    });
  });

  it("should match for parameterized route at beginning", () => {
    const routeDefinition = getRouteDefinition(
      { userId: "path.param.string" },
      p => `/${p.userId}/hi`
    );

    const match = routeDefinition.match({
      pathName: "/abc/hi"
    });

    expect(match).toEqual({
      userId: "abc"
    });
  });

  it("should match for parameterized route not at end", () => {
    const routeDefinition = getRouteDefinition(
      { userId: "path.param.string" },
      p => `/user/${p.userId}/hi`
    );

    const match = routeDefinition.match({
      pathName: "/user/abc/hi"
    });

    expect(match).toEqual({
      userId: "abc"
    });
  });

  it("should match for path.param.number route", () => {
    const routeDefinition = getRouteDefinition(
      { someNum: "path.param.number" },
      p => `/something/${p.someNum}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/123/hello"
    });

    expect(match).toEqual({
      someNum: 123
    });
  });

  it("should match negative number", () => {
    const routeDefinition = getRouteDefinition(
      { someNum: "path.param.number" },
      p => `/path/${p.someNum}`
    );

    const match = routeDefinition.match({
      pathName: "/path/-123.5",
      queryString: ""
    });

    expect(match).toEqual({
      someNum: -123.5
    });
  });

  it("should not match for path.param.number if value is not a number", () => {
    const routeDefinition = getRouteDefinition(
      { someNum: "path.param.number" },
      p => `/something/${p.someNum}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/a123/hello"
    });

    expect(match).toBe(false);
  });

  it("should not for route with search string if no queries params given", () => {
    const routeDefinition = getRouteDefinition(
      { someNum: "path.param.number" },
      p => `/something/${p.someNum}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/123/hello",
      queryString: "hello=hi"
    });

    expect(match).toBe(false);
  });

  it("should match route with query params", () => {
    const routeDefinition = getRouteDefinition(
      {
        a: "path.param.string",
        b: "query.param.string"
      },
      p => `/something/${p.a}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/hi/hello",
      queryString: "b=hello"
    });

    expect(match).toEqual({
      a: "hi",
      b: "hello"
    });
  });

  it("should match route with numeric query params", () => {
    const routeDefinition = getRouteDefinition(
      {
        a: "path.param.string",
        b: "query.param.number"
      },
      p => `/something/${p.a}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/hi/hello",
      queryString: "b=123.5"
    });

    expect(match).toEqual({
      a: "hi",
      b: 123.5
    });
  });

  it("should match query params with type mismatch", () => {
    const routeDefinition = getRouteDefinition(
      {
        a: "path.param.string",
        b: "query.param.number"
      },
      p => `/something/${p.a}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/hi/hello",
      queryString: "b=hi"
    });

    expect(match).toBe(false);
  });

  it("should not match route with extra query params", () => {
    const routeDefinition = getRouteDefinition(
      {
        a: "path.param.string",
        b: "query.param.string"
      },
      p => `/something/${p.a}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/hi/hello",
      queryString: "b=hello&c=what"
    });

    expect(match).toBe(false);
  });

  it("should allow omission of optional query params", () => {
    const routeDefinition = getRouteDefinition(
      {
        a: "path.param.string",
        b: "query.param.string",
        c: "query.param.string.optional"
      },
      p => `/something/${p.a}/hello`
    );

    const match = routeDefinition.match({
      pathName: "/something/hi/hello",
      queryString: "b=hello"
    });

    expect(match).toEqual({
      a: "hi",
      b: "hello"
    });
  });
});

export function getRouteDefinition<T extends ParameterDefinitionCollection>(
  params: T,
  path: PathFn<T>
) {
  const { routes } = createRouter({ def: defineRoute(params, path) });
  return routes.def;
}
