---
title: Server Side Rendering
---

### Server

```tsx
import fastify from "fastify";
import ReactDOM from "react-dom/server";
import React from "react";
import { App, history } from "../client";

const app = fastify();

app.get("/*", (request, response) => {
  history.configure({
    type: "memory",
    initialEntries: request.req.url ? [request.req.url] : []
  });

  const appHtml = ReactDOM.renderToString(<App />);

  response.type("text/html");
  response.send(
    `<body><div id="app">${appHtml}</div><script src="http://localhost/bundle.js"></script></body>`
  );
});

app.listen(3000);
```

### Client

```tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute } from "type-route";

export const { listen, routes, getCurrentRoute, history } = createRouter({
  home: defineRoute("/"),
  one: defineRoute("/one"),
  two: defineRoute("/two")
});

export function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  let page;

  if (route.name === routes.home.name) {
    page = <div>Home</div>;
  } else if (route.name === routes.one.name) {
    page = <div>One</div>;
  } else if (route.name === routes.two.name) {
    page = <div>Two</div>;
  } else {
    page = <div>Not Found</div>;
  }

  return (
    <div>
      <nav>
        <a {...routes.home.link()}>Home</a>
        <a {...routes.one.link()}>One</a>
        <a {...routes.two.link()}>Two</a>
      </nav>
      {page}
    </div>
  );
}

if (!process.env.SERVER) {
  ReactDOM.hydrate(<App />, document.querySelector("#app"));
}
```
