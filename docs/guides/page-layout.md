---
title: Page Layout
---

# {{ $frontmatter.title }}

Most applications have a layout structure resembling something like the following:

- Header
- Page Content (dynamic based on route)
- Footer

Type Route is flexible enough to let the above pattern be accomplished in a variety of ways. While flexibility is powerful it also helps to have some guidance when figuring out your approach.

::: details Bad Example

```tsx
import React, { useState, useEffect } from "react";
import { createRouter, defineRoute } from "type-route";

const { routes, useRoute } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar"),
});

function App() {
  const route = useRoute();

  return (
    <>
      {route.name === "home" && <HomePage />}
      {route.name === "foo" && <FooPage />}
      {route.name === "bar" && <BarPage />}
      {route.name === false && <NotFoundPage />}
    </>
  );
}

function Header() {
  return (
    <nav>
      <a {...routes.home().link}>Home</a>
      <a {...routes.foo().link}>Foo</a>
      <a {...routes.bar().link}>Bar</a>
    </nav>
  );
}

function Footer() {
  return (
    <footer>
      <div>Footer</div>
    </footer>
  );
}

function HomePage() {
  return (
    <>
      <Header />
      <div>Home Page</div>
      <Footer />
    </>
  );
}

function FooPage() {
  return (
    <>
      <Header />
      <div>Foo Page</div>
      <Footer />
    </>
  );
}

function BarPage() {
  return (
    <>
      <Header />
      <div>Bar Page</div>
      <Footer />
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <Header />
      <div>Bar Page</div>
      <Footer />
    </>
  );
}
```

:::

The above example would work but, on every page change, the `Header` and `Footer` components would be unmounted and remounted unnecessarily. Consider the following approach instead:

::: details Good Example

```tsx
import React, { useState, useEffect } from "react";
import { createRouter, defineRoute } from "type-route";

const { routes, useRoute } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar"),
});

function App() {
  const route = useRoute();

  return (
    <>
      <Header />
      {route.name === "home" && <HomePage />}
      {route.name === "foo" && <FooPage />}
      {route.name === "bar" && <BarPage />}
      {route.name === false && <NotFoundPage />}
      <Footer />
    </>
  );
}

function Header() {
  return (
    <nav>
      <a {...routes.home().link}>Home</a>
      <a {...routes.foo().link}>Foo</a>
      <a {...routes.bar().link}>Bar</a>
    </nav>
  );
}

function Footer() {
  return (
    <footer>
      <div>Footer</div>
    </footer>
  );
}

function HomePage() {
  return <div>Home Page</div>;
}

function FooPage() {
  return <div>Foo Page</div>;
}

function BarPage() {
  return <div>Bar Page</div>;
}

function NotFoundPage() {
  return <div>Bar Page</div>;
}
```

:::

This good example ensures that the `Header` and `Footer` components are not unmounted then remounted unnecessarily.
