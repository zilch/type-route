import React, { useState, useEffect } from "react";
import { createRouter, defineRoute, param, Route } from "./index";
import { render } from "./test/utils/render";

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
  software: defineRoute(
    {
      name: param.path.string,
      version: param.path.optional.string,
    },
    (x) => `/software/${x.name}/${x.version}`
  ),
});

function App() {
  const [route, setRoute] = useState(() => session.getInitialRoute());

  useEffect(() => listen(setRoute), []);

  return (
    <>
      <Navigation />
      <Page route={route} />
    </>
  );
}

function Page(props: { route: Route<typeof routes> }) {
  const { route } = props;

  if (route.name === routes.home.name) {
    return <div>Home Page</div>;
  }

  if (route.name === routes.userList.name) {
    return (
      <div>
        User List
        <br />
        Page: {route.params.page}
      </div>
    );
  }

  if (route.name === routes.user.name) {
    return <div>User {route.params.userId}</div>;
  }

  if (route.name === routes.software.name) {
    return (
      <div>
        Software name {route.params.name} version{" "}
        {route.params.version ?? "none"}
      </div>
    );
  }

  return <div>Not Found</div>;
}

function Navigation() {
  return (
    <nav>
      <a {...routes.home.link()}>Home</a>
      <a {...routes.userList.link()}>User List</a>
      <a
        {...routes.userList.link({
          page: 2,
        })}
      >
        User List Page 2
      </a>
      <a
        {...routes.user.link({
          userId: "abc",
        })}
      >
        User "abc"
      </a>
      <a
        {...routes.software.link({
          name: "Apache",
        })}
      >
        Apache
      </a>
      <a
        {...routes.software.link({
          name: "Apache",
          version: "2.1.4",
        })}
      >
        Apache 2.1.4
      </a>
    </nav>
  );
}

render(<App />);
