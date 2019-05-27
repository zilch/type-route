---
title: No Match (404)
---

When the URL of the page does not match a route in the application you'll likely want to display a not found page.

```tsx codesandbox-standard
import { createRouter, defineRoute } from "type-route";

const { getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar")
});

const route = getCurrentRoute();
console.log(route.name);
// This will log either "home", "foo", "bar", or (if the url
// doesn't match one of these routes) the boolean false.
```

When the name of the route is the boolean `false` you can know the URL doesn't match one of the defined routes in your application. You may check against this to determine which page is rendered by the application. Here's a full example:

```tsx codesandbox-react
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar")
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  let pageContents;

  if (route.name === routes.home.name) {
    pageContents = <div>Home</div>;
  } else if (route.name === routes.foo.name) {
    pageContents = <div>Foo</div>;
  } else if (route.name === routes.bar.name) {
    pageContents = <div>Bar</div>;
  } else {
    // route.name will be false here but no need to check it since we've
    // already checked all the other possibilities.
    pageContents = <div>Not Found</div>;
  }

  return (
    <>
      <nav>
        <a {...routes.home.link()}>Home</a>
        <a {...routes.foo.link()}>Foo</a>
        <a {...routes.bar.link()}>Bar</a>
        <a href="/path-that-does-not-match-a-defined-route">Not Found</a>
      </nav>
      {pageContents}
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
```
