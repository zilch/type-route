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
        Hi
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
