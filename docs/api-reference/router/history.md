---
title: <Router>.history
sidebar_label: history
---

```tsx
<Router>.history: {
  getActiveInstance(): History;
  configure(config: HistoryConfig);
}
```

The `history` property of a router provides direct access to the underlying history instance from the [core library](https://github.com/ReactTraining/history) which powers Type Route. Most projects won't need this property. If you do need to access it, do so with caution as certain uses may cause unexpected behavior.

To access the current instance use the `getActiveInstance` function on the `history` property.
There is also a `configure` function on the `history` property you can use to build a new
history instance with different properties. Reconfiguring your history instance can be useful
for use cases like server side rendering.

#### Example

```tsx
const { history } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

history.getActiveInstance().goBack();
history.getActiveInstance().goForward();
history.configure({
  type: "browser",
  // By default "forceRefresh" is false - if set to true clicking links will
  // cause the page to reload.
  forceRefresh: true
});
history.configure({
  type: "memory",
  // With the memory history type you can set the initial list of location
  // entries in history and where in that history you currently are.
  initialEntries: ["/one"],
  initialIndex: 0
});
```
