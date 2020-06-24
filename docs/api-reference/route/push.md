---
title: <Route>.push
sidebar_label: push
---

```tsx
push(): boolean
```

The `push` function will push a new entry into history and if using the "browser" `historyType` will update the browser's url. Returns a `boolean` indicating whether or not the navigation completed successfully. The only instance where the navigation would not be successful would be if the handler function passed to `listen` returned false.

#### Example

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: param.path.string }, p => `/post/${p.postId}`)
});

routes.home().push(); // returns boolean
routes.post({ postId: "abc" }).push(); // returns boolean
```
