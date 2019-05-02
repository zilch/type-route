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
          <MarkdownBlock>
            **Disclaimer: This is a beta release.** Early adopters are
            encouraged but using type-route in its current state for anything
            mission critical is not recommended. Help the project reach `1.0` by
            using the GitHub issue tracker for anything from bugs to questions,
            and suggestions/pain-points to positive experiences.
          </MarkdownBlock>
        </div>
        <div className="getStartedContainer">
          <a href="#" className="primary-button">
            Get Started
          </a>
          <a href="#" className="secondary-button">
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
              The same core library behind React Router also powers
              `type-route`. From this solid foundation `type-route` adds a
              simple and flexible API optimized for a developer experience that
              is second to none.
            </MarkdownBlock>
          </div>
        </div>
        <div className="sandboxContainer">
          <h2>
            See it in Action <span style={{ marginLeft: "10px" }}>🚀</span>
          </h2>
          <div className="sandbox">
            <iframe
              id="player"
              type="text/html"
              width="100%"
              height="100%"
              src="http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1&modestbranding=1"
              frameborder="0"
            />
          </div>
        </div>
        <div className="getStartedContainer">
          <a href="#" className="primary-button">
            Get Started
          </a>
          <a href="#" className="secondary-button">
            See Examples <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
      </div>
    );
  }
}

module.exports = Index;
