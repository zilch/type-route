---
title: createGroup
---

```tsx
const user = defineRoute(
  {
    userId: "path.param.string"
  },
  p => `/user/${p.userId}`
);

const { routes, listen } = createRouter({
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

listen(nextRoute => {
  if (userGroup.has(nextRoute)) {
    nextRoute.name; // "userSummary" | "userSettings" | "userPostList" | "userPost"
  }
});
```

The `createGroup` function is useful for composing groups of routes to make checking against them easier elsewhere in the application with the `has` function. It takes an array composed of both `RouteDefinition` and `RouteDefinitionGroup` objects. Read the [Nested/Similar Routes](../../guides/nested-similar-routes.md) guide for more information.
