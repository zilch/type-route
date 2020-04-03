import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, param, Route } from "./index";

import "./playground.css";

const { routes, listen, history } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number.default(1),
      page2: param.query.optional.number
    },
    () => `/users`
  ),
  user: defineRoute(
    {
      userId: param.path.string
    },
    x => `/users/${x.userId}`
  )
});

function App() {
  const [route, setRoute] = useState(() => history.getInitialRoute());

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
        Page: {route.params.page || "-"}
      </div>
    );
  }

  if (route.name === routes.user.name) {
    return <div>User {route.params.userId}</div>;
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
          page: 2
        })}
      >
        User List Page 2
      </a>
      <a
        {...routes.user.link({
          userId: "abc"
        })}
      >
        User "abc"
      </a>
    </nav>
  );
}

const appContainer = document.createElement("div");
document.body.appendChild(appContainer);
ReactDOM.render(<App />, appContainer);
