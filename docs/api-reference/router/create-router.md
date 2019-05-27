---
title: createRouter
---

```tsx
createRouter(routeDefinitions: RouteDefinitionBuilderCollection): Router
createRouter(historyType: "browser" | "memory", routeDefinitions: RouteDefinitionBuilderCollection): Router
```

Initializes a router. By default it will create a browser history router. You may also explicitly set the history type to `"browser"` or `"memory"`. Using `"memory"` will create an environment agnostic router. This would be useful if, for instance, you're developing a React Native application.

**Example**

```tsx
const { routes, listen, getCurrentRoute, history } = createRouter({
  home: defineRoute("/"),
  postList: defineRoute(
    {
      page: "query.param.number.optional"
    },
    p => `/post`
  ),
  post: defineRoute(
    {
      postId: "path.param.string"
    },
    p => `/post/${p.postId}`
  )
});
```

`createRouter` will create a `Router` object. Immediately destructuring this `Router` object into the properties your application needs is the recommended style.
