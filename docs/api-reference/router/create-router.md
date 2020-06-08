---
title: createRouter
---

```tsx
createRouter(routeDefinitions: RouteDefinitionBuilderCollection): Router
createRouter(routerConfig: RouterConfig, routeDefinitions: RouteDefinitionBuilderCollection): Router
```

Initializes a router. By default the underlying session history instance which powers Type
Route will be configured according to the environment your code is running in. This
means Type Route should work out of the box in both browser and non-browser environments
such as React Native. You can always reconfigure the history instance you are given to
cover other use cases (such as [server-side rendering](../../guides/server-side-rendering.md)).

#### Example

```tsx
const { routes, listen, session } = createRouter({
  home: defineRoute("/"),
  postList: defineRoute(
    {
      page: param.query.optional.number
    },
    p => `/post`
  ),
  post: defineRoute(
    {
      postId: param.path.string
    },
    p => `/post/${p.postId}`
  )
});
```

`createRouter` will create a `Router` object. Immediately destructuring this `Router` object into the properties your application needs is the recommended style.
