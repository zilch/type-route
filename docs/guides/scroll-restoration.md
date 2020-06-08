---
title: Scroll Restoration
---

Anytime you navigate to a new page the usual expectation is that the new page starts scrolled to the top. The browser should handle restoring scroll position as you navigate through history. It will not however ensure new pages are scrolled to the top by default. To ensure this happens in your application you may want to include the following code:

```tsx
useEffect(() => {
  if (route.action === "push") {
    window.scrollTo(0, 0);
  }
}, [route]);
```
 
This will ensure that once a new route renders the page will start scrolled to the top. Here's a full example:

```tsx codesandbox-react
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute } from "type-route";

const { listen, routes, session } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about")
});

function App() {
  const [route, setRoute] = useState(session.getInitialRoute());

  useEffect(() => listen(nextRoute => setRoute(nextRoute)), []);

  // This hook will ensure new pages start scrolled to the top
  useEffect(() => {
    if (route.action === "push") {
      window.scrollTo(0, 0);
    }
  }, [route]);

  return (
    <>
      <nav style={{ position: "fixed", background: "white" }}>
        <a {...routes.home().link}>Home</a>
        <a {...routes.about().link}> About</a>
      </nav>
      <div style={{ paddingTop: "50px", height: "1000px" }}>
        {route.name === "home" && <div>Home</div>}
        {route.name === "about" && <div>About</div>}
        {route.name === false && <div>Not Found</div>}
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
```

Most scroll restoration requirements should be covered by this but if you need to handle [scroll restoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) yourself you can change the default behavior of the browser with this code:

```ts
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
```

When set to manual the browser will not do any automatic scroll restoration as a user navigates through their browsing history. You should then be able to implement scroll restoration logic specific to your application without worrying about the browser attempting its own scroll restoration.
