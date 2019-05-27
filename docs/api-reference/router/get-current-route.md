---
title: <Router>.getCurrentRoute
sidebar_label: getCurrentRoute
---

```tsx
const { getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

console.log(getCurrentRoute());
// logs:
// { name: false, params: {} }
// or
// { name: "home", params: {} }
// or
// { name: "post", params: { postId: "abc" }}
// (where "abc" is whatever was matched from the url)
```

The `getCurrentRoute` function will return the current route. Typically, the `listen` function would be used to update your application's state to reflect the current route over time. The `getCurrentRoute` function is more useful to ensure the initial state of your application is correct. For example when using `type-route` with React your code may resemble this:

```tsx
function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  return <>Route {route.name}</>;
}
```

The initial route is retrieved via `getCurrentRoute` but all updates to the route object in the application's state are managed in the handler passed to the `listen` function.
