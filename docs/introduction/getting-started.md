---
title: Getting Started
---

# Getting Started

Type Route is a flexible, type safe routing library built on top of the same [core library](https://github.com/ReactTraining/history) that powers React Router.

> **Type Route was designed with excellent React integration in mind** but isn't coupled to a specific UI framework. Most code examples in the documentation use React, but the general principles covered apply regardless of framework.

Continue reading this introduction for a quick overview of how to start using Type Route in your React project. Find a full <b>runnable</b> version of the below introduction on the [Simple React Example](https://zilch.dev/type-route/introduction/simple-react-example) page or see the [Type Route without React](https://zilch.dev/type-route/guides/type-route-without-react) guide to learn how to use Type Route without React.

## Install

Type Route's primary distribution channel is the [NPM registry](https://www.npmjs.com/package/type-route). React `16.8` (or any subsequent version of React) is a peer dependency of Type Route so you'll need to ensure that's installed as well.

```bash
npm install type-route react
```

## Step 1: Create a Router

`router.ts`

```typescript
import { createRouter, defineRoute, param } from "type-route";

export const { RouteProvider, useRoute, routes } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number,
    },
    () => "/user"
  ),
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/user/${p.userId}`
  ),
});
```

Best practice is to immediately destructure the result of [`createRouter`](https://zilch.dev/type-route/api-reference/router/create-router) into the properties you'll be using in your application. The [`createRouter`](https://zilch.dev/type-route/api-reference/router/create-router) function accepts an object with route names and route definitions created via [`defineRoute`](https://zilch.dev/type-route/api-reference/route-definition/define-route) and returns a new router.

## Step 2: Connect Router to Application

`App.tsx`

```tsx {17-19}
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { RouteProvider } from "./router";
import { Page } from "./Page";
import { Navigation } from "./Navigation";

function App() {
  return (
    <>
      <Navigation />
      <Page />
    </>
  );
}

ReactDOM.render(
  <RouteProvider>
    <App />
  </RouteProvider>,
  document.querySelector("#root")
);
```

Wrap your entire application in the `<RouteProvider>` component returned by [`createRouter`](https://zilch.dev/type-route/api-reference/router/create-router).

## Step 3: Display Current Route

`Page.tsx`

```tsx
import React from "react";
import { useRoute, routes } from "./router";
import { HomePage } from "./HomePage";
import { UserListPage } from "./UserListPage";
import { UserPage } from "./UserPage";
import type { Route } from "type-route";

export function Page() {
  const route = useRoute();

  return (
    <>
      {route.name === "home" && <HomePage />}
      {route.name === "userList" && <UserListPage route={route} />}
      {route.name === "user" && <UserPage route={route} />}
      {route.name === false && "Not Found"}
    </>
  );
}

function HomePage() {
  return <div>Home Page</div>;
}

function UserListPage({ route }: { route: Route<typeof routes.userList> }) {
  return <div>UserList Page: {route.params.page}</div>;
}

function UserPage({ route }: { route: Route<typeof routes.user> }) {
  return <div>User: {route.params.userId}</div>;
}
```

Inside the code blocks above the TypeScript compiler (and your editor) will be able to correctly infer the type of `route`. This allows you, for instance, to pass the `user` route to the `UserPage` component and access the `userId` param with confidence in code blocks where it will definitely exist.

> Type Route is written in TypeScript and designed for TypeScript users. Any editor, however, whose JavaScript experience is powered by TypeScript (VSCode for instance) will provide many of the same benefits described here when using regular JavaScript.

## Step 4: Navigate Between Routes

`Navigation.tsx`

```tsx
import React from "react";
import { routes } from "./router";

export function Navigation() {
  return (
    <nav>
      <a {...routes.home().link}>Home</a>
      <a {...routes.userList().link}>User List</a>
      <a {...routes.userList({ page: 2 }).link}>User List Page 2</a>
      <a {...routes.user({ userId: "abc" }).link}>User "abc"</a>
    </nav>
  );
}
```

The [`link`](https://zilch.dev/type-route/api-reference/route/link) property is an object with an `href` attribute and an `onClick` function. You need both to [properly render](https://zilch.dev/type-route/guides/rendering-links) a link in a single page application. Immediately spreading the `link` object into the properties of an `<a>` tag makes usage simple. [Programmatic navigation](https://zilch.dev/type-route/guides/programmatic-navigation) is possible with the [`push`](https://zilch.dev/type-route/api-reference/route/push) and [`replace`](https://zilch.dev/type-route/api-reference/route/replace) functions of a specific route. Type Route also supports [extending the behavior of a link](https://zilch.dev/type-route/guides/custom-link-behavior) to cover more complex scenarios.

## Next Steps

Hopefully that was enough to point you in the right direction!

If you need more guidance there is a full runnable version of the above code on the [Simple React Example](https://zilch.dev/type-route/introduction/simple-react-example) page. The **Guides** section of the documentation has detailed overviews and examples for most use cases. Additionally, the **API Reference** section has descriptions and examples for each part of the API.

[View Docs →](https://zilch.dev/type-route/)
