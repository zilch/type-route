---
title: Page Layout
---

Most applications have a layout structure resembling something like the following:

- Header
- Page Content (dynamic based on route)
- Footer

Type Route is flexible enough to let the above pattern be accomplished in a variety of ways. While flexibility is powerful it also helps to have some guidance when figuring out your approach.

<details>
<summary>Bad Example</summary>

```tsx
import React, { useState, useEffect } from "react";
import { createRouter, defineRoute } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar"),
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  if (route.name === routes.home.name) {
    return <HomePage/>
  } else if (route.name === routes.foo.name) {
    return <FooPage/>
  } else if (route.name === routes.bar.name) {
    return <BarPage/>
  } else {
    return <NotFoundPage/>
  }
}

function Header() {
  return <nav>
    <a {...routes.home.link()}>Home</a>
    <a {...routes.foo.link()}>Foo</a>
    <a {...routes.bar.link()}>Bar</a>
  </nav>
}

function Footer() {
  return <footer>
    <div>Footer</div>
  </footer>
}

function HomePage() {
  return <>
    <Header>
    <div>Home Page</div>
    </Footer>
  </>
}

function FooPage() {
  return <>
    <Header>
    <div>Foo Page</div>
    </Footer>
  </>
}

function BarPage() {
  return <>
    <Header>
    <div>Bar Page</div>
    </Footer>
  </>
}

function NotFoundPage() {
  return <>
    <Header>
    <div>Bar Page</div>
    </Footer>
  </>
}
```

</details>

The above example would work but, on every page change, the `Header` and `Footer` components would be unmounted and remounted unnecessarily. Consider the follow approach instead:

<details>
<summary>Good Example</summary>

```tsx
import React, { useState, useEffect } from "react";
import { createRouter, defineRoute } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  foo: defineRoute("/foo"),
  bar: defineRoute("/bar"),
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  let page;

  if (route.name === routes.home.name) {
    page = <HomePage/>
  } else if (route.name === routes.foo.name) {
    page = <FooPage/>
  } else if (route.name === routes.bar.name) {
    page = <BarPage/>
  } else {
    page = <NotFoundPage/>
  }

  return <>
    <Header>
    {page}
    </Footer>
  </>;
}

function Header() {
  return <nav>
    <a {...routes.home.link()}>Home</a>
    <a {...routes.foo.link()}>Foo</a>
    <a {...routes.bar.link()}>Bar</a>
  </nav>
}

function Footer() {
  return <footer>
    <div>Footer</div>
  </footer>
}

function HomePage() {
  return <div>Home Page</div>
}

function FooPage() {
  return <div>Foo Page</div>
}

function BarPage() {
  return <div>Bar Page</div>
}

function NotFoundPage() {
  return <div>Bar Page</div>
}
```

</details>

This good example ensures that the `Header` and `Footer` components are not unmounted then remounted unnecessarily.
