---
title: Data Fetching
---

# {{ $frontmatter.title }}

Type Route is unopinionated when it comes to data fetching. A standard "fetch when a component renders" technique is sufficient for many use cases. However, it is more likely this technique could result in a "waterfall" loading experience for the end user where the page jumps around as content is loaded in an untimely fashion and unexpected order. React Suspense provides some patterns that make it possible to avoid "waterfall" loading experiences with less cumbersome code. Triggering network requests before a component has a chance to render can be an important part of this strategy. In many cases this means handling data loading at the route level instead of the component level. It remains to be seen how Type Route can best facilitate this pattern. Specific use cases will help facilitate a discussion. Feel free to share any insights you have in the [issue tracker](https://github.com/type-route/type-route/issues).
