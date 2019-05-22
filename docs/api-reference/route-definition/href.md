---
title: <RouteDefinition>.href
sidebar_label: href
---

```
<RouteDefinition>.href(parameters?: RouteParameters): string
```

Use the `href` function of a `RouteDefinition` object to retrieve that route's corresponding href. If the route takes parameters, pass those to the `href` function to get the parameterized href. In most cases instead of using this function you would use the [link](./link.md) function to generate both an href and onClick handler for your view or would use the [push](./push.md) or [replace](./replace.md) functions for navigating programmatically.

### Example

```tsx codesandbox-standard
import { createRouter, defineRoute } from "type-route";

const { routes } = createRouter({
  base: defineRoute("/base"),

  optionalQueryParameter: defineRoute(
    {
      notRequired: "query.param.string.optional"
    },
    () => "/optional-query-parameter"
  ),

  requiredQueryParameter: defineRoute(
    {
      required: "query.param.string"
    },
    () => "/required-query-parameter"
  ),

  pathParameter: defineRoute(
    {
      required: "path.param.string"
    },
    p => `/path-parameter/${p.required}`
  )
});

console.log("==========================");

console.log(routes.base.href());

console.log(routes.optionalQueryParameter.href());

console.log(
  routes.optionalQueryParameter.href({
    notRequired: "example"
  })
);

console.log(
  routes.requiredQueryParameter.href({
    required: "example"
  })
);

console.log(
  routes.pathParameter.href({
    required: "example"
  })
);
```
