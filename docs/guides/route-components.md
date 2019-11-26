---
title: Route Components
---

Those new to Type Route often notice the library lacks a `Route` component. Developers familiar with projects such as React Router will also notice there is no `Router` component which provides (via React context) the current route to the rest of the application. The absence of these components is intentional and consistent with this assertion from the home page.

> Type Route was designed with excellent React integration in mind but isn't coupled to a specific UI framework. React is a first class citizen to Type Route. The best API for React, however, just happened to be framework agnostic.

Outlined below are some of the key reasons behind Type Route's recommendations on providing and consuming route information.

## Providing the Route

Examples throughout the documentation show this simple way of connecting Type Route to your application to provide route information.

```tsx
import React, { useState, useEffect } from "react";
import { createRouter, defineRoute, Route } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar")
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());
  useEffect(() => listen(setRoute), []);

  return <>...</>;
}
```

The first two lines of the `App` component are where Type Route and your application meet. For many applications those two lines are all that will ever be needed. Connecting an application to Type Route via this method is undeniably simple and a `Router` component API would not provide a much more simple experience. The flexibility of the recommended approach, however, trumps any small gains in simplicity that could be realized with a `Router` component API. Handling diverse use cases, from logging route changes to performing redirects, become less a search of the library's documentation to see if the use case is supported and more an application of knowledge you, the developer, already have. Type Route provides an easy out of the box experience that scales well as your application's needs become more complex.

## Consuming the Route

Routing decisions are typically not nested far enough down the component tree to merit a context based approach for consuming route information. Passing down the current route as a `prop` to children is sufficient for the majority of use cases. In situations where routing decisions are nested deep in the component tree adding the route to an existing global state object which is already being passed to children via context is preferred. If the prior two approaches are not feasible then creating a context object specific to Type Route may be appropriate. Taking this latter approach may resemble the following code:

```tsx
import React, { useState, useEffect } from "react";
import { createRouter, defineRoute, Route } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar")
});

const RouteContext = React.createContext<Route<typeof routes> | null>(null);

const useRoute = function() {
  const route = useContext(RouteContext);

  if (route === null) {
    throw new Error(
      "Route must be provided via the RouteContext.Provider component"
    );
  }

  return route;
};

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  return (
    <RouteContext.Provider value={route}>
      <Page />
    </RouteContext.Provider>
  );
}

function Page() {
  const route = useRoute();

  if (route.name === routes.foo.name) {
    return <div>Foo</div>;
  } else if (route.name === routes.bar.name) {
    return <div>Bar</div>;
  } else {
    return <div>Not Found</div>;
  }
}
```

This disadvantage of both of the context dependent solutions is that any narrowing of the type of the route variable on its way down the component tree is lost when the route is reintroduced via the `useRoute` hook in a child component.
