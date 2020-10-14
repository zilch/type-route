/* eslint-disable import/first */
// @ts-ignore
window.__DEV__ = true;

import React from "react";
import ReactDOM from "react-dom";
import {
  createRouter,
  defineRoute,
  param,
  Route,
  preventDefaultLinkClickBehavior,
} from "./react";

export const { RouteProvider, useRoute, routes } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number.default(1),
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
      <div style={{ height: "1000px" }}>
        {route.name === "home" && <HomePage />}
        {route.name === "userList" && <UserListPage route={route} />}
        {route.name === "user" && <UserPage route={route} />}
        {route.name === false && <>Not Found</>}
      </div>
      <Navigation />
    </>
  );
}

function HomePage() {
  return <div>Home Page</div>;
}

type UserListProps = {
  route: Route<typeof routes.userList>;
};

function UserListPage({ route }: UserListProps) {
  return <div>UserList - Page: {route.params.page}</div>;
}

type UserProps = {
  route: Route<typeof routes.user>;
};

function UserPage({ route }: UserProps) {
  return <div>User {route.params.userId}</div>;
}

function Navigation() {
  return (
    <nav>
      <a {...replaceLink(routes.home())}>Home</a>
      <a {...routes.userList().link}>User List</a>
      <a {...routes.user({ userId: "abc" }).link}>User "abc"</a>
    </nav>
  );
}

function replaceLink(to: Route<typeof routes>) {
  return {
    href: to.href,
    onClick: (e: React.MouseEvent) => {
      if (preventDefaultLinkClickBehavior(e)) {
        to.replace();
      }
    },
  };
}

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(
  <RouteProvider>
    <App />
  </RouteProvider>,
  container
);
