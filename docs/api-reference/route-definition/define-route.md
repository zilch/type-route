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

This method will create a route definition object to be consumed by `createRouter`. The simplified version of the call is an alias for `defineRoute({}, () => path)`. The parameters object passed to `defineRoute` is a map of variable names to a `param.*` object.

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

It is possible to provide more than a single path to `defineRoute`. The first path provided is the primary path which is used when navigating to this route from your application. The other routes are additional paths that should go to the same place. A route matching one of these secondary paths will immediately and transparently redirect to the primary path.

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

Defines a route matching: `"/user/some-id"` or `"/users/some-id"`. If the plural users route is matched the url (when using a browser history router) will immediately be changed to the singular version.