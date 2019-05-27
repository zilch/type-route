---
title: <RouteDefinition>.match
sidebar_label: match
---

```tsx
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`),
  postList: defineRoute({ page: "query.param.number.optional" }, () => `/post`)
});

routes.home.match({
  pathName: "/"
}); // returns { }
routes.home.match({
  pathName: "/abc"
}); // returns false
routes.post.match({
  pathName: "/post/abc"
}); // returns { postId: "abc" }
routes.postList.match({
  pathName: "/post"
}); // returns { }
routes.postList.match({
  pathName: "/post",
  queryString: "page=1"
}); // returns { page: 1 }
```

The `match` function takes an object with a `pathName` field and optionally a `queryString` field. It tests if the route matches the given `pathName` and `queryString`. If the test fails `false` is returned. If the test succeeds an object containing the values of any matched parameters is returned (if the route has no parameters an empty object `{ }` will be returned). While this function is exposed publicly, most applications should not need to make use of it directly.
