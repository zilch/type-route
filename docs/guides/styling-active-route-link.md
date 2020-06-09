---
title: Styling of Links for the Currently Active Route
---

The same strategy you use to conditionally apply a CSS class to an element dependent on state will also be suitable for changing the styling of a link if it matches the current route. Type Route provides no specific API for this. Typically links in the navigation header of your application will have certain styling applied to them when they match the current route. For example:

```tsx
type Props = {
  route: Route<typeof routes>
}

function Navigation({ route }: Props) {
  return <nav>
    <a {...routes.home().link} className={route.name === "home" ? "active" : undefined}>Home</a>
    <a {...routes.other().link} className={route.name === "other" ? "active" : undefined}>Other</a>
  </nav>
}
```

A light abstraction on top of this may look something like the following:

```tsx
type LinkProps = {
  to: Route<typeof routes>;
  activeRoute?: Route<typeof routes>;
  children?: React.ReactNode;
}

function Link({ to, activeRoute, children }: Props) {
  return <a
    {...to.link}
    className={to.name === activeRoute?.name ? "active" : undefined}
  >
    {children}
  </a>;
}

type NavigationProps = {
  route: Route<typeof routes>
}

function Navigation({ route }: NavigationProps) {
  return <nav>
    <Link to={routes.home()} activeRoute={route}>Home</Link>
    <Link to={routes.other()} activeRoute={route}>Other</Link>
  </nav>
}
```

**Related pages:**

- [React Components](./react-components.md)
- [Rendering Links](./rendering-links.md)
- [Custom Link Behavior](./custom-link-behavior.md)
- [preventDefaultLinkClickBehavior](../api-reference/miscellaneous/prevent-default-link-click-behavior.md)
