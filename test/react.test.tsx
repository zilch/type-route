import React, { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, defineRoute } from "../src/react";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";
import { setPath } from "./setPath";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: React.ReactNode) {
  createRoot(document.createElement("div")).render(element);
}

describe("react", () => {
  it("should error if useRoute is used without wrapping in RouteProvider", () => {
    const { useRoute } = createRouter({});

    function Test() {
      const route = useRoute();
      return <>{route.name}</>;
    }

    const errorSpy = jest.spyOn(console, "error");
    errorSpy.mockImplementation(() => {});

    expectTypeRouteError(
      TypeRouteError.App_should_be_wrapped_in_a_RouteProvider_component,
      () => { act(() => render(<Test />)); }
    );

    jest.clearAllMocks();
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
      render(
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
      render(
        <RouteProvider>
          <Test />
        </RouteProvider>
      );
    });

    expect(names).toEqual(["bar", "foo"]);
  });
});
