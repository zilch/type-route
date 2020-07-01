---
title: RouterOpts
---

```tsx
type RouterOpts = {
  /**
   * Options for what variety of browser history session you're using.
   * There are three types with additional options depending on the
   * session type: "browser", "hash", and "memory".
   */
  session?: SessionConfig;

  /**
   * A custom serializer/deserializer for the query string. This is an
   * advanced feature your application likely does not need.
   *
   * @see https://typehero.org/type-route/docs/guides/custom-query-string
   */
  queryStringSerializer?: QueryStringSerializer;

  /**
   * Object used to configure how arrays are serialized to the url.
   */
  arrayFormat?: ArrayFormat;

  /**
   * A path segment that precedes every route in your application. When using a "hash"
   * router this segment will come before the "#" symbol.
   */
  baseUrl?: string;
}

type ArrayFormat = {
    /**
   * Separator to use for array parameter types. By default ","
   */
  separator?: string;

  /**
   * Query string serialization method.
   *
   * @see https://typehero.org/type-route/docs/guides/custom-query-string
   */
  queryString?: QueryStringArrayFormat;
}

type QueryStringArrayFormat =
  | "singleKey"
  | "singleKeyWithBracket"
  | "multiKey"
  | "multiKeyWithBracket"
```