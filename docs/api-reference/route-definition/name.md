---
title: <RouteDefinition>.name
sidebar_label: name
---

```tsx
const { routes, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

const route = getCurrentRoute();

if (route.name === routes.post.name) {
  console.log(route.params.postId);
  // Here both you and the editor will know that we're on
  // the "post" route and that route.params has a property
  // called "postId" of type string.
}
```

The `name` field is a constant value used for comparing a specific `Route` to a particular `RouteDefinition`. As shown in the example above this allows you to determine which route you're dealing with.
