const React = require("react");
const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */

const code = `import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, Route } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
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
    p => \`/user/\${p.userId}\`
  )
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
    return <div>Home</div>;
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

ReactDOM.render(<App />, document.querySelector("#root"));
`;

class Index extends React.Component {
  render() {
    const { baseUrl } = this.props.config;
    return (
      <div className="splash">
        <div className="header">
          <img className="logo" src={`${baseUrl}img/logo.svg`} />
          <div className="projectName">
            Type Route <span className="beta">beta</span>
          </div>
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
            <a href="https://github.com/type-route/type-route/issues">
              issue tracker
            </a>{" "}
            to communicate this feedback in the form of bugs, questions, or
            suggestions.
          </div>
        </div>
        <div className="getStartedContainer">
          <a
            href="/docs/introduction/getting-started"
            className="primary-button"
          >
            Get Started
          </a>
          <a
            href="/docs/guides/simple-react-example"
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
              but isn't coupled to a specific UI framework. Use it with React,
              Angular, Vue or anything else. There's even support for
              non-browser environments such as React Native.
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
          <a style={{ width: "600px" }} target="_blank" data-code={code}>
            <div className="actionThumbnail">
              <img src="/img/code.png" />
            </div>
          </a>
          <div className="seeItInActionText">
            <b>See it in Action.</b>
            Run on CodeSandbox.
          </div>
        </div>
        <div className="getStartedContainer">
          <a
            href="/docs/introduction/getting-started"
            className="primary-button"
          >
            Get Started
          </a>
          <a
            href="/docs/guides/simple-react-example"
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
