---
title: QueryStringSerializer
---

See [custom query string](../../guides/custom-query-string.md).

```tsx
/**
 * Object for configuring a custom query string serializer. You likely
 * do not need this level of customization for your application.
 */
export type QueryStringSerializer = {
  /**
   * Accepts the query string (without the leading ?) and returns
   * a mapping of parameter names to unserialized parameter values.
   * Individual parameter value serializer take care of the parsing
   * parameter values.
   */
  parse: (raw: string) => Record<string, string>;

  /**
   * Accepts an object keyed by query parameter names and generates
   * a stringified version of the object.
   */
  stringify: (
    queryParams: Record<
      string,
      { valueSerializerId?: string; array: boolean; value: string }
    >
  ) => string;
};
```