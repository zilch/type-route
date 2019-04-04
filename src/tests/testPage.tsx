import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute } from "../index";

const { routes, listen, getCurrentRoute } = createRouter({
  p1: defineRoute("/p1"),
  p2: defineRoute("/p2"),
  p3: defineRoute("/p3"),
  p4: defineRoute("/p4"),
  p5: defineRoute("/p5"),
  p6: defineRoute("/p6")
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    document.title = route.name || "Not Found";
  }, [route.name]);

  useEffect(() => {
    const listener = listen(nextRoute => {
      if (route.name === routes.p2.name && !confirm("Are you sure?")) {
        return false;
      }

      setRoute(nextRoute);
    });

    return () => listener.remove();
  }, [route]);

  return (
    <>
      <a href="https://www.bradenhs.com/">external site</a>
      <a {...routes.p1.link()}>P1</a>
      <a {...routes.p2.link()}>P2</a>
      <a {...routes.p3.link()}>P3</a>
      <a {...routes.p4.link()}>P4</a>
      <a {...routes.p5.link()}>P5</a>
      <a {...routes.p6.link()}>P6</a>

      <div>{route.name}</div>
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
