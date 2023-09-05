import { createRouter, defineRoute, param, RouterOpts } from "../src/core";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";
import { QueryStringArrayFormat } from "../src/types";
import { setPath } from "./setPath";

describe("createRouter", () => {
  it("should push route with query string param properly", () => {
    const { routes } = createRouter({
      home: defineRoute("/"),
      there: defineRoute({ param: param.query.string }, () => "/there"),
      test: defineRoute({ t: param.query.string }, () => "/hi"),
    });

    expect(window.location.href).toBe("http://localhost/");
    routes.home().push();
    expect(window.location.href).toBe("http://localhost/");
    routes.there({ param: "hello" }).push();
    expect(window.location.href).toBe("http://localhost/there?param=hello");
    routes.test({ t: "hi" }).push();
    expect(window.location.href).toBe("http://localhost/hi?t=hi");
  });

  it("should work with memory router", () => {
    const config: RouterOpts = {
      session: {
        type: "memory",
      },
    };

    const { routes, session } = createRouter(config, {
      foo: defineRoute("/foo"),
      bar: defineRoute("/bar"),
    });

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.href).toBe("/");
    routes.bar().push();
    expect(route.href).toBe("/bar");
    routes.foo().replace();
    expect(route.href).toBe("/foo");
    session.back();
    expect(route.href).toBe("/");
  });

  it("should work with skipRender() function ", () => {
    const config: RouterOpts = {
      session: {
        type: "memory",
      },
    };

    const { routes, session } = createRouter(config, {
      foo: defineRoute("/foo"),
      bar: defineRoute("/bar"),
      bar2: defineRoute("/bar2"),
    });

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.href).toBe("/");
    session.skipNextRender();
    routes.bar().push();
    expect(route.href).toBe("/");
    routes.bar().push();
    expect(route.href).toBe("/bar");
    session.skipNextRender();
    routes.bar2().push();
    routes.foo().push();
    session.back();
    // going back should ignore skipRender
    expect(route.href).toBe("/bar2");
  });

  it("link should work", () => {
    const config: RouterOpts = {
      session: {
        type: "memory",
      },
    };

    const { routes, session } = createRouter(config, {
      foo: defineRoute("/foo"),
      bar: defineRoute("/bar"),
    });

    let route = session.getInitialRoute();
    let calledPreventDefault = false;

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.href).toBe("/");
    routes.bar().link.onClick({
      button: 0,
      preventDefault: () => {
        calledPreventDefault = true;
      },
    });
    expect(route.href).toBe("/bar");
    expect(calledPreventDefault).toBe(true);
    routes.foo().link.onClick({
      button: 0,
      defaultPrevented: true,
      preventDefault: () => {
        throw new Error("This should not be called.");
      },
    });
    expect(route.href).toBe("/bar");
  });

  it("should throw runtime error when building route without a required parameter or extraneous params", () => {
    const { routes } = createRouter({
      test: defineRoute(
        {
          hi: param.path.string,
        },
        (p) => `/${p.hi}`
      ),
    });

    expectTypeRouteError(
      TypeRouteError.Missing_required_parameter_when_building_route,
      () => {
        routes.test({} as any);
      }
    );

    expectTypeRouteError(
      TypeRouteError.Encountered_unexpected_parameter_when_building_route,
      () => {
        routes.test({ bye: "hi" } as any);
      }
    );
  });

  it("should throw runtime error building route with no paths", () => {
    expectTypeRouteError(
      TypeRouteError.Expected_length_of_array_does_match_actual_length,
      () => {
        createRouter({
          test: defineRoute([]),
        });
      }
    );
  });

  // TODO looks like tsdx/jest has some source maps issue which causes this test to fail incorrectly
  it.skip("should throw runtime error when creating router with incompatible options", () => {
    const config: RouterOpts = {
      arrayFormat: {
        queryString: "multiKey",
      },
      queryStringSerializer: {
        parse: () => ({}),
        stringify: () => "",
      },
    };

    expectTypeRouteError(
      TypeRouteError.Query_string_array_format_and_custom_query_string_serializer_may_not_both_be_provided,
      () => {
        createRouter(config, {});
      }
    );
  });

  it("should throw runtime error when creating router with invalid arguments", () => {
    expectTypeRouteError(
      TypeRouteError.Expected_number_of_arguments_does_match_actual_number,
      () => {
        (createRouter as any)();
      }
    );

    expectTypeRouteError(
      TypeRouteError.Expected_type_does_not_match_actual_type,
      () => {
        createRouter({
          hi: "there" as any,
        });
      }
    );

    expectTypeRouteError(
      TypeRouteError.Expected_type_does_not_match_actual_type,
      () => {
        createRouter({
          hi: { bye: "there" } as any,
        });
      }
    );

    expectTypeRouteError(
      TypeRouteError.Expected_type_does_not_match_actual_type,
      () => {
        createRouter({
          hi: defineRoute([1, 2] as any),
        });
      }
    );

    expectTypeRouteError(
      TypeRouteError.Expected_type_does_not_match_actual_type,
      () => {
        const { routes } = createRouter({
          hi: defineRoute(
            {
              fooBarParam: param.query.array.string,
            },
            () => `/`
          ),
        });
        routes.hi({ fooBarParam: 1 as any });
      }
    );
  });

  it("should be able to remove listener", () => {
    const { routes, session } = createRouter({
      foo: defineRoute("/foo"),
      bar: defineRoute("/bar"),
    });

    let calls = 0;
    const removeListener = session.listen(() => {
      calls++;
    });

    expect(calls).toBe(0);
    routes.foo().push();
    expect(calls).toBe(1);
    removeListener();
    routes.bar().push();
    expect(calls).toBe(1);
  });

  it("should be able to attach multiple listeners", () => {
    const { routes, session } = createRouter({
      foo: defineRoute("/foo"),
      bar: defineRoute("/bar"),
    });

    let calls1 = 0;
    let calls2 = 0;
    session.listen(() => {
      calls1++;
    });
    routes.foo().push();
    expect(calls1).toBe(1);
    expect(calls2).toBe(0);

    session.listen(() => {
      calls2++;
    });
    routes.bar().push();
    expect(calls1).toBe(2);
    expect(calls2).toBe(1);
  });

  it("should not error when parsing url", () => {
    setPath("/foo?bar=a&bar=b");

    const config: RouterOpts = {
      arrayFormat: {
        queryString: "multiKeyWithBracket",
      },
    };

    const { session } = createRouter(config, {
      foo: defineRoute({ bar: param.query.array.string }, () => "/foo"),
    });

    session.getInitialRoute();
  });

  it("should work with different query string array format options", () => {
    arrayFormatTest("multiKey", "/foo?bar=a&bar=b");
    arrayFormatTest("multiKeyWithBracket", "/foo?bar[]=a&bar[]=b");
    arrayFormatTest("singleKey", "/foo?bar=a,b");
    arrayFormatTest("singleKeyWithBracket", "/foo?bar[]=a,b");
  });

  it("ignore ambiguous query params", () => {
    setPath("/foo?bar=a=d&bar=b");

    const config: RouterOpts = {
      arrayFormat: {
        queryString: "multiKeyWithBracket",
      },
    };

    const { session } = createRouter(config, {
      foo: defineRoute({ bar: param.query.array.string }, () => "/foo"),
    });

    expect(session.getInitialRoute().params).toEqual({
      bar: ["b"],
    });
  });

  it("should allow optional params to be omitted when building a route", () => {
    const { routes } = createRouter({
      foo: defineRoute(
        { foo: param.query.string, bar: param.query.optional.string },
        () => "/foo"
      ),
    });

    routes.foo({ foo: "test" });
    // Just verifying no runtime error is thrown here despite not passing "bar"
  });

  it("should redirect to primary path", () => {
    const { session } = createRouter({
      foo: defineRoute(["/foo", "/"]),
      bar: defineRoute(["/bar", "/bar-two"]),
    });

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.href).toBe("/foo");

    session.push("/bar-two");

    expect(route.href).toBe("/bar");
  });

  it("should properly retrieve state params when navigation isn't trigger via a route directly", () => {
    const { routes, session } = createRouter(
      { session: { type: "memory" } },
      {
        foo: defineRoute("/"),
        bar: defineRoute(
          {
            baz: param.state.string,
          },
          () => "/bar"
        ),
      }
    );

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    routes.bar({ baz: "test" }).push();
    routes.foo().push();
    session.back();

    expect(route.name).toBe("bar");
    expect(route.params).toEqual({
      baz: "test",
    });
  });

  it("should properly block navigation", () => {
    const { routes, session } = createRouter(
      { session: { type: "memory" } },
      {
        foo: defineRoute("/"),
        bar: defineRoute("/bar"),
      }
    );

    let route = session.getInitialRoute();
    let listenCalls = 0;

    session.listen((nextRoute) => {
      route = nextRoute;
      listenCalls++;
    });

    let blockedHref: string = "";
    let unblock = session.block((update) => {
      blockedHref = update.route.href;
      unblock();
      expect(route.href).toBe("/");
      update.retry();
    });
    routes.bar().push();

    expect(blockedHref).toBe("/bar");
    expect(route.href).toBe("/bar");

    unblock = session.block((update) => {
      blockedHref = update.route.href;
      expect(route.href).toBe("/bar");
      unblock();
      update.retry();
    });
    session.back();

    expect(blockedHref).toBe("/");
    expect(route.href).toBe("/");

    expect(listenCalls).toBe(2);
  });

  it("should allow reset session", () => {
    const { session } = createRouter(
      {
        session: {
          type: "memory",
          initialEntries: ["/bar"],
        },
      },
      {
        foo: defineRoute("/"),
        bar: defineRoute("/bar"),
      }
    );

    expect(session.getInitialRoute().href).toBe("/bar");

    session.reset({
      type: "memory",
      initialEntries: ["/"],
    });

    expect(session.getInitialRoute().href).toBe("/");
  });

  it("should not match if an item in the array is not a match", () => {
    const { session } = createRouter(
      { session: { type: "memory", initialEntries: ["/foo?bar=1,2,c"] } },
      {
        foo: defineRoute(
          {
            bar: param.query.array.number,
          },
          () => "/foo"
        ),
      }
    );

    expect(session.getInitialRoute().name).toBe(false);
  });

  it("should work with boolean parameters", () => {
    const { routes, session } = createRouter(
      { session: { type: "memory", initialEntries: ["/foo?bar=true"] } },
      {
        foo: defineRoute(
          {
            bar: param.query.boolean,
          },
          () => "/foo"
        ),
      }
    );

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.name).toBe("foo");
    expect(route.params).toEqual({ bar: true });

    routes.foo({ bar: false }).push();

    expect(route.name).toBe("foo");
    expect(route.params).toEqual({ bar: false });
  });

  it("should work with number parameters", () => {
    const { routes, session } = createRouter(
      { session: { type: "memory", initialEntries: ["/foo?bar=1"] } },
      {
        foo: defineRoute(
          {
            bar: param.query.number,
          },
          () => "/foo"
        ),
      }
    );

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.name).toBe("foo");
    expect(route.params).toEqual({ bar: 1 });

    routes.foo({ bar: 2 }).push();

    expect(route.name).toBe("foo");
    expect(route.params).toEqual({ bar: 2 });
  });

  it("should work with json parameters", () => {
    const { routes, session } = createRouter(
      {
        session: {
          type: "memory",
          initialEntries: ["/foo?bar=%7B%22test%22%3A%22hello%22%7D"],
        },
      },
      {
        foo: defineRoute(
          {
            bar: param.query.ofType<{ test: string }>(),
          },
          () => "/foo"
        ),
      }
    );

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.name).toBe("foo");
    expect(route.params).toEqual({ bar: { test: "hello" } });

    routes.foo({ bar: { test: "test" } }).push();

    expect(route.name).toBe("foo");
    expect(route.params).toEqual({ bar: { test: "test" } });

    session.push("/foo?bar=%7B%22test%22%3A%22hi%22%7D");

    expect(route.name).toBe("foo");
    expect(route.params).toEqual({ bar: { test: "hi" } });

    session.push("/foo?bar=7B%22test%22%3A%22hi%22%7D");

    expect(route.name).toBe(false);
  });

  it("should be able to do session.replace", () => {
    const { routes, session } = createRouter(
      {
        session: {
          type: "memory",
          initialEntries: ["/foo"],
        },
      },
      {
        foo: defineRoute("/foo"),
        bar: defineRoute(
          { page: param.query.optional.number.default(1) },
          () => "/bar"
        ),
      }
    );

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.href).toBe("/foo");

    routes.bar({ page: 1 }).push();
    expect(route.href).toBe("/bar?page=1");
    session.replace("/bar?page=2");
    expect(route.href).toBe("/bar?page=2");
    session.back();
    expect(route.href).toBe("/foo");
    session.forward();
    expect(route.href).toBe("/bar?page=2");
  });

  it("should handle redirect for initial route", () => {
    const { session } = createRouter(
      {
        session: {
          type: "memory",
          initialEntries: ["/foo1"],
        },
      },
      {
        foo: defineRoute(["/foo2", "/foo1"]),
      }
    );

    expect(session.getInitialRoute().href).toBe("/foo2");
  });

  it("should work with hash router", () => {
    const config: RouterOpts = {
      session: { type: "hash" },
    };

    const { routes, session } = createRouter(config, {
      foo: defineRoute("/foo"),
    });

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.name).toBe(false);
    expect(route.href).toBe("/#/");

    routes.foo().push();

    expect(route.name).toBe("foo");
    expect(route.href).toBe("/#/foo");
  });

  it("should work with base url", () => {
    setPath("");

    const config: RouterOpts = {
      baseUrl: "/hello",
    };

    const { routes, session } = createRouter(config, {
      foo: defineRoute("/foo"),
    });

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.name).toBe(false);
    expect(route.href).toBe("/");

    routes.foo().push();

    expect(route.name).toBe("foo");
    expect(route.href).toBe("/hello/foo");
  });

  it("should work with hash router and base url", () => {
    const opts: RouterOpts = {
      baseUrl: "/hello",
      session: { type: "hash" },
    };

    const { routes, session } = createRouter(opts, {
      foo: defineRoute("/foo"),
    });

    let route = session.getInitialRoute();

    session.listen((nextRoute) => (route = nextRoute));

    expect(route.name).toBe(false);
    expect(route.href).toBe("/#/");

    routes.foo().push();

    expect(route.name).toBe("foo");
    expect(route.href).toBe("/hello/#/foo");
  });

  // TODO looks like tsdx/jest has some source maps issue which causes this test to fail incorrectly
  it.skip("should error is base url is not valid", () => {
    expectTypeRouteError(
      TypeRouteError.Base_url_must_start_with_a_forward_slash,
      () => createRouter({ baseUrl: "hi" }, {})
    );

    expectTypeRouteError(
      TypeRouteError.Base_url_must_not_contain_any_characters_that_must_be_url_encoded,
      () => createRouter({ baseUrl: "/hello?there=5" }, {})
    );
  });

  it("should not navigate twice using session", () => {
    const { session } = createRouter({
      foo: defineRoute("/foo"),
      bar: defineRoute("/bar"),
    });

    const history: (string | false)[] = [session.getInitialRoute().name];

    session.listen((route) => {
      history.push(route.name);
    });

    expect(history).toEqual([false]);
    session.push("/bar");
    expect(history).toEqual([false, "bar"]);
    session.push("/foo");
    expect(history).toEqual([false, "bar", "foo"]);
    session.push("/foo");
    expect(history).toEqual([false, "bar", "foo"]);
  });

  it("should not navigate twice using routes", () => {
    const { routes, session } = createRouter({
      foo: defineRoute("/foo"),
      bar: defineRoute("/bar"),
    });

    const history: (string | false)[] = [session.getInitialRoute().name];

    session.listen((route) => {
      history.push(route.name);
    });

    expect(history).toEqual([false]);
    routes.bar().push();
    expect(history).toEqual([false, "bar"]);
    routes.foo().push();
    expect(history).toEqual([false, "bar", "foo"]);
    routes.foo().push();
    expect(history).toEqual([false, "bar", "foo"]);
  });

  it("should not navigate twice using routes with state params", () => {
    const { routes, session } = createRouter({
      foo: defineRoute({ test: param.state.number }, () => "/foo"),
      bar: defineRoute("/bar"),
    });

    const history: (string | false)[] = [session.getInitialRoute().name];

    session.listen((route) => {
      history.push(route.name);
    });

    expect(history).toEqual([false]);
    routes.bar().push();
    expect(history).toEqual([false, "bar"]);
    routes.foo({ test: 1 }).push();
    expect(history).toEqual([false, "bar", "foo"]);
    routes.foo({ test: 2 }).push();
    expect(history).toEqual([false, "bar", "foo", "foo"]);
    routes.foo({ test: 2 }).push();
    expect(history).toEqual([false, "bar", "foo", "foo"]);
  });
});

function arrayFormatTest(
  queryStringArrayFormat: QueryStringArrayFormat,
  href: string
) {
  const config: RouterOpts = {
    arrayFormat: {
      queryString: queryStringArrayFormat,
    },
  };

  const { routes, session } = createRouter(config, {
    foo: defineRoute({ bar: param.query.array.string }, () => "/foo"),
  });
  let route = session.getInitialRoute();

  const remove = session.listen((nextRoute) => (route = nextRoute));
  routes.foo({ bar: ["a", "b"] }).push();
  expect(route.href).toBe(href);
  remove();
}
