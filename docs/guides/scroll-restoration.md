---
title: Scroll Restoration
---

# {{ $frontmatter.title }}

Any time you navigate to a new page the usual expectation is that the new page starts scrolled to the top. The browser should handle restoring scroll position as you navigate through history. It will not, however, ensure new pages are scrolled to the top by default. By default Type Route handles this cases and scrolls the page to the top when a new route is pushed into the history stack.

Most scroll restoration requirements should be covered by this but if you need to handle [scroll restoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) yourself you can change the default behavior of the browser and Type Route with this code:

```ts
import { createRouter, RouterOpts } from "type-route";

const opts: RouterOpts = {
  scrollToTop: false
}

createRouter(opts, { ... });
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
```

When set to manual the browser will not do any automatic scroll restoration as a user navigates through their browsing history and with `scrollToTop` set to false Type Route will not attempt to do any scrolling. You should then be able to implement scroll restoration logic specific to your application without worrying about the browser or Type Route attempting their own scroll restoration.
