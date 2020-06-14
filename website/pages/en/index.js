const React = require("react");
const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */

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
            <b>These are the docs for the `@next` release</b> which includes
            some major differences from the current release. Go to{" "}
            <a href="https://www.type-route.org">type-route.org</a> to view the
            docs for the current release.
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
            <MarkdownBlock>
              First and foremost Type Route strives for excellent TypeScript
              support. An API designed for static analysis not only means the
              compiler has your back but also enables your editor to provide
              intelligent hints and warnings as you code.
            </MarkdownBlock>
          </div>
          <div>
            <h4>Flexible</h4>
            <MarkdownBlock>
              Type Route was designed with excellent React integration in mind
              but isn't coupled to a specific UI framework. Use it with
              [React](/type-route/docs/guides/simple-react-example),
              [Vue](/type-route/docs/guides/simple-vue-example),
              [Svelte](/type-route/docs/guides/simple-svelte-example),
              [Angular](/type-route/docs/guides/simple-angular-example) or
              anything else. There's even support for non-browser environments
              like React Native.
            </MarkdownBlock>
          </div>
          <div>
            <h4>Solid Foundation</h4>
            <div>
              <MarkdownBlock>
                The same [core
                library](https://github.com/ReactTraining/history) behind React
                Router also powers Type Route. From this solid foundation Type
                Route adds a simple and flexible API optimized for a developer
                experience that is second to none.
              </MarkdownBlock>
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
