---
title: ValueSerializer
---

See [complex route parameters](../../guides/complex-route-parameters.md).

```tsx
type ValueSerializer<TValue = unknown> = {
  id?: string;
  urlEncode?: boolean;
  parse(raw: string): TValue | typeof noMatch;
  stringify(value: TValue): string;
}
```