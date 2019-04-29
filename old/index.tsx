import React from "react";
import ReactDOM from "react-dom";
import { Header } from "./Header";
import { forceRenderStyles } from "typestyle";

forceRenderStyles();

ReactDOM.render(
  <div>
    <Header />
    hi
  </div>,
  document.querySelector("#root")
);
