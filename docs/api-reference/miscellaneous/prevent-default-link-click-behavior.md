---
title: preventDefaultLinkClickBehavior
---

# {{ $frontmatter.title }}

The `preventDefaultLinkClick` function takes a browser mouse event object and, if that object indicates the user did a primary click (usually a left lick) on the element and was not pressing a modifier key, will call `preventDefault` on the event and return `true`. You may want to create a custom `link` function or component that does something other than `push` the current route onto the history stack. There may be a case where instead of pushing the route into history you want to replace the current route. An implementation of this could look something like the following:

```tsx
import { preventDefaultLinkClickBehavior, Route } from "type-route";

...

function replaceLink(route: Route<typeof routes>) {
  return {
    href: route.href,
    onClick: (event) => {
      if (preventDefaultLinkClickBehavior(event)) {
        route.replace();
      }
    }
  }
}

<a {...replaceLink(routes.foo())}>Foo</a>
```
