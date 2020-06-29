---
title: Simple Javascript Example
---

> It is quite easy to implement an router using just plain JavaScript, most of the code is boilerplate to render nodes on screen.

Here's a basic example of how to use Type Route with Javascript. Click on **Edit** button to try it out on CodeSandbox. Other guides cover more complex use cases.

[![Edit sweet-bartik-jc913](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/sweet-bartik-jc913?fontsize=14&hidenavigation=1&theme=dark)

```tsx codesandbox-typescript
import "./styles.css";

import { createRouter, defineRoute, Route, param } from "type-route";

const { routes, listen, session } = createRouter({
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

const links: { label: string; route: Route<typeof routes> }[] = [
  { label: "Home", route: routes.home() },
  { label: "User List", route: routes.userList() },
  { label: "User List Page 2", route: routes.userList({ page: 2 }) },
];

/**
 * This is definitely not performatic.
 * Don't do this on production, ok?
 * @param newBody
 */
const render = (newBody: Node) => {
  const app = document.querySelector("#app");

  app.innerHTML = "";

  app.appendChild(newBody);
};

const createElement = (
  tag: string,
  children?: string | Node | Node[],
  props?: any
) => {
  const el = document.createElement(tag);

  if (typeof children === "string") {
    el.innerText = children;
  } else if (Array.isArray(children)) {
    children.filter(Boolean).forEach((child) => el.appendChild(child));
  } else if (children) {
    el.appendChild(children);
  }

  if (props) {
    Object.keys(props).forEach((key) => {
      el[key] = props[key];
    });
  }

  return el;
};

const Navigation = (
  links: { label: string; route: Route<typeof routes> }[],
  route: Route<typeof routes>
) =>
  createElement(
    "nav",
    links.map((linkDef) =>
      createElement("a", linkDef.label, {
        href: linkDef.route.href,
        onclick: linkDef.route.link.onClick,
        className: route.href === linkDef.route.href ? "active" : "",
      })
    )
  );

const Home = () =>
  createElement("section", [
    createElement("h1", "Home"),
    createElement("span", "Click on navigation to navigate..."),
  ]);

const UserList = (route: Route<typeof routes.userList>) =>
  createElement("section", [
    createElement("h1", "User List"),
    createElement("span", `Page Number ${route.params.page || "-"}`),
  ]);

const User = (route: Route<typeof routes.user>) =>
  createElement("section", [
    createElement("h1", "User"),
    createElement("span", `UserID: ${route.params.userId}`),
  ]);

const AppShell = (currentRoute?: Route<typeof routes>) => {
  const route = currentRoute || session.getInitialRoute();

  const dynamicLinks = [...links].concat([
    {
      label: 'User "abc"',
      route: routes.user({ userId: "abc" }),
    },
  ]);

  return createElement("main", [
    Navigation(dynamicLinks, route),
    route.name === "home" && Home(),
    route.name === "userList" && UserList(route),
    route.name === "user" && User(route),
  ]);
};

render(AppShell());

listen((newRoute) => {
  render(AppShell(newRoute));
});
```
