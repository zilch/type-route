---
title: RouteProvider
---

# {{ $frontmatter.title }}

```tsx
const { RouteProvider } = createRouter({ ... });

ReactDOM.render(<RouteProvider><App/></RouteProvider>, document.querySelector("#main"));
```

The `RouteProvider` component connects your application to Type Route. It subscribes to route changes and updates your application whenever a route changes.
