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

  /**
   * An array of urls representing the what items should
   * start in history when the router is created. This can be useful
   * in a variety of scenarios including server-side rendering
   * (https://typehero.org/type-route/docs/guides/server-side-rendering).
   */
  initialEntries?: string[];

  /**
   * The index of the current url entry when the router is created.
   */
  initialIndex?: number;
};

type HashHistorySessionConfig = {
  type: "hash";

  /**
   * Provide a custom window function to operate on. Can be useful when
   * using the route in an iframe.
   */
  window?: Window;
};

type BrowserHistorySessionConfig = {
  type: "browser";

  /**
   * Provide a custom window function to operate on. Can be useful when
   * using the route in an iframe.
   */
  window?: Window;
};
```