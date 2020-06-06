---
title: QueryStringSerializer
---

```tsx
type QueryStringSerializer = {
  parse: (raw: string) => Record<string, string>;
  stringify: (
    queryParams: Record<
      string,
      { valueSerializerId?: string; array: boolean; value: string }
    >
  ) => string;
};
```