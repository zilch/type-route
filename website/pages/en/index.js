const React = require("react");

const code = `import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, param, Route } from "type-route";

const { routes, listen, session } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number
    },
    () => "/user"
  ),
  user: defineRoute(
    {
      userId: param.path.string
    },
    p => \`/user/\${p.userId}\`
  )
});

function App() {
  const [route, setRoute] = useState(session.getInitialRoute());

  useEffect(() => listen(nextRoute => setRoute(nextRoute)), []);

  return (
    <>
      <Navigation />
      {route.name === "home" && <HomePage/>}
      {route.name === "userList" && <UserListPage route={route}/>}
      {route.name === "user" && <UserPage route={route}/>}
      {route.name === false && <NotFoundPage/>}
    </>
  );
}

function HomePage() {
  return <div>Home</div>;
}

function UserListPage({ route }: { route: Route<typeof routes.userList> }) {
  return (
    <div>
      User List
      <br />
      Page: {route.params.page || "-"}
    </div>
  );
}

function UserPage({ route }: { route: Route<typeof routes.user> }) {
  return <div>User {route.params.userId}</div>;
}

function NotFoundPage() {
  return <div>Not Found</div>;
}

function Navigation() {
  return (
    <nav>
      <a {...routes.home().link}>Home</a>
      <a {...routes.userList().link}>User List</a>
      <a
        {...routes.userList({
          page: 2
        }).link}
      >
        User List Page 2
      </a>
      <a
        {...routes.user({
          userId: "abc"
        }).link}
      >
        User "abc"
      </a>
    </nav>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
`;

class Index extends React.Component {
  render() {
    const { baseUrl } = this.props.config;
    return (
      <div className="splash">
        <div className="header">
          <img
            className="logo"
            src={`${baseUrl}img/type-route-logo.svg`}
            alt="Type Route"
          />
          <div className="projectName">Type Route</div>
          <div className="projectTagLine">
            A flexible, type safe routing library.
          </div>
        </div>
        <div className="betaNotification">
          <div>
            <b>This is a beta release.</b> The Type Route API has been vetted
            with production code but the library has not yet reached version{" "}
            <b>1.0</b>. More community feedback is needed to validate the
            project's maturity. Use the{" "}
            <a href="https://github.com/typehero/type-route/issues/new">
              issue tracker
            </a>{" "}
            to communicate this feedback in the form of bugs, questions, or
            suggestions.
          </div>
        </div>
        <div className="getStartedContainer">
          <a
            href={`${baseUrl}docs/introduction/getting-started`}
            className="primary-button"
          >
            Get Started
          </a>
          <a
            href={`${baseUrl}docs/guides/simple-react-example`}
            className="secondary-button"
          >
            See Examples <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
        <div className="features">
          <div>
            <h4>Type Safe</h4>
            First and foremost Type Route strives for excellent TypeScript
            support. An API designed for static analysis not only means the
            compiler has your back but also enables your editor to provide
            intelligent hints and warnings as you code.
          </div>
          <div>
            <h4>Flexible</h4>
            Type Route was designed with excellent React integration in mind but
            isn't coupled to a specific UI framework. Use it with Vue, Svelte,
            Angular, Ember or{" "}
            <a href="/type-route/docs/guides/type-route-without-react">
              anything else
            </a>
            . There's even support for non-browser environments like React
            Native.
          </div>
          <div>
            <h4>Solid Foundation</h4>
            <div>
              The same{" "}
              <a href="https://github.com/ReactTraining/history">
                core library
              </a>{" "}
              behind React Router also powers Type Route. From this solid
              foundation Type Route adds a simple and flexible API optimized for
              a developer experience that is second to none.
            </div>
          </div>
        </div>
        <div className="seeItInAction">
          <a style={{ width: "665px" }} target="_blank" data-code={code}>
            <span className="actionThumbnail">
              <img
                src={`${baseUrl}img/code.png`}
                alt="See it in Action. Run on CodeSandbox."
              />
            </span>
          </a>
          <div className="seeItInActionText">
            <b>See it in Action.</b>
            Run on CodeSandbox.
          </div>
        </div>
        <div className="getStartedContainer">
          <a
            href={`${baseUrl}docs/introduction/getting-started`}
            className="primary-button"
          >
            Get Started
          </a>
          <a
            href={`${baseUrl}docs/guides/simple-react-example`}
            className="secondary-button"
          >
            See Examples <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
      </div>
    );
  }
}

module.exports = Index;
