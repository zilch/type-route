---
title: <Route>.href
---

# {{ $frontmatter.title }}

```tsx
href: string;
```

Use the `href` property of a `Route` object to retrieve that route's corresponding href. In most cases instead of using this property you would use the [link](./link.md) property to generate both an `href` and `onClick` handler for your view or would use the [push](./push.md) or [replace](./replace.md) functions for navigating programmatically.

#### Example

::: code-group

```ts [index.ts]
import { createRouter, defineRoute, param } from "type-route";

const { routes } = createRouter({
  base: defineRoute("/base"),

  optionalQueryParameter: defineRoute(
    {
      notRequired: param.query.optional.string,
    },
    () => "/optional-query-parameter"
  ),

  requiredQueryParameter: defineRoute(
    {
      required: param.query.string,
    },
    () => "/required-query-parameter"
  ),

  pathParameter: defineRoute(
    {
      required: param.path.string,
    },
    (p) => `/path-parameter/${p.required}`
  ),
});

console.log("==========================");

console.log(routes.base().href);

console.log(routes.optionalQueryParameter().href);

console.log(
  routes.optionalQueryParameter({
    notRequired: "example",
  }).href
);

console.log(
  routes.requiredQueryParameter({
    required: "example",
  }).href
);

console.log(
  routes.pathParameter({
    required: "example",
  }).href
);
```

:::
