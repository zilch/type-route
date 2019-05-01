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
            Example <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
        <div className="features">
          <div>
            <h4>Flexible</h4>
            Designed with React in mind but not coupled to any specific
            framework. Use with Angular, Vue, React or anything else. If it's
            JavaScript type-route is compatible.
          </div>
          <div>
            <h4>Type Safe</h4>
            First class TypeScript support was the first and last thought when
            designing type-route's API.
          </div>
          <div>
            <h4>Solid Foundation</h4>
            Built on top of the same core library that powers React router.
          </div>
        </div>
        <div className="getStartedContainer">
          <a href="#" className="primary-button">
            Get Started
          </a>
          <a href="#" className="secondary-button">
            Example <span style={{ marginLeft: "4px" }}>→</span>
          </a>
        </div>
      </div>
    );
  }
}

module.exports = Index;
