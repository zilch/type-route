---
title: Server Side Rendering
---

# {{ $frontmatter.title }}

Type Route supports server side rendering. The key to making this support possible
is the `router.session.reset` function. This function allows you to reconfigure
the underlying history session instance that powers Type Route. By setting the type of the
instance to "memory" and giving it an initial entry of the current url the user is
requesting, you can be sure that your app will server-side render correctly. Below is an example
of how to accomplish this using React.

### Server Code

```tsx
import fastify from "fastify";
import ReactDOM from "react-dom/server";
import React from "react";
import { App, session, RouteProvider } from "../client";

const app = fastify();

app.get("/*", (request, response) => {
  session.reset({
    type: "memory",
    initialEntries: [request.req.url],
  });

  const appHtml = ReactDOM.renderToString(
    <RouteProvider>
      <App />
    </RouteProvider>
  );

  response.type("text/html");
  response.send(
    `<body><div id="app">${appHtml}</div><script src="http://localhost/bundle.js"></script></body>`
  );
});

app.listen(3000);
```

### Client Code

```tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute } from "type-route";

export const { RouteProvider, useRoute, routes, session } = createRouter({
  home: defineRoute("/"),
  one: defineRoute("/one"),
  two: defineRoute("/two"),
});

export function App() {
  const route = useRoute();

  return (
    <div>
      <nav>
        <a {...routes.home().link}>Home</a>
        <a {...routes.one().link}>One</a>
        <a {...routes.two().link}>Two</a>
      </nav>
      {route.name === "home" && <div>Home</div>}
      {route.name === "one" && <div>One</div>}
      {route.name === "two" && <div>Two</div>}
      {route.name === false && <div>Not Found</div>}
    </div>
  );
}

if (!process.env.SERVER) {
  ReactDOM.hydrate(
    <RouteProvider>
      <App />
    </RouteProvider>,
    document.querySelector("#app")
  );
}
```
