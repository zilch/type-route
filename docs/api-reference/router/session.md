---
title: <RouteDefinition>.session
sidebar_label: session
---

The router `session` object has utilities used for interacting with the browser's history.

```tsx
type RouterSession = {
  push(href: string, state?: any): boolean;
  replace(href: string, state?: any): boolean;
  getInitialRoute(): Route;
  back(amount?: number): void;
  forward(amount?: number): void;
  reset(options: SessionConfig): void;
};
```