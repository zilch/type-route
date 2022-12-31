---
title: Code Splitting
---

# {{ $frontmatter.title }}

The file where you create your router should typically be kept in the main bundle of your application. Since a Type Route route is just a piece of application state the strategies you'll need to ensure code splitting works properly while rendering your application will not change. In React applications React provides the [`lazy`](https://reactjs.org/docs/code-splitting.html#reactlazy) utility for dynamically imported components. Which components specifically should be used in conjunction with the [`lazy`](https://reactjs.org/docs/code-splitting.html#reactlazy) utility will vary from application to application. In many cases it will be appropriate to wrap the top level page components that correspond to each route with this helper.

`router.ts`

```tsx
import { createRouter, defineRoute, param } from "type-route";

export const { useRoute, routes } = createRouter({
  home: defineRoute("/"),
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/user/${p.userId}`
  ),
});
```

`HomePage.tsx`

```tsx
import React from "react";

export default function HomePage() {
  return <div>Home</div>;
}
```

`UserPage.tsx`

```tsx
import React from "react";
import { Route } from "type-route";
import { routes } from "./router";

type Props = {
  route: Route<typeof routes.user>;
};

export default function UserPage(props: Props) {
  const { route } = props;

  return <div>User {route.params.userId}</div>;
}
```

`App.tsx`

```tsx
import React, { useEffect } from "react";

const HomePage = React.lazy(() => import("./HomePage"));
const UserPage = React.lazy(() => import("./UserPage"));

function App() {
  const route = useRoute();

  return (
    <>
      <nav>
        <a {...routes.home().link}>Home</a>
        <a {...routes.user({ userId: "abc" }).link}>User "abc"</a>
      </nav>
      <React.Suspense fallback={<div>Loading</div>}>
        {route.name === "home" && <HomePage />}
        {route.name === "user" && <UserPage route={route} />}
        {route.name === false && <div>Not Found</div>}
      </React.Suspense>
    </>
  );
}
```
