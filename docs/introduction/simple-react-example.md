---
title: Simple React Example
---

# {{ $frontmatter.title }}

Here's a basic example of how to use Type Route with React. Click the **Run** button to try it out on CodeSandbox. Other guides cover more complex use cases. See the [Type Route without React](../guides/type-route-without-react.md) guide for an example of how to use Type Route without React.

::: code-group

```tsx [index.tsx]
import React from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, Route, param } from "type-route";

const { RouteProvider, useRoute, routes } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number,
    },
    () => "/user"
  ),
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/user/${p.userId}`
  ),
});

function App() {
  const route = useRoute();

  return (
    <>
      <Navigation />
      {route.name === "home" && <HomePage />}
      {route.name === "userList" && <UserListPage route={route} />}
      {route.name === "user" && <UserPage route={route} />}
      {route.name === false && <>Not Found</>}
    </>
  );
}

function Navigation() {
  return (
    <nav>
      <a {...routes.home().link}>Home</a>
      <a {...routes.userList().link}>User List</a>
      <a
        {...routes.userList({
          page: 2,
        }).link}
      >
        User List Page 2
      </a>
      <a
        {...routes.user({
          userId: "abc",
        }).link}
      >
        User "abc"
      </a>
    </nav>
  );
}

function HomePage() {
  return <div>Home</div>;
}

function UserListPage(props: { route: Route<typeof routes.userList> }) {
  const { route } = props;

  return (
    <div>
      User List
      <br />
      Page: {route.params.page || "-"}
    </div>
  );
}

function UserPage(props: { route: Route<typeof routes.user> }) {
  const { route } = props;

  return <div>User {route.params.userId}</div>;
}

ReactDOM.render(
  <RouteProvider>
    <App />
  </RouteProvider>,
  document.querySelector("#root")
);
```

:::
