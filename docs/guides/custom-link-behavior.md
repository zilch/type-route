---
title: Custom Link Behavior
---

# {{ $frontmatter.title }}

The standard way to create links in Type Route looks something like this:

```tsx
<a {...routes.foo({ bar: "abc" }).link}>Foo</a>
```

This works great for the majority of scenarios. But what if you want to integrate this link with React's `useTransition` hook when running in concurrent mode or want to log an analytics event when someone clicks on the link? Type Route handles the default case well but also gives you the flexibility to handle these more complex requirements. In order to fullfil these requirements you may want to consider creating a `getLink` function or `Link` component specific to your application.

**Function**

```tsx
import { Route, preventDefaultClickBehavior } from "type-route";
import { routes } from "./router";

function link(to: Route<typeof routes>) {
  return {
    href: to.href,
    onClick: (e: React.MouseEvent) => {
      if (preventDefaultClickBehavior(e)) {
        to.push();
      }
    },
  };
}
```

```tsx
<a {...link(routes.foo({ bar: "abc" }))}>Foo</a>
```

**Component**

```tsx
import React from "react";
import { Route, preventDefaultClickBehavior } from "type-route";
import { routes } from "./router";

type Props = {
  to: Route<typeof routes>;
  children?: React.ReactNode;
};

function Link(props: Props) {
  const { to, children } = props;

  return (
    <a
      href={to.href}
      onClick={(event) => {
        if (preventDefaultLinkClickBehavior(event)) {
          to.push();
        }
      }}
    >
      {children}
    </a>
  );
}
```

```tsx
<Link to={routes.foo({ bar: "abc" })}>Foo</Link>
```

---

From this starting point you could modify the code to do any number of things tailored to your particular needs.

**Related pages:**

- [Rendering Links](./rendering-links.md)
- [Styling of Links for the Currently Active Route](./styling-active-route-link.md)
- [preventDefaultLinkClickBehavior](../api-reference/miscellaneous/prevent-default-link-click-behavior.md)
