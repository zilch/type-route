---
title: <Route>.link
sidebar_label: link
---

The `link` property is an object containing both an `href` property and an `onClick` function. When called, the `onClick` function calls `preventDefault` on the event object passed to it and triggers that particular route's `push` function.

#### Example

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home().link; // returns { href: "/", onClick: Function }
routes.post({ postId: "abc" }).link; // returns { href: "/post/abc", onClick: Function }
```

In React, for example, the `link` function may be used like this:

```tsx
<a {...routes.home().link}>Home</a>
<a {...routes.post({ postId: "abc" }).link}>Post "abc"</a>
```
