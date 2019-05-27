---
title: Scroll Restoration
---

Anytime you navigate to a new page the usual expectation is that the new page starts scrolled to the top. To ensure this happens in your application you may want to include the following code:

```tsx codesandbox-react
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute } from "type-route";

const { listen, routes, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about")
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const removeListener = listen(nextRoute => {
      setRoute(nextRoute);
      window.scrollTo(0, 0);
    });

    return removeListener;
  }, []);

  let pageContents;

  if (route.name === routes.home.name) {
    pageContents = <div>Home</div>;
  } else if (route.name === routes.about.name) {
    pageContents = <div>About</div>;
  } else {
    pageContents = <div>Not Found</div>;
  }

  return (
    <>
      <nav style={{ position: "fixed", background: "white" }}>
        <a {...routes.home.link()}>Home</a>
        <a {...routes.about.link()}> About</a>
      </nav>
      <div style={{ paddingTop: "50px", height: "1000px" }}>{pageContents}</div>
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
```
