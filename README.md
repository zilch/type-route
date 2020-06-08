<br/>
<br/>
<p align="center">
  <a href="https://github.com/typehero/type-route">
    <img src="https://www.typehero.org/type-route/img/type-route-logo.svg" width="200" alt="type-route"/>
  </a>
</p>
<br/>
<h1 align="center">Type Route <sup>beta</sup></h1>
<p align="center">
<a href="#getting-started">Quick Start</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://typehero.org/type-route">Docs</a>
</p>
<br/>

> 🚨 **This is a beta release.** 🚨 The Type Route API has been vetted with production code but the library has not yet reached version **1.0**. More community feedback is needed to validate the project's maturity. Use the [issue tracker](https://github.com/typehero/type-route/issues) to communicate this feedback in the form of bugs, questions, or suggestions.

## Getting Started

Type Route is a flexible, type safe routing library built on top of the same [core library](https://github.com/ReactTraining/history) that powers React Router.

> Type Route was designed with excellent React integration in mind but isn't coupled to a specific UI framework. Most code examples in the documentation use React, but the general principles covered apply regardless of framework.

Continue reading this introduction for a quick overview of how to start using Type Route in your project. Find a full runnable version of the below examples on the [Simple React Example](../guides/simple-react-example.md) page.

## Install

Type Route's primary distribution channel is the [NPM registry](https://www.npmjs.com/package/type-route).

```bash
npm install type-route
```

## Step 1: Create a Router

`router.ts`

```typescript
import { createRouter, defineRoute, param } from "type-route";

export const { routes, listen, session } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number
    },
    () => "/user"
  ),
  user: defineRoute(
    {
      userId: param.path.string
    },
    p => `/user/${p.userId}`
  )
});
```

Best practice is to immediately destructure the result of [`createRouter`](../api-reference/router/create-router.md) into the properties you'll be using in your application. The [`createRouter`](../api-reference/router/create-router.md) function accepts an object with route names and route definitions created via [`defineRoute`](../api-reference/route-definition/define-route.md) and returns a new router.

## Step 2: Connect to Application State

`App.tsx`

```tsx
import React, { useState, useEffect } from "react";
import { listen, session } from "./router";
import { Page } from "./Page";
import { Navigation } from "./Navigation";

function App() {
  const [route, setRoute] = useState(session.getInitialRoute());

  useEffect(() => listen(nextRoute => setRoute(nextRoute)), []);

  return (
    <>
      <Navigation />
      <Page route={route} />
    </>
  );
}
```

Retrieve the initial route via [`session.getInitialRoute()`](../api-reference/router/session.md) then subscribe to route updates with [`listen`](../api-reference/router/listen.md).

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

  if (route.name === "home") {
    return <div>Home</div>;
  }

  if (route.name === "userList") {
    return (
      <div>
        User List
        <br />
        Page: {route.params.page || "-"}
      </div>
    );
  }

  if (route.name === "user") {
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
      <a {...routes.home().link}>Home</a>
      <a {...routes.userList().link}>User List</a>
      <a
        {...routes.userList({
          page: 2
        }).link}
      >
        User List Page 2
      </a>
      <a
        {...routes.user({
          userId: "abc"
        }).link}
      >
        User "abc"
      </a>
    </nav>
  );
}
```

The [`link`](../api-reference/route/link.md) property is an object with an `href` property and an `onClick` function. You need both to [properly render](../guides/rendering-links.md) a link for a single page application. Immediately destructing these into the properties of the `<a>` tag allows for ergonomic use. [Programmatic navigation](../guides/programmatic-navigation.md) is possible with the [`push`](../api-reference/route/push.md) and [`replace`](../api-reference/route/replace.md) functions of a specific route.

## Next Steps

Hopefully that was enough to point you in the right direction!

If you need more guidance there is a full runnable version of the above example on the [React](../guides/simple-react-example.md) page. The "Guides" section of the [documentation](https://typehero.org/type-route/) has detailed overviews and examples for most use cases. Additionally, the "API Reference" section has descriptions and examples for each part of the API.

---

_Type Route is a [Type Hero](https://typehero.org) project._