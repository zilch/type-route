---
title: RouterConfig
---

```tsx
type RouterConfig = {
  session?: SessionConfig;
  queryStringSerializer?: QueryStringSerializer;
  arrayFormat?: ArrayFormat;
}

type ArrayFormat = {
  separator?: string;
  queryString?: QueryStringArrayFormat;
}

type QueryStringArrayFormat =
  | "singleKey"
  | "singleKeyWithBracket"
  | "multiKey"
  | "multiKeyWithBracket"
```