const React = require("react");
const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */

class Index extends React.Component {
  render() {
    const { baseUrl } = this.props.config;
    return (
      <div className="splash">
        <div className="header">
          <img className="logo" src={`${baseUrl}img/logo.svg`} />
          <div className="projectName">
            type-route <span className="beta">beta</span>
          </div>
          <div className="projectTagLine">
            A flexible, type safe routing library.
          </div>
        </div>
        <div className="betaNotification">
          <div>
            <b>Disclaimer: This is a beta release.</b> Early adopters are
            encouraged with the understanding that type-route could undergo
            significant changes before release <b>1.0</b>. Help the project
            reach its first stable release by using the{" "}
            <a href="https://github.com/type-route/type-route/issues">
              issue tracker
            </a>{" "}
            for bugs, questions, or suggestions.
          </div>
        </div>
        <div className="getStartedContainer">
          <a
            href="/docs/introduction/getting-started"
            className="primary-button"
          >
            Get Started
          </a>
          <a href="/docs/guides/react" className="secondary-button">
            See Examples <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
        <div className="features">
          <div>
            <h4>Flexible</h4>
            <MarkdownBlock>
              `type-route` was designed with excellent React integration in mind
              but isn't coupled to a specific UI framework. Use it with React,
              Angular, Vue or anything else. There's even support for
              non-browser environments such as React Native.
            </MarkdownBlock>
          </div>
          <div>
            <h4>Type Safe</h4>
            <MarkdownBlock>
              First and foremost `type-route` strives for excellent TypeScript
              support. An API designed for static analysis not only means the
              compiler has your back but also enables your editor to be
              intelligent as you code.
            </MarkdownBlock>
          </div>
          <div>
            <h4>Solid Foundation</h4>
            <MarkdownBlock>
              The same [core library](https://github.com) behind React Router
              also powers `type-route`. From this solid foundation `type-route`
              adds a simple and flexible API optimized for a developer
              experience that is second to none.
            </MarkdownBlock>
          </div>
        </div>
        <div className="sandboxContainer">
          <h2>See it in Action&nbsp;&nbsp;🚀</h2>
          <code
            className="stackblitz"
            data-code={`
              <div>Hello</div>
              //---
              console.log("Hello");
            `}
          />
        </div>
        <div className="getStartedContainer">
          <a
            href="/docs/introduction/getting-started"
            className="primary-button"
          >
            Get Started
          </a>
          <a href="/docs/guides/react" className="secondary-button">
            See Examples <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
      </div>
    );
  }
}

module.exports = Index;
