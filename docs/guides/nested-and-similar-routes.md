---
title: Nested and Similar Routes
---

# {{ $frontmatter.title }}

Applications frequently have nested routing structures. These nested routes have the same base path and parameters as their shared parent route and having a way to define these routes without repeating yourself is important. Take for instance an application with these routes:

- `/`
- `/about`
- `/users/{userId}`
- `/users/{userId}/settings`
- `/users/{userId}/activity`

A poor implementation of this in Type Route might look something like this:

::: details Bad Example

```tsx
import { createRouter, defineRoute, param } from "type-route";

const { routes } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about"),
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/users/${p.userId}`
  ),
  userSettings: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/users/${p.userId}/settings`
  ),
  userActivity: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/users/${p.userId}/activity`
  ),
});
```

:::

While this would work it is not ideal and the problem only gets worse as the application gets bigger. Fortunately, the [`defineRoute`](../api-reference/route-definition/define-route.md) function returns a `RouteDefinition` object which has an [`extend`](../api-reference/route-definition/extend.md) function to make this process easier.

::: details Good Example

```tsx
import { createRouter, defineRoute, param } from "type-route";

const user = defineRoute(
  {
    userId: param.path.string,
  },
  (p) => `/users/${p.userId}`
);

const { routes } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about"),
  user,
  userSettings: user.extend("/settings"),
  userActivity: user.extend("/activity"),
});
```

:::

The process, however, of _rendering_ the active route could still be a little verbose.

::: details Bad Example

```tsx
import React from "react";
import { routes } from "./router.ts";
import { Route } from "type-route";

type PageProps = {
  route: Route<typeof routes>;
};

function Page(props: UserProps) {
  const { route } = props;

  if (route.name === "home") {
    return <div>Home</div>;
  }

  if (route.name === "about") {
    return <div>About</div>;
  }

  if (
    route.name === "user" ||
    route.name === "userSettings" ||
    route.name === "userActivity"
  ) {
    return <UserPage route={route} />;
  }

  return <div>Not Found</div>;
}

type UserPageProps = {
  route: Route<
    typeof routes.user | typeof routes.userSettings | typeof routes.userActivity
  >;
};

function UserPage(props: UserPageProps) {
  const { route } = props;

  let pageContents;

  if (route.name === "user") {
    pageContents = <div>Main</div>;
  } else if (route.name === "userSettings") {
    pageContents = <div>Settings</div>;
  } else if (route.name === "userActivity") {
    pageContents = <div>Activity</div>;
  }

  return (
    <>
      <div>User Id: {route.userId}</div>
      {pageContents}
    </>
  );
}
```

:::

To help with this case Type Route has a [`createGroup`](../api-reference/route-group/create-group.md) function. Here's a full example using this function:

::: details Good Example

::: code-group

```tsx [index.tsx]
import React from "react";
import {
  Route,
  defineRoute,
  createRouter,
  param,
  createGroup,
} from "type-route";

const user = defineRoute(
  {
    userId: param.path.string,
  },
  (p) => `/users/${p.userId}`
);

const { routes } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about"),
  user,
  userSettings: user.extend("/settings"),
  userActivity: user.extend("/activity"),
});

const groups = {
  user: createGroup([routes.user, routes.userSettings, routes.userActivity]),
};

type PageProps = {
  route: Route<typeof routes>;
};

function Page(props: PageProps) {
  const { route } = props;

  if (route.name === "home") {
    return <div>Home</div>;
  }

  if (route.name === "about") {
    return <div>About</div>;
  }

  if (groups.user.has(route)) {
    return <UserPage route={route} />;
  }

  return <div>Not Found</div>;
}

type UserPageProps = {
  route: Route<typeof groups.user>;
};

function UserPage(props: UserPageProps) {
  const { route } = props;

  let pageContents;

  if (route.name === "user") {
    pageContents = <div>Main</div>;
  } else if (route.name === "userSettings") {
    pageContents = <div>Settings</div>;
  } else if (route.name === "userActivity") {
    pageContents = <div>Activity</div>;
  }

  return (
    <>
      <div>User Id: {route.userId}</div>
      {pageContents}
    </>
  );
}
```

:::
