---
title: <Router>.routes
---

# {{ $frontmatter.title }}

```tsx
<Router>.routes: { [routeName: string]: RouteBuilder }
```

The `routes` property of a `Router` object is a map of route names to a `RouteBuilder` object. The `RouteBuilder` object is used to construct a specific route which can be interacted with update your application.

#### Example

```tsx
const { routes } = createRouter({
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/user/${p.userId}`
  ),
});

routes.user({ userId: "abc" }).name; // "user"
routes.user({ userId: "abc" }).params; // { userId: "abc" }
routes.user({ userId: "abc" }).href; // "/user/abc"
routes.user({ userId: "abc" }).link;
routes.user({ userId: "abc" }).push();
routes.user({ userId: "abc" }).replace();
```
