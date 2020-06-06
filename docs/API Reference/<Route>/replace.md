---
title: <RouteDefinition>.replace
sidebar_label: replace
---

```tsx
<RouteDefinition>.replace(parameters?: RouteParameters): Promise<boolean>
```

The `replace` function will replace the current entry in history and if using the "browser" `historyType` will update the browser's url. If the route has parameters those will need to be provided to the `replace` function. Returns a `Promise` which resolves to a `boolean` indicating whether or not the navigation completed successfully. The only instance where the navigation would not be successful would be if the handler function passed to `listen` returned false.

#### Example

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home.replace(); // returns Promise<boolean>
routes.post.replace({ postId: "abc" }); // returns Promise<boolean>
```
