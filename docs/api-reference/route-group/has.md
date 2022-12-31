---
title: <RouteGroup>.has
---

# {{ $frontmatter.title }}

```tsx
<RouteGroup>.has(route: Route): boolean
```

The `has` function is the only property on the `RouteGroup` object returned by the `createGroup` function. It takes a `route` and returns a `boolean`.

#### Example

```tsx
import { defineRoute, createRouter, createGroup, param } from "type-route";

const user = defineRoute(
  {
    userId: param.path.string,
  },
  (p) => `/user/${p.userId}`
);

const { routes } = createRouter({
  home: defineRoute("/"),
  user,
  userSettings: user.extend("/settings"),
  userActivity: user.extend("/activity"),
});

const groups = {
  user: createGroup([routes.user, routes.userSettings, routes.userActivity]),
};

if (groups.user.has(route)) {
  console.log(route.params.userId);
}
```

In addition to taking a route and returning a boolean, `has` works with TypeScript's control flow analysis to properly narrow type of the given `route` in the appropriate code blocks. In the above example this means you can be sure `route.params.userId` exists within this code block:

```tsx
if (groups.user.has(route)) {
  console.log(route.params.userId);
}
```
