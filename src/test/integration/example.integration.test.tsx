import { Route } from "../../index";

describe("example", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:1235/");
  });

  it("should work", async () => {
    const { routes } = await page.evaluate(() => {
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
            <Page route={route} />
          </>
        );
      }

      function Navigation() {
        return (
          <nav>
            <a {...routes.home.link()}>Home</a>
            <a {...routes.userList.link()}>User List</a>
            <a {...routes.user.link({ userId: "abc" })}>User</a>
          </nav>
        );
      }

      function Page({ route }: { route: Route<typeof routes> }) {
        if (route.name === routes.home.name) {
          return <div>Home</div>;
        } else if (route.name === routes.user.name) {
          return <div>User</div>;
        } else if (route.name === routes.userList.name) {
          return <div>User List</div>;
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
      routes.user.push({ userId: "123" });
    });

    expect(await page.evaluate(() => document.location.pathname)).toBe(
      "/users/123"
    );
  });
});
