---
title: createGroup
---

```tsx
createGroup(routes: RouteDefinition[]): RouteDefinitionGroup
```

The `createGroup` function takes an array of `RouteDefinition` objects and returns a `RouteDefinitionGroup`. The `createGroup` function is useful for composing groups of routes to make checking against them easier elsewhere in the application with the [`has`](./has.md) function. It takes an array composed of both `RouteDefinition` and `RouteDefinitionGroup` objects. Read the [Nested/Similar Routes](../../guides/nested-similar-routes.md) guide for more information.

#### Example

```tsx codesandbox-standard
import { defineRoute, createRouter, createGroup } from "type-route";

const user = defineRoute(
  {
    userId: "path.param.string"
  },
  p => `/user/${p.userId}`
);

const { routes, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  userSummary: user.extend("/"),
  userSettings: user.extend("/settings"),
  userPostList: user.extend("/post"),
  userPost: user.extend(
    {
      postId: "path.param.string"
    },
    p => `/post/${p.postId}`
  )
});

const userPostGroup = createGroup([routes.userPostList, routes.userPost]);

const userGroup = createGroup([
  routes.userSummary,
  routes.userSettings,
  userPostGroup
]);

const route = getCurrentRoute();

if (userGroup.has(route)) {
  console.log(route.name;) // "userSummary" | "userSettings" | "userPostList" | "userPost"
}
```
