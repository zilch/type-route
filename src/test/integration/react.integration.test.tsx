import { testNotImplemented } from "../utils/testNotImplemented";
import { Route } from "../../index";

describe("react", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:1235/");
  });

  test("right clicking link", testNotImplemented);

  test("react", async () => {
    const { routes, session } = await page.evaluate(() => {
      const { render, TypeRoute, React } = window;

      const { createRouter, defineRoute, param } = TypeRoute;
      const { useState, useEffect } = React;

      const { routes, listen, session } = createRouter({
        home: defineRoute("/"),
        userList: defineRoute(
          {
            page: param.query.optional.number.default(1),
          },
          () => `/users`
        ),
        user: defineRoute(
          {
            userId: param.path.string,
          },
          (x) => `/users/${x.userId}`
        ),
      });

      function App() {
        const [route, setRoute] = useState(session.getInitialRoute());

        useEffect(() => listen(setRoute), []);

        return (
          <>
            <Navigation />
            <div data-route={route.name}>
              <Page route={route} />
            </div>
          </>
        );
      }

      function Navigation() {
        return (
          <nav>
            <a data-testid="home" {...routes.home.link()}>
              Home
            </a>
            <a data-testid="userList" {...routes.userList.link()}>
              User List
            </a>
            <a data-testid="user" {...routes.user.link({ userId: "abc" })}>
              User
            </a>
          </nav>
        );
      }

      function Page({ route }: { route: Route<typeof routes> }) {
        if (route.name === routes.home.name) {
          return <div>Home</div>;
        } else if (route.name === routes.user.name) {
          return (
            <div>
              User <span data-testid="userId">{route.params.userId}</span>
            </div>
          );
        } else if (route.name === routes.userList.name) {
          return (
            <div>
              User List <span data-testid="page">{route.params.page}</span>
            </div>
          );
        } else {
          return <div>Not Found</div>;
        }
      }

      render(<App />);

      Object.assign(window, { routes, listen, session });
      return { routes, listen, session };
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe("/");

    await page.evaluate(() => {
      return routes.user.push({ userId: "123" });
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe(
      "/users/123"
    );

    await page.waitFor("[data-route]");

    expect(
      await page.$eval("[data-route]", (e) => e.getAttribute("data-route"))
    ).toBe("user");

    expect(await page.$eval('[data-testid="userId"]', (e) => e.innerText)).toBe(
      "123"
    );

    await page.$eval('[data-testid="userList"]', (e) => e.click());

    expect(await page.$eval('[data-testid="page"]', (e) => e.innerText)).toBe(
      "1"
    );

    await page.evaluate(() => {
      return routes.userList.push({
        page: 2,
      });
    });

    expect(await page.$eval('[data-testid="page"]', (e) => e.innerText)).toBe(
      "2"
    );

    await page.evaluate(() => {
      session.back();
    });

    expect(await page.$eval('[data-testid="page"]', (e) => e.innerText)).toBe(
      "1"
    );
  });
});
