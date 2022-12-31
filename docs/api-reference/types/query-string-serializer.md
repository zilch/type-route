---
title: QueryStringSerializer
---

# {{ $frontmatter.title }}

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
   * parameter values. A null value indicates an empty array.
   */
  parse: (raw: string) => Record<string, string | null>;

  /**
   * Accepts an object keyed by query parameter names and generates
   * a stringified version of the object. A null value indicates an
   * empty array.
   */
  stringify: (
    queryParams: Record<
      string,
      { valueSerializerId?: string; array: boolean; value: string | null }
    >
  ) => string;
};
```
