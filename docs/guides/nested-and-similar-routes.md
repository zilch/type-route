---
title: Nested and Similar Routes
---

Applications frequently have nested routing structures. These nested routes have the same base path and parameters as their shared parent route and having a way to define these routes without repeating yourself is important. Take for instance an application with these routes:

- `/`
- `/about`
- `/users/{userId}`
- `/users/{userId}/settings`
- `/users/{userId}/activity`

A poor implementation of this in Type Route might look something like this:

<details>
<summary>Bad Example</summary>

```tsx
import { createRouter, defineRoute } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about"),
  user: defineRoute(
    {
      userId: "path.param.string"
    },
    p => `/users/${p.userId}`
  ),
  userSettings: defineRoute(
    {
      userId: "path.param.string"
    },
    p => `/users/${p.userId}/settings`
  ),
  userActivity: defineRoute(
    {
      userId: "path.param.string"
    },
    p => `/users/${p.userId}/activity`
  )
});
```

</details>

While this would work it is not ideal and the problem only gets worse as the application gets bigger. Fortunately, the [`defineRoute`](../api-reference/route-definition-builder/define-route.md) function returns a `RouteDefinitionBuilder` object which has an [`extend`](../api-reference/route-definition-builder/extend.md) function to make this process easier.

<details>
<summary>Good Example</summary>

```tsx
import { createRouter, defineRoute } from "type-route";

const user = defineRoute(
  {
    userId: "path.param.string"
  },
  p => `/users/${p.userId}`
);

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about"),
  user,
  userSettings: user.extend("/settings"),
  userActivity: user.extend("/activity")
});
```

</details>

The process, however, of _rendering_ the active route could still be a little verbose.

<details>
<summary>Bad Example</summary>

```tsx
import React from "react";
import { routes } from "./router.ts";
import { Route } from "type-route";

type PageProps = {
  route: Route<typeof routes>;
};

function Page(props: UserProps) {
  const { route } = props;

  if (route.name === routes.home.name) {
    return <div>Home</div>;
  }

  if (route.name === routes.about.name) {
    return <div>About</div>;
  }

  if (
    route.name === routes.user.name ||
    route.name === routes.userSettings.name ||
    route.name === routes.userActivity.name
  ) {
    return <UserPage route={route} />;
  }

  return <div>Not Found</div>;
}

type UserPageProps = {
  route: Route<
    | typeof routes["user"]
    | typeof routes["userSettings"]
    | typeof routes["userActivity"]
  >;
};

function UserPage(props: UserPageProps) {
  const { route } = props;

  let pageContents;

  if (route.name === routes.user.name) {
    pageContents = <div>Main</div>;
  } else if (route.name === routes.userSettings.name) {
    pageContents = <div>Settings</div>;
  } else if (route.name === routes.userActivity.name) {
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

</details>

To help with this case Type Route has a [`createGroup`](../api-reference/route-definition-group/create-group.md) function. Here's a full example using this function:

<details>
<summary>Good Example</summary>

```tsx codesandbox-react
import React from "react";
import { Route } from "type-route";

const user = defineRoute(
  {
    userId: "path.param.string"
  },
  p => `/users/${p.userId}`
);

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  about: defineRoute("/about"),
  user,
  userSettings: user.extend("/settings"),
  userActivity: user.extend("/activity")
});

const userGroup = createGroup([
  routes.user,
  routes.userSettings,
  routes.userActivity
]);

type PageProps = {
  route: Route<typeof routes>;
};

function Page(props: UserProps) {
  const { route } = props;

  if (route.name === routes.home.name) {
    return <div>Home</div>;
  }

  if (route.name === routes.about.name) {
    return <div>About</div>;
  }

  if (userGroup.has(route)) {
    return <UserPage route={route} />;
  }

  return <div>Not Found</div>;
}

type UserPageProps = {
  route: Route<typeof userGroup>;
};

function UserPage(props: UserPageProps) {
  const { route } = props;

  let pageContents;

  if (route.name === routes.user.name) {
    pageContents = <div>Main</div>;
  } else if (route.name === routes.userSettings.name) {
    pageContents = <div>Settings</div>;
  } else if (route.name === routes.userActivity.name) {
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

</details>
