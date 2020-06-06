---
title: <Router>.routes
sidebar_label: routes
---

```tsx
<Router>.routes: { [routeName: string]: RouteDefinition }
```

The `routes` property of a `Router` object is a map of route names to a `RouteDefinition` object (not to be confused with the `RouteDefinitionBuilder` object that `defineRoute` creates). The `RouteDefinition` object contains properties and functions for interacting with that specific route in your application.

#### Example

```tsx
const { routes } = createRouter({
  home: defineRoute("/")
});

routes.home.name; // "home"
routes.home.push();
routes.home.replace();
routes.home.href();
routes.home.link();
routes.home.match();
```
