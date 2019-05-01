const React = require("react");

class Index extends React.Component {
  render() {
    const { baseUrl } = this.props.config;
    return (
      <div className="splash">
        <div className="header">
          <img className="logo" src={`${baseUrl}img/logo.svg`} />
          <div className="projectName">type-route</div>
          <div className="projectTagLine">
            A flexible, type safe routing library.
          </div>
        </div>
        <div className="getStartedContainer">
          <a href="#" className="primary-button">
            Get Started
          </a>
          <a href="#" className="secondary-button">
            See Example <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
        <div className="features">
          <div>
            <h4>Flexible</h4>
            `type-route` was designed with excellent React integration in mind
            but isn't coupled to a specific UI framework. Use it with React,
            Angular, Vue or anything else. There's even support for non-browser
            environments such as React Native.
          </div>
          <div>
            <h4>Type Safe</h4>
            First and foremost `type-route` strives for excellent TypeScript
            support. An API designed for static analysis not only means the
            compiler has your back but also enables your editor to be
            intelligent as you code.
          </div>
          <div>
            <h4>Solid Foundation</h4>
            The same core library behind React Router also powers `type-route`.
            From this solid foundation `type-route` adds a simple and flexible
            API optimized for a developer experience that is second to none.
          </div>
        </div>
        <div className="getStartedContainer">
          <a href="#" className="primary-button">
            Get Started
          </a>
          <a href="#" className="secondary-button">
            See Example <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
      </div>
    );
  }
}

module.exports = Index;
