---
title: <RouteDefinitionGroup>.has
sidebar_label: has
---

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

The `has` function on a `RouteDefinitionGroup` takes a route and returns a boolean. It also works with TypeScript control flow analysis to properly narrow type of the route in the appropriate code blocks.
