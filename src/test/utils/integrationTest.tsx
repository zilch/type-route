import * as TypeRoute from "../../index";
import * as React from "react";
import { render } from "./render";
import * as tslib from "tslib";

window.render = render;
window.React = React;
window.TypeRoute = TypeRoute;

Object.assign(window, tslib);
