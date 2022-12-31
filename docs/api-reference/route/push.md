---
title: <Route>.push
---

# {{ $frontmatter.title }}

```tsx
push(): boolean
```

The `push` function will push a new entry into history and if using the "browser" `historyType` will update the browser's url.

#### Example

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: param.path.string }, (p) => `/post/${p.postId}`),
});

routes.home().push();
routes.post({ postId: "abc" }).push();
```
