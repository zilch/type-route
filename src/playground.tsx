/* eslint-disable import/first */
// @ts-ignore
window.__DEV__ = true;

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, param, Route, createConfig } from "./index";

const config = createConfig({
  addons: { preloadLink },
});

export const { routes, session, listen } = createRouter(config, {
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (x) => `/users/${x.userId}`
  ),
});

function preloadLink(route: Route<typeof routes>) {
  return route.link();
}

function App() {
  const [route, setRoute] = useState(() => session.getInitialRoute());
  const [lock, setLock] = useState(false);

  useEffect(
    () =>
      listen((nextRoute) => {
        if (lock) {
          return false;
        }

        setRoute(nextRoute);
        return;
      }),
    [lock]
  );

  return (
    <>
      <Navigation />
      <Page route={route} />
      {lock ? "Locked" : "Unlocked"}{" "}
      <button onClick={() => setLock((value) => !value)}>Toggle</button>
    </>
  );
}

function Page(props: { route: Route<typeof routes> }) {
  const { route } = props;

  if (route.name === routes.user.name) {
    return <div>User {route.params.userId}</div>;
  }

  return <div>Not Found</div>;
}

function Navigation() {
  return (
    <nav>
      <a {...routes.user.addons.preloadLink({ userId: "abc" })}>User "abc"</a>
    </nav>
  );
}

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<App />, container);
