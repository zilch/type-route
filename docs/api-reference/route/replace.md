---
title: <Route>.replace
---

# {{ $frontmatter.title }}

```tsx
replace(): boolean
```

The `replace` function will replace the current entry in history and if using the "browser" `historyType` will update the browser's url.

#### Example

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: param.path.string }, (p) => `/post/${p.postId}`),
});

routes.home().replace();
routes.post({ postId: "abc" }).replace();
```
