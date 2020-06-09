---
title: React Components
---

Those new to Type Route often notice the library lacks a `Route` or `Link` component. Developers familiar with projects such as React Router will also notice there is no `Router` component which provides (via React context) the current route to the rest of the application. An API including these components helps developers avoid tedious [prop drilling](https://kentcdodds.com/blog/prop-drilling). Type Route, however, doesn't ship with these components because they are easy to implement in user land. In user land these components will evolve more easily with the unique needs of a particular application. Fortunately, React provides a simple context API to help developers avoid prop drilling. Creating a context object and custom hook for Type Route can be done with just two lines of code:

```tsx
const RouteContext = React.createContext(session.getInitialRoute());
const useRoute = () => React.useContext(RouteContext);
```

**Every approach has trade-offs.** In return for simple, type-safe APIs that will better scale with your application as it grows in size and complexity, Type Route asks you to accept a small amount of added up-front code. The goal is to provide a simple, flexible and powerful API where solving for different use cases is more an application of knowledge you the developer already have, and less a search through documentation. 

## Example

Some light abstractions on top of the Type Route API which take advantage React context may look something like this in practice: 

```tsx codesandbox-react
import React, { useState, useEffect, createContext, useContext } from "react";
import { createRouter, defineRoute, Route, param } from "type-route";

const { routes, listen, session } = createRouter({
  foo: defineRoute(
    {
      baz: param.path.string
    }
    p => `/foo/${p.baz}`
  ),
  bar: defineRoute("/bar")
});

const RouteContext = createContext(session.getInitialRoute());
const useRoute = () => useContext(RouteContext);

function App() {
  const [route, setRoute] = useState(session.getInitialRoute());
  useEffect(() => listen(nextRoute => setRoute(nextRoute)), []);

  return (
    <RouteContext.Provider value={route}>
      <Navigation/>
      <Page/>
    </RouteContext.Provider>
  );
}

function Navigation() {
  return (
    <nav>
      <NavLink to={routes.foo({ baz: "abc" })}>Foo "abc"</NavLink>
      <NavLink to={routes.bar()}>Bar</NavLink>
    </nav>
  );
}

function NavLink(props: { to: Route<typeof routes>, children?: React.ReactNode }) {
  const route = useRoute();
  const { to, children } = props;
  
  return (
    <a
      {...to.link}
      className={to.name === route.name ? "active" : undefined}
    >
      {children}
    </a>
  );
}

function Page() {
  const route = useRoute();

  return (
    <main>
      {route.name === "foo" && <FooPage route={route}/>}
      {route.name === "bar" && <BarPage/>}
      {route.name === false && <NotFoundPage/>}
    </main>
  );
}

function FooPage(props: { route: Route<typeof routes.foo> }) {
  const { route } = props;

  return (
    <div>Foo {route.param.baz}</div>
  );
}

function BarPage() {
  return (
    <div>Bar</div>
  );
}

function NotFoundPage() {
  return (
    <div>Not Found</div>
  );
}
```

## TypeScript

Its worth noting that a disadvantage of a context dependent solution is that any narrowing of the type of the `route` variable on its way down the component tree is lost when the route is reintroduced via the `useRoute` hook in a child component. It will typically only make sense to use the `useRoute` hook in a place you truly expect the route to be anything. When you start narrowing the type of the route to access its `params` with confidence you'll likely want to pass that route down the component tree explicitly via props instead of context. This, of course, is general guidance. Specific needs of different applications will vary.
