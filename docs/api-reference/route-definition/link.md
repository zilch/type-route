---
title: <RouteDefinition>.link
sidebar_label: link
---

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home.link(); // returns { href: "/", onClick: Function }
routes.post.link({ postId: "abc" }); // returns { href: "/post/abc", onClick: Function }
```

The `link` function will construct an object containing both an `href` property and an `onClick` function. When called, the `onClick` function calls `preventDefault` on the event object passed to it and triggers that particular route's `push` function with the parameters provided to `link`. In React, for example, the `link` function may be used like this:

```tsx
<a {...routes.home.link()}>Home</a>
<a {...routes.post.link({ postId: "abc" })}>Post "abc"</a>
```
