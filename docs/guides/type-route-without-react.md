---
title: Type Route without React
---

# {{ $frontmatter.title }}

> Type Route was designed with excellent React integration in mind. The best API for React, however, doesn't include many React-specific components which makes it easy to use Type Route without React.

Its possible to use Type Route without React and instead integrate it with your favorite JavaScript framework or use it without a framework at all. Here's an example of using Type Route without any of its React-specific components.

::: code-group

```ts [index.ts] {1,25-29}
import { createRouter, defineRoute, param, Route } from "type-route/core";

const { routes, session } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number,
    },
    () => "/users"
  ),
  user: defineRoute(
    {
      userId: param.path.string,
    },
    (p) => `/users/${p.userId}`
  ),
});

const nav = document.createElement("nav");
nav.appendChild(link("Home", routes.home()));
nav.appendChild(link("User List", routes.userList({ page: 1 })));
nav.appendChild(link("User", routes.user({ userId: "abc" })));
document.body.prepend(nav);

renderPage(session.getInitialRoute());

session.listen((nextRoute) => {
  renderPage(nextRoute);
});

function renderPage(route: Route<typeof routes>) {
  const root = document.querySelector("#root");

  if (route.name === "home") {
    root.innerHTML = "Home";
  } else if (route.name === "userList") {
    root.innerHTML = `UserList Page: ${route.params.page || "-"}`;
  } else if (route.name === "user") {
    root.innerHTML = `User ${route.params.userId}`;
  } else {
    root.innerHTML = "Not Found";
  }
}

function link(label: string, to: Route<typeof routes>) {
  const element = document.createElement("a");
  element.innerHTML = label;
  element.href = to.link.href;
  element.onclick = to.link.onClick;
  return element;
}
```

:::

**Instead of importing Type Route from `type-route` import from `type-route/core`.** Almost everything is the same between these two versions of the library. The only thing that differs is the return value of `createRouter`. Where a call to `createRouter` from `type-route` returns `RouteProvider` and `useRoute` a call to `createRouter` from `type-route/core` does not. Users instead can integrate with `session.listen` for subscribing to route updates and use `session.getInitialRoute` to get the initial route.

> Its important to only use one version of the library in your application, `type-route` OR `type-route/core`. While importing from both may work it'll increase your bundle size since both are packaged into a single self-contained file. While the bundle size is small (15kb before gzip) this additional overhead is unnecessary.

In the future its possible distinct versions of the library may be published for popular JavaScript frameworks e.g. `type-route/vue` or `type-route/angular` or `type-route/svelte` or `type-route/ember`. If you have experience with any of these libraries and want to contribute please do so! Until then, since `type-route/core` is framework agnostic, you should still be able to use Type Route in any project with a little extra effort (the entirety of the Type Route/React integration is less than 100 lines of code).
