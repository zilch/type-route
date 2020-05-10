/* eslint-disable import/first */
// @ts-ignore
window.__DEV__ = true;

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  createRouter,
  defineRoute,
  param,
  Route,
  assertUnreachable,
} from "./index";
import { AddonContext } from "./types";

const routeDefs = {
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
      stuff: param.query.optional.array.string.default([]),
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
};

export const { listen, routes, session } = createRouter({
  routeDefs,
  addons: { setTitle },
});

function setTitle(ctx: AddonContext<typeof routeDefs>) {
  if (ctx.route.name === "home") {
    document.title = "Home";
  } else if (ctx.route.name === "software") {
    document.title = `Software ${ctx.route.params.name} ${
      ctx.route.params.version ?? ""
    }`;
  } else if (ctx.route.name === "user") {
    document.title = `User ${ctx.route.params.userId}`;
  } else if (ctx.route.name === "userList") {
    document.title = `Users | Page ${ctx.route.params.page}`;
  } else if (ctx.route.name === false) {
    document.title = "Not Found";
  } else {
    assertUnreachable(ctx.route);
  }
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

  useEffect(() => {
    route.addons.setTitle();
  }, [route]);

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
      <a {...routes.user.link({ userId: "abc" })}>User "abc"</a>
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

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<App />, container);
