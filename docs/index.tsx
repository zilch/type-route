import React from "react";
import ReactDOM from "react-dom";
import { Splash } from "./Splash";
import { forceRenderStyles } from "typestyle";

forceRenderStyles();

ReactDOM.render(<Splash />, document.querySelector("#root"));
