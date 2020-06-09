---
title: Custom Query String
---

> Customizing the query string is an advanced feature your application most likely does not need. Utilities for customizing the query string are provided as an escape hatch to make it possible to keep using Type Route even in edge case scenarios.

By default Type Route will use the parameter name as a value's key in the query string. If the value is an array type square brackets will follow the value name. Commas are used as the separator between values.

```tsx codesandbox-standard
import { createRouter, defineRoute, param } from "type-route";

const { routes } = createRouter({
  example: defineRoute(
    {
      arrayValue: param.query.array.string
    },
    () => `/example`
  )
});

console.log(
  routes.example({ arrayValue: ["foo", "bar" ]}).href
) // logs out "/example?arrayValue[]=foo,bar
```

There is some high level configuration that can be given to `createRouter` which will change the format of array values in the query string.

```tsx codesandbox-standard
import { createRouter, defineRoute, param, RouterConfig } from "type-route";

const config: RouterConfig = {
  arrayFormat: {
    separator: ",",
    queryString: "multiKeyWithBracket"
  }
}

const { routes } = createRouter(config, {
  example: defineRoute(
    {
      arrayValue: param.query.array.string
    },
    () => `/example`
  )
});

console.log(
  routes.example({ arrayValue: ["foo", "bar" ]}).href
) // logs out "/example?arrayValue[]=foo&arrayValue[]=bar
```

The `separator` property takes any string. The `queryString` property accepts one of these values: `singleKey`, `singleKeyWithBracket`, `multiKey`, and `multiKeyWithBracket`. Here's a mapping of config options to the url they would produce from the above example:

| `separator` | `queryString`          | Result
|-------------|------------------------|---
| `,`         | `singleKey`            | `/example?arrayValue=foo,bar`
| `,`         | `singleKeyWithBracket` | `/example?arrayValue[]=foo,bar` (default)
| `,`         | `multiKey`             | `/example?arrayValue=foo&arrayValue=bar`
| `,`         | `multiKeyWithBracket`  | `/example?arrayValue[]=foo&arrayValue[]=bar`
| `;`         | `singleKey`            | `/example?arrayValue=foo;bar`
| `;`         | `singleKeyWithBracket` | `/example?arrayValue[]=foo;bar`
| `;`         | `multiKey`             | `/example?arrayValue=foo&arrayValue=bar`
| `;`         | `multiKeyWithBracket`  | `/example?arrayValue[]=foo&arrayValue[]=bar`

There may be a rare situation where you need even greater control over how the query string is constructed. In those scenarios its possible to provide a custom `queryStringSerializer`. Below is an example of a custom query string serializer. You could tweak this example to fit your exact needs. Note that this serializer only does half of the serialization job. The other half is left to parameter serializers. The job of this serializer is to ensure there is a proper mapping between keys and values that are then parsed by individual parameter serializers. It's worth mentioning again, however, that you likely should try to avoid bringing this complexity into your application code if at all possible.

```tsx codesandbox-standard
import { createRouter, defineRoute, param, RouterConfig, QueryStringSerializer } from "type-route";

const arrayKeySuffix = "[]";
const arraySeparator = ",";

const queryStringSerializer: QueryStringSerializer = {
  parse: (raw) => {
    const queryParams: Record<string, string> = {};

    for (const part of raw.split("&")) {
      const [rawParamName, rawParamValue, ...rest] = part.split("=");

      if (
        rawParamName === undefined ||
        rawParamValue === undefined ||
        rest.length > 0
      ) {
        continue;
      }

      const key = decodeURIComponent(
        rawParamName.endsWith(arrayKeySuffix)
          ? rawParamName.slice(0, rawParamName.length - arrayKeySuffix.length)
          : rawParamName
      );

      if (queryParams[key] && multiKey) {
        queryParams[key] += `${arraySeparator}${rawParamValue}`;
      } else {
        queryParams[key] = rawParamValue;
      }
    }

    return queryParams;
  },

  stringify: (queryParams) => {
    return Object.keys(queryParams)
      .map((name) => {
        const encodedName = encodeURIComponent(name);
        const key = queryParams[name].array
          ? `${encodedName}${arrayKeySuffix}`
          : encodedName;
        const value = queryParams[name].value;

        if (queryParams[name].array && multiKey) {
          const valueParts = value.split(arraySeparator);
          return valueParts.map((part) => `${key}=${part}`).join("&");
        }

        return `${key}=${value}`;
      })
      .join("&");
  },
}

const config: RouterConfig = { queryStringSerializer };

const { routes } = createRouter(config, {
  example: defineRoute(
    {
      arrayValue: param.query.array.string
    },
    () => `/example`
  )
});

console.log(
  routes.example({ arrayValue: ["foo", "bar" ]}).href
) // logs out "/example?arrayValue[]=foo,bar
```
