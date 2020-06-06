---
title: defineRoute
---

```tsx
defineRoute(path: string | string[]): RouteDefinition;
defineRoute(
  params: ParameterCollection,
  path: (pathParams: PathParameterCollection) => string | string[]
): RouteDefinition;
```

This method will create a route definition builder object to be consumed by `createRouter`. The simplified version of the call is an alias for `defineRoute({}, () => path)`. The parameters object passed to `defineRoute` is a map of variable names to the following strings representing the type of parameter being declared:

- `"path.param.string"` - A parameter of type string found in the pathname of the url.
- `"path.param.number"` - A parameter of type number found in the pathname of the url.
- `"query.param.string"` - A parameter of type string found in the query string of the url.
- `"query.param.number"` - A parameter of type number found in the query string of the url.
- `"query.param.string.optional"` - An optional parameter of type string found in the query string of the url.
- `"query.param.number.optional"` - An optional parameter of type number found in the query string of the url.

**Examples**

```tsx
defineRoute("/");
```

Defines a route matching `"/"`

```tsx
defineRoute(
  {
    userId: "path.param.string",
    page: "query.param.number",
    search: "query.param.string.optional"
  },
  p => `/user/${p.userId}/posts`
);
```

Defines a route matching: `"/user/some-id/posts?page=1&search=hello"` or `"/user/some-id/posts?page=1"`
