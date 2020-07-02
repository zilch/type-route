---
title: createGroup
---

```tsx
createGroup(routes: (RouteBuilder | RouteGroup)[]): RouteGroup
```

The `createGroup` function takes an array of `RouteBuilder` and `RouteGroup` objects and returns a `RouteGroup`. The `createGroup` function is useful for composing groups of routes to make checking against them easier elsewhere in the application with the [`has`](./has.md) function. It takes an array composed of both `RouteBuilder` and `RouteGroup` objects. Read the [Nested/Similar Routes](../../guides/nested-and-similar-routes.md) guide for more information.

#### Example

```tsx codesandbox-standard
import { defineRoute, createRouter, createGroup, param } from "type-route";

const user = defineRoute(
  {
    userId: param.path.string
  },
  p => `/user/${p.userId}`
);

const { routes } = createRouter({
  home: defineRoute("/"),
  userSummary: user.extend("/"),
  userSettings: user.extend("/settings"),
  userPostList: user.extend("/post"),
  userPost: user.extend(
    {
      postId: param.path.string
    },
    p => `/post/${p.postId}`
  )
});

const postGroup = createGroup([routes.userPostList, routes.userPost]);

const groups = {
  post: postGroup,
  user: createGroup([
    routes.userSummary,
    routes.userSettings,
    postGroup
  ])
};

const route = session.getInitialRoute();

if (groups.user.has(route)) {
  console.log(route.name;) // "userSummary" | "userSettings" | "userPostList" | "userPost"
}
```
