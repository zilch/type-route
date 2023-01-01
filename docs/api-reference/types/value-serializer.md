---
title: ValueSerializer
---

# {{ $frontmatter.title }}

See [complex route parameters](../../guides/complex-route-parameters.md).

```tsx
/**
 * Object for configuring a custom parameter value serializer.
 *
 * @see https://type-route.zilch.dev/api-reference/types/value-serializer
 */
type ValueSerializer<TValue = unknown> = {
  id?: string;
  urlEncode?: boolean;
  parse(raw: string): TValue | typeof noMatch;
  stringify(value: TValue): string;
};
```
