---
title: SessionConfig
---

```tsx
type SessionConfig =
  | BrowserHistoryConfig
  | MemoryHistoryConfig
  | HashHistoryConfig

type MemoryHistorySessionConfig = {
  type: "memory";
  initialEntries?: string[];
  initialIndex?: number;
};

type HashHistorySessionConfig = {
  type: "hash";
  hash?: "hashbang" | "noslash" | "slash";
};

type BrowserHistorySessionConfig = {
  type: "browser";
  forceRefresh?: boolean;
};
```