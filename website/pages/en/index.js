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
        <div className="sandboxContainer">
          <h2>See it in Action&nbsp;&nbsp;🚀</h2>
          <div className="stackblitz">
            <iframe src="https://stackblitz.com/edit/type-route?embed=1&file=index.ts&hideExplorer=1&hideNavigation=1" />
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
