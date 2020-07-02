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
  listen(navigationHandler: (nextRoute: Route, previousRoute: Route | null) => false | void): () => void
};
```

The `listen` function will create a new route change listener. Whenever the application route changes this function will be called with the next matching route. If the given url does not match any route in that router an object with a `false` value for the `name` property and an empty object for the `params` property will be provided.

#### Example

```tsx
const { session } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: param.path.string }, p => `/post/${p.postId}`)
});

// Creates a new listener
const removeListener = session.listen(nextRoute => {
  console.log(nextRoute);
  // logs:
  // { name: false, params: {} }
  // or
  // { name: "home", params: {} }
  // or
  // { name: "post", params: { postId: "abc" }}
  // (where "abc" is whatever was matched from the url)
});

// Removes the listener
removeListener();
```
