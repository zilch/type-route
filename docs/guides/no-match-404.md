---
title: No Match (404)
---

# {{ $frontmatter.title }}

When the URL of the page does not match a route in the application you'll likely want to display a not found page.

::: code-group

```ts [index.ts]
import { createRouter, defineRoute } from "type-route";

const { session } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar"),
});

const route = session.getInitialRoute();
console.log(route.name);
// This will log either "home", "foo", "bar", or (if the url
// doesn't match one of these routes) the boolean false.
```

:::

When the name of the route is the boolean `false` you can know the URL doesn't match one of the defined routes in your application. You may check against this to determine which page is rendered by the application. Here's a full example:

::: code-group

```tsx [index.tsx]
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute } from "type-route";

const { routes, useRoute, RouteProvider } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar"),
});

function App() {
  const route = useRoute();

  return (
    <>
      <nav>
        <a {...routes.home().link}>Home</a>
        <a {...routes.foo().link}>Foo</a>
        <a {...routes.bar().link}>Bar</a>
        <a href="/path-that-does-not-match-a-defined-route">Not Found</a>
      </nav>
      {route.name === "home" && <div>Home</div>}
      {route.name === "foo" && <div>Foo</div>}
      {route.name === "bar" && <div>Bar</div>}
      {route.name === false && <div>Not Found</div>}
    </>
  );
}

ReactDOM.render(
  <RouteProvider>
    <App />
  </RouteProvider>,
  document.querySelector("#root")
);
```

:::
