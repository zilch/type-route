import { createRouter, defineRoute, param } from "./index";
import { Any } from "ts-toolbelt";
import { Action } from "./types";

function expectTypes<A, B>(_: Any.Equals<Any.Compute<A>, Any.Compute<B>>) {}

const toBeEqual = 1 as const;

describe("types", () => {
  it("should pass", () => {
    const { routes, history } = createRouter({
      home: defineRoute("/"),
      user: defineRoute({ userId: param.path.string }, x => `/${x.userId}`)
    });

    const route = history.getInitialRoute();

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
});
