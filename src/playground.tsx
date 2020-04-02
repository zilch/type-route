import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, createGroup, param } from "./index";

param.path.number;
param.path.optional.ofType<number>().default(5);

const { routes, listen, history } = createRouter({
  home: defineRoute({}, () => "/"),
  userList: defineRoute(
    {
      page: param.query.optional.number.default(1)
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

const userGroup = createGroup([routes.user, routes.userList]);

function App() {
  const [route, setRoute] = useState(history.getInitialRoute());

  routes.home;
  routes.userList;
  routes.userList.link({});

  useEffect(() => listen(setRoute), []);

  let page;

  if (userGroup.has(route)) {
    route.name;
  }

  if (route.name === routes.home.name) {
    page = <div>Home</div>;
  } else if (route.name === routes.userList.name) {
    page = <div>User List (Page {route.params.page}</div>;
  } else if (route.name === routes.user.name) {
    page = <div>User {route.params.userId}</div>;
  } else {
    page = <div>Not Found</div>;
  }

  return (
    <div>
      <header>
        <a {...routes.home.link()}>Home</a>
        <a {...routes.userList.link()}>User List</a>
        <a {...routes.user.link({ userId: "abc" })}>User abc</a>
      </header>
      {page}
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
