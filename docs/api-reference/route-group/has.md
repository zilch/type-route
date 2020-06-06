---
title: <RouteGroup>.has
sidebar_label: has
---

Hello

```tsx
<RouteDefinitionGroup>.has(route: Route): boolean
```

The `has` function is the one and only function on the `RouteDefinitionGroup` object returned by the `createGroup` function. It takes a `route` and returns a `boolean`.

#### Example

```tsx
import { defineRoute, createRouter, createGroup } from "type-route";

const user = defineRoute(
  {
    userId: "path.param.string"
  },
  p => `/user/${p.userId}`
);

const { routes } = createRouter({
  home: defineRoute("/"),
  user,
  userSettings: user.extend("/settings"),
  userActivity: user.extend("/activity")
});

const userGroup = createGroup([
  routes.user,
  routes.userSettings,
  routes.userActivity
]);

if (userGroup.has(route)) {
  console.log(route.params.userId);
}
```

In addtion to taking a route and returning a boolean, `has` works with TypeScript's control flow analysis to properly narrow type of the given `route` in the appropriate code blocks. In the above example this mean you can be sure `route.params.userId` exists within this code block:

```tsx
if (userGroup.has(route)) {
  console.log(route.params.userId);
}
```
