/* eslint-disable import/first */
// @ts-ignore
window.__DEV__ = true;

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, param, Route, createGroup } from "./index";

const account = defineRoute("/account");

export const { routes, session, listen } = createRouter({
  home: defineRoute(["/dashboard", "/"]),
  account: account.extend(["/overview", "/"]),

  user: defineRoute(
    {
      userId: param.path.string,
    },
    (x) => [`/user/${x.userId}`, `/users/${x.userId}`]
  ),
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
      {route.name === "account" && <AccountPage />}
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

function AccountPage() {
  return <div style={{ height: "1000px" }}>Account Page</div>;
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
  return (
    <nav>
      <a {...routes.home().link}>Home</a>
      <a {...routes.user({ userId: "abc" }).link}>User "abc"</a>
    </nav>
  );
}

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<App />, container);
