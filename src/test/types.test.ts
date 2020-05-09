import { createRouter, defineRoute, param } from "../index";
import { Any } from "ts-toolbelt";
import { Action } from "../types";

function expectTypes<A, B>(_: Any.Equals<Any.Compute<A>, Any.Compute<B>>) {}

const toBeEqual = 1 as const;

describe("types", () => {
  it("should pass", () => {
    const { routes, session } = createRouter({
      home: defineRoute("/"),
      user: defineRoute({ userId: param.path.string }, (x) => `/${x.userId}`),
    });

    const route = session.getInitialRoute();

    if (route.name === routes.user.name) {
      expectTypes<typeof route.params, { userId: string }>(toBeEqual);
    } else if (route.name === routes.home.name) {
      expectTypes<typeof route.params, {}>(toBeEqual);
    } else {
      expectTypes<typeof route, { name: false; params: {}; action: Action }>(
        toBeEqual
      );
    }
  });

  it("should compile with defaults", () => {
    const { routes, session } = createRouter({
      home: defineRoute("/"),
      user: defineRoute(
        {
          o: param.query.optional.number,
          d: param.query.optional.number.default(1),
        },
        () => `/user`
      ),
    });

    const route = session.getInitialRoute();

    expectTypes<
      Parameters<typeof routes.user.link>[0],
      { o?: number; d?: number } | undefined
    >(toBeEqual);

    if (route.name === routes.user.name) {
      expectTypes<typeof route.params, { o?: number; d: number }>(toBeEqual);
    } else if (route.name === routes.home.name) {
      expectTypes<typeof route.params, {}>(toBeEqual);
    } else {
      expectTypes<typeof route, { name: false; params: {}; action: Action }>(
        toBeEqual
      );
    }
  });
});
