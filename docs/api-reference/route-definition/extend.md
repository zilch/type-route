---
title: <RouteDefinition>.extend
---

# {{ $frontmatter.title }}

```tsx
<RouteDefinition>.extend(path: string | string[]): RouteDefinition;
<RouteDefinition>.extend(
  params: ParameterCollection,
  path: (pathParams: PathParameterCollection) => string | string[]
): RouteDefinition;
```

The `extend` function has the exact same signature as `defineRoute`. Both return a `RouteDefinition` object which can then be extended itself. The path parameter of the `extend` function is relative to the base `RouteDefinition` object. In the below example the `userSettings` route would match the path `/user/someid/settings`. The parameter definitions you pass to extend are merged with with the parameter definitions from the base `RouteDefinition` object. There can be no overlap in parameter definition names between the base and extended `RouteDefinition`.

#### Example

```tsx
const user = defineRoute(
  {
    userId: param.path.string,
  },
  (p) => `/user/${p.userId}`
);

const { routes, listen } = createRouter({
  home: defineRoute("/"),
  userSummary: user.extend("/"),
  userSettings: user.extend("/settings"),
  userPostList: user.extend("/post"),
  userPost: user.extend(
    {
      postId: param.path.string,
    },
    (p) => `/post/${p.postId}`
  ),
});
```
