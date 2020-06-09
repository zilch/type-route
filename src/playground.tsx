import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, Route } from "./index";
import "./playground.css";

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: "query.param.number.optional",
    },
    () => "/user"
  ),
  user: defineRoute(
    {
      userId: "path.param.string",
    },
    (p) => `/user/${p.userId}`
  ),
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

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
    </nav>
  );
}

const appContainer = document.createElement("div");
document.body.appendChild(appContainer);
ReactDOM.render(<App />, appContainer);
