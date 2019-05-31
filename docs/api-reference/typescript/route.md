---
title: Route
---

The `Route` type is part of the TypeScript specific API for Type Route. It is a helper type useful for getting the type of a particular route. Here's an example:

```tsx
import { createRouter, defineRoute, Route } from "type-route";

const user = defineRoute(
  {
    userId: "path.param.string"
  },
  p => `/user/${p.userId}`
);

const { routes } = createRouter({
  home: defineRoute("/"),
  user,
  userSettings: user.extend("/settings"),
  userActivity: user.extend("/activity")
});

const userGroup = createGroup([
  routes.user,
  routes.userSettings,
  routes.userActivity
]);
```

Given the above code the type `Route<typeof routes>` would evaluate to this type:

```
  { name: "home", params: {} }
| { name: "user", params: { userId: string } }
| { name: "userSettings", params: { userId: string } }
| { name: "userActivity", params: { userId: string } }
| { name: false, params: {} }
```

And `Route<typeof routes.user>` would provide this type:

```
{ name: "user", params: { userId: string } }
```

And finally `Route<typeof userGroup>` would result in this type:

```
  { name: "user", params: { userId: string } }
| { name: "userSettings", params: { userId: string } }
| { name: "userActivity", params: { userId: string } }
```

The `Route` type can be useful in circumstances such as declaring the `Props` of a component.

```tsx
import { Route } from "type-route";
import { routes } from "./router.ts";

type Props = {
  route: Route<typeof routes.userSettings>;
};

export function UserSettingsPage(props: Props) {
  const { route } = props;

  return <div>Settings for user {route.params.userId}</div>;
}
```
