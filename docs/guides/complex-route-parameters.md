---
title: Complex Route Parameters
---

# {{ $frontmatter.title }}

The provided parameter types of string, numbers, booleans and arrays should cover most use cases. For in depth documentation on each type of parameter visit the [param](../api-reference/parameter-definition/param.md) api reference page. For situations where the basic types are insufficient and you need to capture more complex data in the url there is an escape hatch. This escape hatch is the `ofType(valueSerializer)` function.

> Most types of data you want to put into the url should be representable without resorting to `ofType`. It's worth carefully considering if you need this. Numbers, strings, booleans, and arrays of each type are already provided out of the box.

Full example:

::: code-group

```tsx [index.tsx]
import { createRouter, defineRoute } from "type-route";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

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

const { useRoute, routes } = createRouter({
  example: defineRoute(
    {
      minDate: param.query.ofType(date),
      maxDate: param.query.ofType(date),
    },
    () => `/users`
  ),
});

function App() {
  const route = useRoute();
  const [minDate] = useState(new Date("3/3/3"));
  const [maxDate] = useState(new Date("12/12/12"));

  return (
    <>
      <nav>
        <a {...routes.example({ minDate, maxDate }).link}>Example</a>
      </nav>
      {route.name === "example" && <ExamplePage route={route} />}
      {route.name === false && <NotFoundPage />}
    </>
  );
}

function ExamplePage(props: { route: Route<typeof routes.example> }) {
  const { route } = props;

  return (
    <div>
      {route.params.minDate.toDateString()} -{" "}
      {route.params.maxDate.toDateString()}
    </div>
  );
}

function NotFoundPage() {
  return <div>Not Found</div>;
}

ReactDOM.render(<App />, document.querySelector("#root"));
```

:::

The important part of the above example is the date value serializer.

```tsx
import { ValueSerializer, noMatch } from "type-route";

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
```

Data must be parsed and stringified consistently. If the value cannot be parsed successfully you should return the `noMatch` constant which will cause Type Route to not match the route with this custom value serializer. The type definition of `ValueSerializer` is as follows:

```ts
type ValueSerializer<TValue = unknown> = {
  id?: string;
  urlEncode?: boolean;
  parse(raw: string): TValue | typeof noMatch;
  stringify(value: TValue): string;
};
```

The `urlEncode` property controls if the string should automatically be url encoded after `stringify `and url decoded before `parse`. If this value is not provided `path` and `query` params will do the encoding by default and `state` or `path.trailing` params will not do encoding by default. Explicitly setting `urlEncode` will override the default behavior for each parameter type. URL encoding ensures any string given is safe by default. It can, however, result in urls that don't look quite as nice since they'll have encoded versions of certain characters. If you're certain the values you're putting into the url will not result in ambiguities caused from inserting a stray "/" or "&" etc. it should be safe to turn url encoding off.

The `id` property can be useful if you need to provide a custom `queryStringSerializer` to the router (see [Custom Query String](./custom-query-string.md)). This is an advanced scenario and most users do not need to worry about setting this property.

It is also possible to use `ofType<SomeType>()` without a value serializer. If no value serializer is provided the default json serializer will be used. The drawback to this is that other than verifying the value is valid json the json serializer cannot guarantee the shape of the value parsed matches the type parameter provided to `ofType<SomeType>()`. Some use cases may merit this approach but it will be necessary to handle the possibility of the compile time type not matching the runtime value in application code.
