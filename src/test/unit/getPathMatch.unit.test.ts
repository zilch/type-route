import { buildPathDef } from "../../buildPathDef";
import { getPathMatch } from "../../getPathMatch";
import { param } from "../../param";
import { noMatch } from "../../noMatch";
import { PathParamDef, GetRawPath } from "../../types";

describe("getPathMatch", () => {
  it("should work for root", () => {
    expectGetPathMatch({}, () => "/", "/").toEqual({
      params: {},
      numExtraneousParams: 0,
    });
  });

  it("should work for simple case", () => {
    expectGetPathMatch(
      {
        userId: param.path.string,
      },
      (x) => `/user/${x.userId}`,
      "/user/foo"
    ).toEqual({
      params: {
        userId: "foo",
      },
      numExtraneousParams: 0,
    });
  });

  it("should work for optional param", () => {
    expectGetPathMatch(
      {
        userId: param.path.optional.string,
      },
      (x) => `/user/${x.userId}`,
      "/user"
    ).toEqual({
      params: {},
      numExtraneousParams: 0,
    });
  });

  it("should work for trailing param", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.optional.string,
      },
      (x) => `/docs/${x.docsPage}`,
      "/docs/this/is/the/page"
    ).toEqual({
      params: {
        docsPage: "/this/is/the/page",
      },
      numExtraneousParams: 0,
    });
  });

  it("should work for trailing param without match", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.optional.string,
      },
      (x) => `/docs/${x.docsPage}`,
      "/docs"
    ).toEqual({
      params: {},
      numExtraneousParams: 0,
    });
  });

  it("should not match when trailing param is required", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.string,
      },
      (x) => `/docs/${x.docsPage}`,
      "/docs"
    ).toEqual(false);
  });

  it("should match when trailing has leading and trailing", () => {
    expectGetPathMatch(
      {
        docsPage: param.path.trailing.string,
      },
      (x) => `/docs/hello-${x.docsPage}-there`,
      "/docs/hello-today/again-there"
    ).toEqual({
      params: {
        docsPage: "today/again",
      },
      numExtraneousParams: 0,
    });
  });

  it("should match numeric param", () => {
    expectGetPathMatch(
      {
        page: param.path.number,
      },
      (x) => `/page/${x.page}`,
      "/page/1"
    ).toEqual({
      params: { page: 1 },
      numExtraneousParams: 0,
    });
  });

  it("should not match numeric param", () => {
    expectGetPathMatch(
      {
        page: param.path.number,
      },
      (x) => `/page/${x.page}`,
      "/page/1a"
    ).toEqual(false);
  });

  it("should match static with trailing slash", () => {
    expectGetPathMatch({}, () => `/page`, "/page/").toEqual({
      params: {},
      numExtraneousParams: 0,
    });
  });

  it("should work for static route", () => {
    expectGetPathMatch({}, () => `/docs/today`, "/docs/today").toEqual({
      params: {},
      numExtraneousParams: 0,
    });
  });

  it("should match url encoded json param", () => {
    expectGetPathMatch(
      {
        json: param.path.ofType<{ hello: string }>(),
      },
      (x) => `/json/${x.json}`,
      `/json/%7B%22hello%22%3A%22there%22%7D`
    ).toEqual({
      params: {
        json: { hello: "there" },
      },
      numExtraneousParams: 0,
    });
  });

  it("should match custom param", () => {
    expectGetPathMatch(
      {
        json: param.path.ofType<{ hello: string; there: string }>({
          id: "custom",
          parse: (raw) => {
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
          stringify: (value) => `${value.hello}-${value.there}`,
        }),
      },
      (x) => `/json/hi-${x.json}-now/today`,
      `/json/hi-hello-there-now/today`
    ).toEqual({
      params: {
        json: { hello: "hello", there: "there" },
      },
      numExtraneousParams: 0,
    });
  });

  it("should include trailing slash in trailing param", () => {
    expectGetPathMatch(
      { hi: param.path.trailing.string },
      (x) => `/hello/${x.hi}`,
      "/hello/there/"
    ).toEqual({
      params: {
        hi: "/there/",
      },
      numExtraneousParams: 0,
    });
  });

  it("should match numbers", () => {
    expectGetPathMatch(
      { num: param.path.number },
      (x) => `/hello/${x.num}`,
      "/hello/1"
    ).toEqual({
      params: {
        num: 1,
      },
      numExtraneousParams: 0,
    });

    expectGetPathMatch(
      { num: param.path.number },
      (x) => `/hello/${x.num}`,
      "/hello/1.1"
    ).toEqual({
      params: {
        num: 1.1,
      },
      numExtraneousParams: 0,
    });

    expectGetPathMatch(
      { num: param.path.number },
      (x) => `/hello/${x.num}`,
      "/hello/-1.1"
    ).toEqual({
      params: {
        num: -1.1,
      },
      numExtraneousParams: 0,
    });

    expectGetPathMatch(
      { num: param.path.number },
      (x) => `/hello/${x.num}`,
      "/hello/-00.1"
    ).toEqual({
      params: {
        num: -0.1,
      },
      numExtraneousParams: 0,
    });

    expectGetPathMatch(
      { num: param.path.number },
      (x) => `/hello/${x.num}`,
      "/hello/-.1"
    ).toEqual({
      params: {
        num: -0.1,
      },
      numExtraneousParams: 0,
    });

    expectGetPathMatch(
      { num: param.path.number },
      (x) => `/hello/${x.num}`,
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
    getPathMatch({
      path,
      pathDef: buildPathDef("test", pathParamDefCollection, getRawPath),
      arraySeparator: ",",
    })
  );
}
