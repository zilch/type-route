import React from "react";
import { createRouter, defineRoute } from "../src/react";
import { renderIntoDocument, act } from "react-dom/test-utils";
import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";

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
      () => renderIntoDocument(<Test />)
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
});
