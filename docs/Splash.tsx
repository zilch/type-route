import React from "react";
import logo from "../artwork/logo.svg";
import { style } from "typestyle";
import { TransitionIn } from "./TransitionIn";

const logoClassName = style({
  width: "140px",
  marginBottom: "20px"
});

const containerClassName = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  height: "100vh",
  boxSizing: "border-box",
  textAlign: "center",
  color: "white",
  fontFamily: "Arial"
});

const cardActionsClassName = style({
  display: "flex",
  $nest: {
    a: {
      padding: "20px",
      flexGrow: 1,
      color: "white",
      textDecoration: "none"
    }
  }
});

const logoContainerClassName = style({
  padding: "50px"
});

export function Splash() {
  return (
    <div className={containerClassName}>
      <div>
        <div className={logoContainerClassName}>
          <TransitionIn type="slide-up">
            <img className={logoClassName} src={logo} />
          </TransitionIn>
          <div>
            <TransitionIn type="slide-up" delay={50}>
              <h1>type-route</h1>
            </TransitionIn>
            <TransitionIn type="slide-up" delay={100}>
              <div>A flexible, type safe routing library</div>
            </TransitionIn>
          </div>
        </div>
        <div className={cardActionsClassName}>
          <TransitionIn type="slide-up" delay={150}>
            <a href="#">GitHub</a>
          </TransitionIn>
          <TransitionIn type="slide-up" delay={200}>
            <a href="#">Documentation</a>
          </TransitionIn>
        </div>
      </div>
    </div>
  );
}
