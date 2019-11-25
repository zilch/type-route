---
title: Route Components & React Context
---

Those new to Type Route often notice the library lacks a `Route` component. Developers familiar with projects such as React Router will also notice there is no `Router` component which provides (via React context) the current route to the rest of the application. The absence of these components is intentional and consistent with this assertion from the home page.

> Type Route was designed with excellent React integration in mind but isn't coupled to a specific UI framework. React is a first class citizen to Type Route. The best API for React, however, just happened to be framework agnostic.

Typically routing decisions are not nested far enough down the component tree to merit a context based approach. Passing down the current route as a `prop` to children is sufficient for the majority of use cases. In situations where routing decisions are nested deep in the component tree adding the route to an existing global state object which is already being passed to children via context is preferred. This might look something like:

```tsx
import { createRouter, defineRoute } from "type-route";

const { listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar")
});

function App() {
  const [appState, setAppState] = useState({
    route: getCurrentRoute(),
    ...otherStuff
  });

  useEffect(() => {
    listen(route => {
      setAppState(appState => {
        return { ...appState, route };
      });
    });
  }, []);

  return (
    <AppStateContext.Provider value={appState}>
      <Foo />
      <Bar />
    </AppStateContext.Provider>
  );
}
```

If the prior two approaches are not feasible then creating a context specific to Type Route may be appropriate. Taking this approach may resemble the following code:

```tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, Route } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar")
});

const RouteContext = React.createContext<Route<typeof routes> | null>(null);

const useRoute = function() {
  const route = useContext(RouteContext);

  if (route === null) {
    throw new Error("Route must be provided via the RouteProvider component");
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

This disadvantage of both context dependent solutions is that any narrowing of the type of the route variable on its way down the component tree is lost when the route is reintroduced via the `useRoute` hook in a child component.
