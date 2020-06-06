---
title: <RouteDefinition>.extend
sidebar_label: extend
---

Hello

```tsx
<RouteDefinitionBuilder>.extend(path: string): RouteDefinitionBuilder;
<RouteDefinitionBuilder>.extend(
  params: ParameterCollection,
  path: (pathParams: PathParameterCollection) => string
): RouteDefinitionBuilder;
```

The `extend` function has the exact same signature as `defineRoute`. Both return a `RouteDefinitionBuilder` object which can then be extended itself. The path parameter of the `extend` function is relative to the base `RouteDefinitionBuilder` object. In the above example the `userSettings` route would match the path `/user/someid/settings`. The parameter definitions you pass to extend are merged with with the parameter definitions from the base `RouteDefinitionBuilder` object. There can be no overlap in parameter definition names between the base and extended `RouteDefinitionBuilder`.

#### Example

```tsx
const user = defineRoute(
  {
    userId: "path.param.string"
  },
  p => `/user/${p.userId}`
);

const { routes, listen } = createRouter({
  home: defineRoute("/"),
  userSummary: user.extend("/"),
  userSettings: user.extend("/settings"),
  userPostList: user.extend("/post"),
  userPost: user.extend(
    {
      postId: "path.param.string"
    },
    p => `/post/${p.postId}`
  )
});
```
