import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, Route } from "./index";

// router.create;
// router.Link;
// router.ParameterType;
// router.Route;
// router.defineRoute;
// router.noMatch;
// router.path;
// router.query;
// router.state;

// TODO
// - Redirects? More seamless somehow (change recommendation)
// - Trailing/optional path parameter 👍
// - Default parameter 👍
// - Custom parameter types 👍
// - Partial path parameter (i.e. not just between slashes / /) 👍
// - ? Custom query string parsing 👍
// - Location state parameters 👍
// - Initial route from history as opposed to current route 👍
// - Abstraction of safe history methods 👍
// - Integration tests (cypress)
// - export link type 👍
// referential integrity of route 👍
// updated docs
// hashes?
// on link click intercept

import "./playground.css";

// const number: ParameterType<number> = {
//   urlEncode: false,
//   parse: raw => {
//     if (!isNumeric(raw)) {
//       return noMatch;
//     }

//     return parseFloat(raw);
//   },
//   toString: value => value.toString()
// };

// const hostListParams: ParamterType<HostListParams> = {
//   urlEncode: false
// };

// parameter.path.number;
// parameter.path.string;

const { routes, listen, getCurrentRoute } = createRouter(
  {
    home: defineRoute("/"),
    userList: defineRoute(
      {
        page: "query.param.number.optional"
      },
      () => "/user"
    ),
    user: defineRoute(
      {
        userId: "path.param.string"
      },
      x => `/user/${x.userId}`
    )
  }
  // {
  //   queryStringParser: routeName => {
  //     if (routeName) {
  //       return null;
  //     }

  //     return {
  //       parse: () => {},
  //       toString: () => {}
  //     };
  //   }
  // }
);

// history.getInitialRoute();
// history.navigate();
// history.goBack();
// history.getInternalInstance();
// history.reinitialize();
// history.getEntries();

function App() {
  const [route, setRoute] = useState(() => getCurrentRoute());

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
