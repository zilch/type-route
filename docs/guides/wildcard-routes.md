---
title: Wildcard Routes
---

Type Route supports defining "wildcard" routes. This is a common requirement in applications needing to support paths created, for instance, by a marketing team optimizing the url for a search engine. Here's an example:

```tsx
import { createRouter, defineRoute, param } from "type-route";

const { routes } = createRouter({
  example: defineRoute(
    {
      slug: param.path.trailing.optional.string
    },
    p => `/static/${p.slug}`
  )
});
```

[Trailing path parameters](../api-reference/parameter-definition/param.md#trailing) must come at the end of the path and will match everything following the first part of the url including forward slashes. In the above example this ensures any path starting with `/static` will match the example route.
