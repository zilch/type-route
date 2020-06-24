---
title: <Route>.name
sidebar_label: name
---

```tsx
name: string
```

The `name` field is a constant value used for narrowing the type of a specific `Route`. This value will be `false` if a match to any of the routes you provided was unable to be made. As shown in the example this allows you to determine which route you're dealing with.

#### Example

```tsx
const { routes, session } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: param.path.string }, p => `/post/${p.postId}`)
});

const route = session.getInitialRoute();

if (route.name === "post") {
  console.log(route.params.postId);
  // Here both you and the editor will know that we're on
  // the "post" route and that route.params has a property
  // called "postId" of type string.
}
```
