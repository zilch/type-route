---
title: noMatch
---

# {{ $frontmatter.title }}

The `noMatch` constant may be returned from the `parse` function of a `ValueSerializer` object. It signals to Type Route that the value you're attempting to parse is incompatible with the current `ValueSerializer`. When `noMatch` is returned Type Route will not treat a route using this parameter as a match. See the [Complex Route Parameters](../../guides/complex-route-parameters.md) guide for more information.

::: code-group

```ts [index.ts]
import {
  noMatch,
  ValueSerializer,
  createRouter,
  defineRoute,
  param,
} from "type-route";

const date: ValueSerializer<Date> = {
  parse(raw) {
    const value = Date.parse(raw);

    if (isNaN(value)) {
      return noMatch;
    }

    return new Date(value);
  },
  stringify(value) {
    return value.toISOString();
  },
};

const opts: RouterOpts = {
  session: {
    type: "memory",
    initialEntries: ["/date-test/invalid-date"],
  },
};

const { routes, session } = createRouter(opts, {
  dateTest: defineRoute(
    {
      date: param.path.ofType(date),
    },
    (p) => `/date-test/${p.date}`
  ),
});

console.log(session.getInitialRoute().name); // false
```

:::
