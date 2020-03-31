import { buildPathDef } from "./buildPathDef";
import { getPathMatch } from "./getPathMatch";
import { param } from "./param";
import { noMatch } from "./constants";
import { PathParamDef, GetRawPath } from "./types";

describe("getPathMatch", () => {
  it("should work for simple case", () => {
    expectGetPathMatch(
      {
        userId: param.path.string
      },
      x => `/user/${x.userId}`,
      "/user/foo"
    ).toEqual({
      userId: "foo"
    });
  });

  it("should work for optional param", () => {
    expectGetPathMatch(
      {
        userId: param.path.optional.string
      },
      x => `/user/${x.userId}`,
      "/user"
    ).toEqual({});
  });

  it("should work for trailing param", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.optional.string
      },
      x => `/docs/${x.docsPage}`,
      "/docs/this/is/the/page"
    ).toEqual({
      docsPage: "/this/is/the/page"
    });
  });

  it("should work for trailing param without match", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.optional.string
      },
      x => `/docs/${x.docsPage}`,
      "/docs"
    ).toEqual({});
  });

  it("should not match when trailing param is required", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.string
      },
      x => `/docs/${x.docsPage}`,
      "/docs"
    ).toEqual(false);
  });

  it("should match when trailing has leading and trailing", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.string
      },
      x => `/docs/hello-${x.docsPage}-there`,
      "/docs/hello-today/again-there"
    ).toEqual({
      docsPage: "today/again"
    });
  });

  it("should match numeric param", () => {
    expectGetPathMatch(
      {
        page: param.path.number
      },
      x => `/page/${x.page}`,
      "/page/1"
    ).toEqual({ page: 1 });
  });

  it("should not match numeric param", () => {
    expectGetPathMatch(
      {
        page: param.path.number
      },
      x => `/page/${x.page}`,
      "/page/1a"
    ).toEqual(false);
  });

  it("should match static with trailing slash", () => {
    expectGetPathMatch({}, () => `/page`, "/page/").toEqual({});
  });

  it("should work for static route", () => {
    expectGetPathMatch({}, () => `/docs/today`, "/docs/today").toEqual({});
  });

  it("should match url encoded json param", () => {
    expectGetPathMatch(
      {
        json: param.path.ofType<{ hello: string }>()
      },
      x => `/json/${x.json}`,
      `/json/%7B%22hello%22%3A%22there%22%7D`
    ).toEqual({
      json: { hello: "there" }
    });
  });

  it("should match custom param", () => {
    expectGetPathMatch(
      {
        json: param.path.ofType<{ hello: string; there: string }>({
          parse: raw => {
            const rawParts = raw.split("-");

            if (rawParts.length !== 2) {
              return noMatch;
            }

            const [hello, there] = rawParts;

            if (hello === "" || there === "") {
              return noMatch;
            }

            return { hello, there };
          },
          stringify: value => `${value.hello}-${value.there}`
        })
      },
      x => `/json/hi-${x.json}-now/today`,
      `/json/hi-hello-there-now/today`
    ).toEqual({
      json: { hello: "hello", there: "there" }
    });
  });

  it("should include trailing slash in trailing param", () => {
    expectGetPathMatch(
      { hi: param.path.trailing.string },
      x => `/hello/${x.hi}`,
      "/hello/there/"
    ).toEqual({
      hi: "/there/"
    });
  });

  it("should match numbers", () => {
    expectGetPathMatch(
      { num: param.path.number },
      x => `/hello/${x.num}`,
      "/hello/1"
    ).toEqual({
      num: 1
    });

    expectGetPathMatch(
      { num: param.path.number },
      x => `/hello/${x.num}`,
      "/hello/1.1"
    ).toEqual({
      num: 1.1
    });

    expectGetPathMatch(
      { num: param.path.number },
      x => `/hello/${x.num}`,
      "/hello/-1.1"
    ).toEqual({
      num: -1.1
    });

    expectGetPathMatch(
      { num: param.path.number },
      x => `/hello/${x.num}`,
      "/hello/-00.1"
    ).toEqual({
      num: -0.1
    });

    expectGetPathMatch(
      { num: param.path.number },
      x => `/hello/${x.num}`,
      "/hello/-.1"
    ).toEqual({
      num: -0.1
    });

    expectGetPathMatch(
      { num: param.path.number },
      x => `/hello/${x.num}`,
      "/hello/-."
    ).toEqual(false);
  });
});

function expectGetPathMatch(
  pathParamDefCollection: Record<string, PathParamDef>,
  getRawPath: GetRawPath,
  path: string
) {
  return expect(
    getPathMatch(
      path,
      buildPathDef({ routeName: "test" }, pathParamDefCollection, getRawPath)
    )
  );
}
