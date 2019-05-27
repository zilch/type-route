---
title: <RouteDefinition>.push
sidebar_label: push
---

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home.push(); // returns Promise<boolean>
routes.post.push({ postId: "abc" }); // returns Promise<boolean>
```

The `push` function will push a new entry into history and if using the "browser" `historyType` will update the browser's url. If the route has parameters those will need to be provided to the `push` function. Returns a `Promise` which resolves to a `boolean` indicating whether or not the navigation completed successfully. The only instance where the navigation would not be successful would be if the handler function passed to `listen` returned false.
