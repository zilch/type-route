import { describe, it, expect, vi } from "vitest";

import React, { useEffect } from "react";
import { createRouter, defineRoute } from "../src/react";
import { renderIntoDocument, act } from "react-dom/test-utils";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";
import { setPath } from "./setPath";

describe("react", () => {
  it("should error if useRoute is used without wrapping in RouteProvider", () => {
    const { useRoute } = createRouter({});

    function Test() {
      const route = useRoute();
      return <>{route.name}</>;
    }

    const errorSpy = vi.spyOn(console, "error");
    errorSpy.mockImplementation(() => {});

    expectTypeRouteError(
      TypeRouteError.App_should_be_wrapped_in_a_RouteProvider_component,
      () => renderIntoDocument(<Test />)
    );

    vi.clearAllMocks();
  });

  it("should work when in a route provider", () => {
    const { RouteProvider, useRoute, routes } = createRouter({
      foo: defineRoute("/foo"),
    });

    const names: (string | false)[] = [];

    function Test() {
      const route = useRoute();
      names.push(route.name);
      return <>{route.name}</>;
    }

    act(() => {
      renderIntoDocument(
        <RouteProvider>
          <Test />
        </RouteProvider>
      );
    });

    expect(names).toEqual([false]);

    act(() => {
      routes.foo().push();
    });

    expect(names).toEqual([false, "foo"]);
  });

  it("should redirect on initial render", () => {
    setPath("/");

    const { RouteProvider, useRoute, routes } = createRouter({
      bar: defineRoute("/"),
      foo: defineRoute("/foo"),
    });

    const names: (string | false)[] = [];

    function Test() {
      const route = useRoute();
      names.push(route.name);
      useEffect(() => {
        if (route.name === "bar") {
          routes.foo().replace();
        }
      }, [route]);
      return <>{route.name}</>;
    }

    act(() => {
      renderIntoDocument(
        <RouteProvider>
          <Test />
        </RouteProvider>
      );
    });

    expect(names).toEqual(["bar", "foo"]);
  });
});
