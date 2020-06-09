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

This method will create a route definition object to be consumed by `createRouter`. The simplified version of the call is an alias for `defineRoute({}, () => path)`. The parameters object passed to `defineRoute` is a map of variable names to a [`param.*`](../parameter-definition/param.md) object.

**Examples**

```tsx
defineRoute("/");
```

Defines a route matching `"/"`

```tsx
defineRoute(
  {
    userId: param.path.string,
    page: param.query.number,
    search: param.query.optional.string
  },
  p => `/user/${p.userId}/posts`
);
```

Defines a route matching: `"/user/some-id/posts?page=1&search=hello"` or `"/user/some-id/posts?page=1"`

### Path Aliases

It is possible to provide more than a single path to `defineRoute` by passing an array of strings. The first path provided is the primary path of the route. The primary path is used when navigating to this route with `push`, `replace` etc. Subsequent paths are aliases to the primary path. When an alias is matched the url will immediately be changed to the primary path.

**Examples**

```tsx
defineRoute(["/dashboard", "/"]);
```

Defines a route matching `"/dashboard"` or `"/"`. If `"/"` is matched the url (when using a browser history router) will immediately change to `"/dashboard"`.

```tsx
defineRoute(
  {
    userId: param.path.string,
  },
  p => [`/user/${p.userId}`, `/users/${p.userId}`]
);
```

Defines a route matching: `"/user/some-id"` or `"/users/some-id"`. If the plural users route is matched, the url (when using a browser history router) will immediately be changed to the singular version.