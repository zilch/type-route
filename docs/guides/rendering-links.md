---
title: Rendering Links
---

Links in single page applications are unique for the fact that they do not trigger a page load. Typically all a link would require is an href property:

```tsx
<a href="/foo/bar">Foo Bar</a>
```

This works as expected but causes the entire page to reload whenever the link is clicked. If we're building a single page application we'd like to avoid that. To do so we need to capture link clicks and prevent the default behavior.

```tsx
<a
  href="/foo/bar"
  onClick={event => {
    event.preventDefault();
    // Then trigger some state update so we know we're at "/foo/bar"
  }}
>
  Foo Bar
</a>
```

Using Type Route the above would look something like this:

```tsx
<a
  href={routes.fooBar().href}
  onClick={event => {
    event.preventDefault();
    routes.fooBar().push();
  }}
>
  Foo Bar
</a>
```

This pattern becomes especially repetitive when the route has parameters. To solve this problem in a framework agnostic way Type Route has the [`link`](../api-reference/route-definition/link.md) function.

```tsx
<a {...routes.fooBar().link}>Foo Bar</a>
```

The `link` function returns an object with `href` and `onClick` properties. Then you can simply destructure these into the props of the `<a>` tag and you achieve the same functionality as above in a less verbose way. Its important to provide both the `href` and `onClick` properties to the link. `onClick` will ensure we don't trigger a page reload when clicking the link and `href` will ensure the browser still treats the link as a link.
