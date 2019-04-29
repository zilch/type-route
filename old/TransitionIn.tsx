import React from "react";
import { style, keyframes, classes } from "typestyle";

const ANIMATION_DURATION = 400;

function getSlideTransitionClassName(
  property: "translateX" | "translateY",
  from: number
) {
  return style({
    animationFillMode: "both",
    animationDuration: `${ANIMATION_DURATION}ms`,
    animationName: keyframes({
      from: {
        opacity: 0,
        transform: `${property}(${from}px)`
      },
      to: {
        opacity: 1,
        transform: `${property}(0px)`
      }
    })
  });
}

const fadeInClassName = style({
  animationFillMode: "both",
  animationDuration: `${ANIMATION_DURATION}ms`,
  animationName: keyframes({
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  })
});

type Props = {
  children: React.ReactNode;
  type: "slide-up" | "slide-down" | "slide-left" | "slide-right" | "fade";
  className?: string;
  delay?: number;
};

const transitionClassNameMap: Record<Props["type"], string> = {
  fade: fadeInClassName,
  "slide-down": getSlideTransitionClassName("translateY", -10),
  "slide-up": getSlideTransitionClassName("translateY", 10),
  "slide-left": getSlideTransitionClassName("translateX", -10),
  "slide-right": getSlideTransitionClassName("translateX", 10)
};

export function TransitionIn(props: Props) {
  const { className, type, children, delay } = props;

  return (
    <div
      style={{ animationDelay: (delay || 0) + "ms" }}
      className={classes(className, transitionClassNameMap[type])}
    >
      {children}
    </div>
  );
}
