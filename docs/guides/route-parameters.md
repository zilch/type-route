---
title: Route Parameters
---

There are six types of route parameters:

- `path.param.string`
- `path.param.number`
- `query.param.string`
- `query.param.number`
- `query.param.string.optional`
- `query.param.number.optional`

These are the values you assign to the parameter name in the [`defineRoute`](../api-reference/route-definition-builder/define-route.md) function.

```tsx
defineRoute(
  {
    userId: "path.param.string",
    page: "query.param.number.optional"
  },
  p => `/users/${p.userId}/activity`
);
```

Here are some url matching scenarios for the above route definition:

| URL                          | Outcome                                      |
| ---------------------------- | -------------------------------------------- |
| /users/abc/activity          | `route.params` = `{"userId":"abc"}`          |
| /users/abc/activity?page=1   | `route.params` = `{"userId":"abc","page":1}` |
| /users/abc/activity?page=abc | No match                                     |

Path params must be used in the path function when you define your route. While path parameters are always required query parameters can be either required or optional. These are the only data types Type Route supports. For strategies on supporting more complex data types (such as arrays) read the [complex route parameters](./complex-route-parameters.md) page.
