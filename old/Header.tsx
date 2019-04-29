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
  height: "600px",
  boxSizing: "border-box",
  textAlign: "center",
  color: "white",
  fontFamily: "Arial",
  background: "linear-gradient(#383751, #685771)"
});

const cardActionsClassName = style({
  display: "flex",
  $nest: {
    a: {
      background: "rgba(255,255,255,.1)",
      padding: "15px",
      margin: "5px",
      borderRadius: "3px",
      flexGrow: 1,
      color: "white",
      textDecoration: "none"
    }
  }
});

const logoContainerClassName = style({
  padding: "50px"
});

const baseDelay = 300;

export function Header() {
  return (
    <div className={containerClassName}>
      <div>
        <div className={logoContainerClassName}>
          <TransitionIn type="slide-up" delay={baseDelay}>
            <img className={logoClassName} src={logo} />
          </TransitionIn>
          <div>
            <TransitionIn type="slide-up" delay={baseDelay + 50}>
              <h1>type-route</h1>
            </TransitionIn>
            <TransitionIn type="slide-up" delay={baseDelay + 100}>
              A flexible, type safe routing library
            </TransitionIn>
          </div>
        </div>
        <TransitionIn type="slide-up" delay={baseDelay + 150}>
          <div className={cardActionsClassName}>
            <a href="#">GitHub</a>
            <a href="#">Documentation</a>
          </div>
        </TransitionIn>
      </div>
    </div>
  );
}
