import ReactDOM from "react-dom";

export function render(element: JSX.Element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  ReactDOM.render(element, container);
}
