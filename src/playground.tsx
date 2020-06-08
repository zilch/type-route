/* eslint-disable import/first */
// @ts-ignore
window.__DEV__ = true;

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, param, Route, createGroup } from "./index";

export const { routes, session, listen } = createRouter({
  home: defineRoute(["/dashboard", "/"]),
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (x) => [`/user/${x.userId}`, `/users/${x.userId}`]
  ),
  other: defineRoute("/other"),
});

export const groups = {
  hi: createGroup([routes.home]),
};

function App() {
  const [route, setRoute] = useState(() => session.getInitialRoute());
  useEffect(() => listen((nextRoute) => setRoute(nextRoute)), []);

  useEffect(() => {
    if (route.action === "push") {
      window.scroll(0, 0);
    }
  }, [route]);

  useEffect(() => {
    document.title = route.href;
  }, [route]);

  return (
    <>
      <Navigation />
      {route.name === "home" && <HomePage />}
      {route.name === "user" && <UserPage route={route} />}
      {route.name === false && <NotFoundPage />}
      <Navigation />
    </>
  );
}

function NotFoundPage() {
  return <div>Not Found</div>;
}

function HomePage() {
  return <div style={{ height: "1000px" }}>Home Page</div>;
}

function UserPage({ route }: { route: Route<typeof routes.user> }) {
  return (
    <>
      <div style={{ height: "2000px" }}>User {route.params.userId}</div>
      <div>User {route.params.userId}</div>
    </>
  );
}

function Navigation() {
  const homeRoute = routes.home();
  return (
    <nav>
      <a {...homeRoute.link}>Home</a>
      <a {...routes.user({ userId: "Abc" }).link}>User "abc"</a>
    </nav>
  );
}

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<App />, container);
