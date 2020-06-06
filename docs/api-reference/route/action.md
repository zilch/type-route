---
title: <Route>.action
sidebar_label: action
---

The action property of a route can be one of four values `"push"`, `"replace"`, `"pop"` or `null`.

### Push

Push indicates your application added a new entry to the browser's history.

### Replace

Replace indicates your application replace the current browser history entry with this route.

### Pop

Pop indicates the browser's back/forward button was clicked or that the browser history was somehow navigated through (for example using `session.back()` or `session.forward()`).

### Null

Null indicates the action could not be determined or has not yet been determined. The action of the route retrieved with `session.getInitialRoute()` will always be `null` since it is impossible to determine this. When a route is first created the action will also be `null`. For example:

```tsx
const route = routes.home();
console.log(route.action); // null
route.push();
console.log(route.action); // push
```
