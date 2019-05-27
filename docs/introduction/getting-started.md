---
title: Getting Started
---

Type Route is a flexible, type safe routing library built on top of the same [core library](https://github.com/ReactTraining/history) that powers React Router.

> Type Route was designed with excellent React integration in mind but isn't coupled to a specific UI framework. Most code examples in the documentation use React, but the general principles covered apply regardless of framework.

Continue reading this page for a quick overview of how to start using Type Route in your project. Read [Why Type Route?](./why-type-route.md) or [Core Concepts](./core-concepts.md) for a more detailed introduction.

## Install

Type Route's primary distribution channel is the [NPM registry](https://www.npmjs.com/package/type-route).

```bash
npm install type-route
```

## Step 1: Create a Router

`router.ts`

```typescript
import { createRouter, defineRoute } from "type-route";

export const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: "query.param.number.optional"
    },
    () => "/user"
  ),
  user: defineRoute(
    {
      userId: "path.param.string"
    },
    p => `/user/${p.userId}`
  )
});
```

Best practice is to immediately destructure the result of [`createRouter`](../api-reference/router/create-router.md) into the properties you'll be using in your application. The [`createRouter`](../api-reference/router/create-router.md) function accepts an object with route names and route definitions created via [`defineRoute`](../api-reference/route-definition-builder/define-route.md) and returns a new router.

## Step 2: Connect to Application State

`App.tsx`

```tsx
import React, { useState, useEffect } from "react";
import { listen, getCurrentRoute } from "./router";
import { Page } from "./Page";
import { Navigation } from "./Navigation";

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  return (
    <>
      <Navigation />
      <Page route={route} />
    </>
  );
}
```

Retrieve the initial route via [`getCurrentRoute()`](../api-reference/router/get-current-route.md) then subscribe to route updates with [`listen`](../api-reference/router/listen.md).

## Step 3: Display Current Route

`Page.tsx`

```tsx
import React from "react";
import { Route } from "type-route";
import { routes } from "./router";

type Props = {
  route: Route<typeof routes>;
};

export function Page(props: Props) {
  const { route } = props;

  if (route.name === routes.home.name) {
    return <div>Home</div>;
  }

  if (route.name === routes.userList.name) {
    return (
      <div>
        User List
        <br />
        Page: {route.params.page || "-"}
      </div>
    );
  }

  if (route.name === routes.user.name) {
    return <div>User {route.params.userId}</div>;
  }

  return <div>Not Found</div>;
}
```

Pass the `route` object from your application's state to your view and check the route's name to determine which component to display. Inside the code blocks above the TypeScript compiler (and your editor) should be able to correctly infer the type of `route.params`. This allows you, for instance, to access the `userId` param with confidence in code blocks where it will definitely exist and warn you when accessing it in code blocks where it may not exist.

> Type Route is written in TypeScript and designed for TypeScript users. Any editor, however, whose JavaScript experience is powered by TypeScript (VSCode for instance) will provide many of the same benefits described here when using regular JavaScript.

## Step 4: Navigate Between Routes

`Navigation.tsx`

```tsx
import React from "react";
import { routes } from "./router";

export function Navigation() {
  return (
    <nav>
      <a {...routes.home.link()}>Home</a>
      <a {...routes.userList.link()}>User List</a>
      <a
        {...routes.userList.link({
          page: 2
        })}
      >
        User List Page 2
      </a>
      <a
        {...routes.user.link({
          userId: "abc"
        })}
      >
        User "abc"
      </a>
    </nav>
  );
}
```

The [`link`](../api-reference/route-definition/link.md) function returns an object with an `href` property and an `onClick` function. You need both to properly render a link for a single page application. Immediately destructing these into the properties of the `<a>` tag allows for ergonomic use. [Programmatic navigation](../guides/programmatic-navigation.md) is possible with the [`push`](../api-reference/route-definition/push.md) and [`replace`](../api-reference/route-definition/replace.md) functions of a specific route.

## Next Steps

Hopefully that was enough to point you in the right direction!

If you need more guidance there is a full _runnable_ version of the above example on the [React](../guides/simple-react-example.md) page. The _Guides_ section of the documentation has detailed overviews and examples for most use cases. Additionally, the _API Reference_ section has descriptions and examples for each part of the API.
