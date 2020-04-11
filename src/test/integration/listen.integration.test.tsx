import { Route } from "../../index";

describe("listen", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:1235/");
  });

  it("should call listen correctly", async () => {
    const {
      routes,
      session,
      callHistory,
      removeListener,
    } = await page.evaluate(() => {
      const { createRouter, defineRoute } = window.TypeRoute;

      const { listen, routes, session } = createRouter({
        one: defineRoute("/one"),
        two: defineRoute("/two"),
      });

      let callHistory: Route<typeof routes>[] = [];

      const removeListener = listen((nextRoute) => {
        callHistory.push(nextRoute);
      });

      Object.assign(window, { routes, session, callHistory, removeListener });
      return { routes, session, callHistory, removeListener };
    });

    expect(await page.evaluate(() => callHistory)).toEqual([]);

    expect(await page.evaluate(() => session.getInitialRoute())).toEqual({
      name: false,
      action: "initial",
      params: {},
    });

    await page.evaluate(() => {
      routes.one.push();
    });

    expect(await page.evaluate(() => callHistory)).toEqual([
      {
        name: "one",
        action: "push",
        params: {},
      },
    ]);

    await page.evaluate(() => {
      routes.two.push();
    });

    expect(await page.evaluate(() => callHistory)).toEqual([
      {
        name: "one",
        action: "push",
        params: {},
      },
      {
        name: "two",
        action: "push",
        params: {},
      },
    ]);

    await page.evaluate(() => {
      session.back();
    });

    expect(await page.evaluate(() => callHistory)).toEqual([
      {
        name: "one",
        action: "push",
        params: {},
      },
      {
        name: "two",
        action: "push",
        params: {},
      },
      {
        name: "one",
        action: "pop",
        params: {},
      },
    ]);

    await page.evaluate(() => {
      routes.two.replace();
    });

    expect(await page.evaluate(() => callHistory)).toEqual([
      {
        name: "one",
        action: "push",
        params: {},
      },
      {
        name: "two",
        action: "push",
        params: {},
      },
      {
        name: "one",
        action: "pop",
        params: {},
      },
      {
        name: "two",
        action: "replace",
        params: {},
      },
    ]);

    await page.goBack();

    expect(await page.evaluate(() => callHistory)).toEqual([
      {
        name: "one",
        action: "push",
        params: {},
      },
      {
        name: "two",
        action: "push",
        params: {},
      },
      {
        name: "one",
        action: "pop",
        params: {},
      },
      {
        name: "two",
        action: "replace",
        params: {},
      },
      {
        name: false,
        action: "pop",
        params: {},
      },
    ]);

    await page.goForward();

    expect(await page.evaluate(() => callHistory)).toEqual([
      {
        name: "one",
        action: "push",
        params: {},
      },
      {
        name: "two",
        action: "push",
        params: {},
      },
      {
        name: "one",
        action: "pop",
        params: {},
      },
      {
        name: "two",
        action: "replace",
        params: {},
      },
      {
        name: false,
        action: "pop",
        params: {},
      },
      {
        name: "two",
        action: "pop",
        params: {},
      },
    ]);

    await page.evaluate(() => {
      removeListener();
      routes.one.push();
    });

    expect(await page.evaluate(() => callHistory)).toEqual([
      {
        name: "one",
        action: "push",
        params: {},
      },
      {
        name: "two",
        action: "push",
        params: {},
      },
      {
        name: "one",
        action: "pop",
        params: {},
      },
      {
        name: "two",
        action: "replace",
        params: {},
      },
      {
        name: false,
        action: "pop",
        params: {},
      },
      {
        name: "two",
        action: "pop",
        params: {},
      },
    ]);
  });

  it("should handle navigation handler returning false properly", async () => {
    const { routes, box } = await page.evaluate(() => {
      const { createRouter, defineRoute } = window.TypeRoute;

      const { listen, routes } = createRouter({
        one: defineRoute("/one"),
        two: defineRoute("/two"),
      });

      const box: {
        listen: (
          nextRoute: Route<typeof routes>
        ) => Promise<boolean | void> | boolean | void;
      } = {
        listen() {},
      };

      listen((nextRoute) => {
        return box.listen(nextRoute);
      });

      routes.one.push();

      Object.assign(window, { box, routes });
      return { box, routes };
    });

    await page.evaluate(() => {
      routes.one.push();
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe("/one");

    await page.evaluate(() => {
      box.listen = () => {
        return false;
      };
      routes.two.push();
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe("/one");

    await page.evaluate(() => {
      box.listen = () => {};
      routes.two.push();
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe("/two");

    await page.evaluate(() => {
      routes.one.push();
      box.listen = () => {
        return false;
      };
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe("/one");

    await page.goBack();

    expect(await page.evaluate(() => document.location.pathname)).toBe("/one");

    await page.evaluate(() => {
      box.listen = () => {};
      routes.two.push();
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe("/two");

    await page.evaluate(() => {
      box.listen = async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        return false;
      };
    });

    // Best effort with back button is for the url to change but then we change it back
    await page.goBack();
    expect(await page.evaluate(() => document.location.pathname)).toBe("/one");
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(await page.evaluate(() => document.location.pathname)).toBe("/two");

    // But navigating via routes should prevent even the short term change
    await page.evaluate(() => {
      routes.one.push();
    });
    expect(await page.evaluate(() => document.location.pathname)).toBe("/two");
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(await page.evaluate(() => document.location.pathname)).toBe("/two");

    // Should return false since the listen handler returns false
    expect(
      await page.evaluate(() => {
        return routes.one.push();
      })
    ).toBe(false);

    // Should handle the case when navigation is triggered while processing the previous navigation
    // only one should be processed at a time
    const { calls } = await page.evaluate(() => {
      const start = Date.now();
      const calls: { time: number; route: string | false }[] = [];
      box.listen = (nextRoute) => {
        calls.push({ time: Date.now() - start, route: nextRoute.name });
        return new Promise((r) => setTimeout(r, 500));
      };
      setTimeout(() => routes.one.push(), 100);
      setTimeout(() => routes.two.push(), 200);
      setTimeout(() => routes.one.push(), 300);
      Object.assign(window, { calls });
      return { calls };
    });

    await new Promise((r) => setTimeout(r, 2000));

    expect((await page.evaluate(() => calls)).length).toBe(3);
    expect((await page.evaluate(() => calls))[0].route).toBe("one");
    expect((await page.evaluate(() => calls))[0].time).toBeGreaterThan(100);
    expect((await page.evaluate(() => calls))[0].time).toBeLessThan(200);
    expect((await page.evaluate(() => calls))[1].route).toBe("two");
    expect((await page.evaluate(() => calls))[1].time).toBeGreaterThan(600);
    expect((await page.evaluate(() => calls))[1].time).toBeLessThan(700);
    expect((await page.evaluate(() => calls))[2].route).toBe("one");
    expect((await page.evaluate(() => calls))[2].time).toBeGreaterThan(1100);
    expect((await page.evaluate(() => calls))[2].time).toBeLessThan(1200);
  });
});
