---
title: noMatch
---

The `noMatch` constant may be returned from the `parse` function of a `ValueSerializer` object. It signals to Type Route that the value you're attempting to parse is incompatible with the current `ValueSerializer`. When `noMatch` is returned Type Route will not treat a route using this parameter as a match.

```tsx codesandbox-standard
import { noMatch, ValueSerializer, createRouter, defineRoute, param } from "type-route";

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
  }
};

const config: RouterConfig = {
  session: {
    type: "memory",
    initialEntries: [
      "/date-test/invalid-date"
    ]
  }
}

const { routes, session } = createRouter(config, {
  dateTest: defineRoute(
    {
      date: param.path.ofType(date)
    },
    p => `/date-test/${p.date}`
  )
});

console.log(session.getInitialRoute().name); // false
```
