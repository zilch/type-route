---
title: Redirects
---

Inside the [`listen`](../api-reference/router/listen.md) function you can check what the next route is and choose whether or not to opt out of that update. Simple return `false` in your `listen` callback and the route update will not be applied. In this case we check if the next route was the "old" route and replace it with the "new" route. We make sure to return `false` from the listen callback so the change doesn't propagate to the url. Keep in mind however, that the `listen` callback is only called when the route _changes_ - not on initial page load. To handle initial page load we'll use a separate `useEffect` hook that reruns every time the route changes and call the same `handleRedirects` function. Since it is possible for the "old" route to be rendered for a split second we still need to make sure we handle that case when rendering the view.

```tsx codesandbox-react
import { createRouter, defineRoute, Route } from "type-route";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const { routes, listen, getCurrentRoute } = createRouter({
  new: defineRoute("/new"),
  old: defineRoute("/old")
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const removeListener = listen(nextRoute => {
      const didRedirect = handleRedirects(nextRoute);

      if (didRedirect) {
        return false;
      }

      setRoute(nextRoute);
    });

    return removeListener;
  }, []);

  useEffect(() => {
    handleRedirects(route);
  }, [route]);

  if (route.name === routes.old.name) {
    return <div>Redirecting...</div>;
  }

  if (route.name === routes.new.name) {
    return <div>New Page</div>;
  }

  return <div>Not Found</div>;
}

function handleRedirects(route: Route<typeof routes>) {
  if (route.name === routes.old.name) {
    routes.new.replace();
    return true;
  }

  return false;
}

ReactDOM.render(<App />, document.querySelector("#root"));
```
