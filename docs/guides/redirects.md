---
title: Redirects
---

# {{ $frontmatter.title }}

Simple redirects mapping one path to another with the same parameters is built into the `defineRoute` function. Instead of providing a single string you may provide an array of strings. The first item in the array is the primary path for that route. Any route properties handling location will use that primary path. If a secondary path is matched it will be immediately replaced by the primary path.

```tsx
import { createRouter, defineRoute, param } from "type-route";

createRouter({
  dashboard: defineRoute(["/dashboard", "/"]),
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => [`/user/${p.userId}`, `/users/${p.userId}`]
  ),
});
```

In the above example "/" will automatically redirect to "/dashboard" and the plural "/users" route will redirect to the singular "/user" route. For public facing applications you may want to consider making these server side redirects with a `301` status code to ensure search engines are properly indexing your website.

Certain redirect situations may require a non-uniform mapping of parameters between routes. In those cases a more involved approach is necessary. In the below example a transformation of the parameter is necessary to ensure it matches the new route. On every route change we check to see if the route we're on is the old one. If it is we redirect to the new route and display the text "Redirecting..." for the split second the old route is still active.

::: code-group

```tsx [index.tsx]
import { createRouter, defineRoute, param } from "type-route";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const { routes, useRoute, RouteProvider } = createRouter({
  new: defineRoute(
    {
      yearOfBirth: param.query.number,
    },
    (p) => "/new"
  ),
  old: defineRoute(
    {
      ageInYears: param.query.number,
    },
    (p) => "/old"
  ),
});

function App() {
  const route = useRoute();

  useEffect(() => {
    if (route.name === "old") {
      routes
        .new({
          yearOfBirth: new Date().getFullYear() - route.params.ageInYears,
        })
        .replace();
    }
  }, [route]);

  if (route.name === "old") {
    return <div>Redirecting...</div>;
  }

  if (route.name === "new") {
    return <div>New Page {route.params.yearOfBirth}</div>;
  }

  return <div>Not Found</div>;
}

ReactDOM.render(
  <RouteProvider>
    <App />
  </RouteProvider>,
  document.querySelector("#root")
);
```

:::
