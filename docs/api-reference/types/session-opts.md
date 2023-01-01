---
title: SessionOpts
---

# {{ $frontmatter.title }}

```tsx
type SessionOpts = BrowserHistoryOpts | MemoryHistoryOpts | HashHistoryOpts;

type MemoryHistorySessionOpts = {
  type: "memory";

  /**
   * An array of urls representing the what items should
   * start in history when the router is created. This can be useful
   * in a variety of scenarios including server-side rendering
   * (https://type-route.zilch.dev/guides/server-side-rendering).
   */
  initialEntries?: string[];

  /**
   * The index of the current url entry when the router is created.
   */
  initialIndex?: number;
};

type HashHistorySessionOpts = {
  type: "hash";

  /**
   * Provide a custom window function to operate on. Can be useful when
   * using the route in an iframe.
   */
  window?: Window;
};

type BrowserHistorySessionOpts = {
  type: "browser";

  /**
   * Provide a custom window function to operate on. Can be useful when
   * using the route in an iframe.
   */
  window?: Window;
};
```
