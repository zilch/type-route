---
title: useRoute
---

# {{ $frontmatter.title }}

```tsx
const { RouteProvider, useRoute } = createRouter({ ... });

ReactDOM.render(<RouteProvider><App/></RouteProvider>, document.querySelector("#main"));

function App() {
  const route = useRoute();

  return <div>
    {route.name}
  </div>;
}
```

The `useRoute` hook returns the current route. You need to wrap your application in a `RouteProvider` in order to use this hook.
