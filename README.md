<br/>
<br/>
<p align="center">
  <a href="https://github.com/type-route/type-route">
    <img src="https://cdn.jsdelivr.net/gh/type-route/type-route/artwork/type-route.svg" width="550" alt="type-route"/>
  </a>
</p>
<br/>
<br/>

---

**Disclaimer: type-route has not yet reached version 1.0. The api is unstable and subject to change without warning. The library itself may never reach version 1.0. Early feedback is welcome, but using this library in its current state for anything other than a throw away project is not recommended.**

![](https://img.shields.io/npm/v/type-route.svg?style=flat-square)
&nbsp;
![](https://img.shields.io/npm/dm/type-route.svg?style=flat-square)

---

<br/>

## Documentation

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
  - [defineRoute](#defineRoute)
  - [createRouter](#createRouter)
    - [routes](#routes)
      - [name](#name)
      - [push](#push)
      - [replace](#replace)
      - [href](#href)
      - [link](#link)
      - [match](#match)
    - [listen](#listen)
    - [getCurrentRoute](#getCurrentRoute)

<br/>

## Introduction

**Flexible Routing + Seamless DX = 🚀**

The APIs of existing routing libraries aren't optimized for static analysis. Users of these libraries suffer from a sub-par developer experience because of this. `type-route` was designed with a fully statically analyzable API in mind. This means great developer tooling out of the box when using TypeScript or an editor like VSCode whose JavaScript experience is powered by TypeScript under the hood. The API makes extensive use of type inference and almost no explicit type annotations are needed to achieve a fully typed code base. `type-route` is powered by the same core [library](https://github.com/ReactTraining/history) as [React Router](https://github.com/ReactTraining/react-router). From this solid foundation `type-route` adds a simple and flexible API optimized for a developer experience that is second to none.

This project is in its early stages and community feedback is essential to push it further. Feel free to use the [issue tracker](https://github.com/type-route/type-route/issues) for anything from bugs to questions, and suggestions/pain-points to positive experiences.

<br/>

## Getting Started

**Install**

```
npm install type-route
```

**Code Example**

```js
import { createRouter, defineRoute } from "type-route";

const { routes, listen } = createRouter({
  home: defineRoute("/"),
  postList: defineRoute(
    {
      page: "query.param.number.optional"
    },
    p => `/post`
  ),
  post: defineRoute(
    {
      postId: "path.param.string"
    },
    p => `/post/${p.postId}`
  )
});

listen(nextRoute => {
  console.log(nextRoute);
});

routes.home.push();
// url "/"
// logs { name: "home", params: {} }

routes.postList.push();
// url "/post"
// logs { name: "postList", params: {} }

routes.postList.push({ page: 1 });
// url "/post?page=1"
// logs { name: "postList", params: { page: 1 } }

routes.post.push({ postId: "abc" });
// url "/post/abc"
// logs { name: "postId", params: { postId: "abc" } }
```

**Code Example with React**

`type-route` isn't coupled to any specific UI framework/library. Originally it was intended to be a specialized React routing solution. Designing the API, however, revealed that a framework agnostic approach actually led to _better_ React integration. The resulting API works seamlessly with React but also benefits from the flexibility of not being tied to it.

```tsx
import { createRoute, defineRoute, Route } from "type-route";

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  postList: defineRoute(
    {
      page: "query.param.number.optional"
    },
    () => `/post`
  ),
  post: defineRoute(
    {
      postId: "path.param.string"
    },
    p => `/post/${p.postId}`
  )
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const listener = listen(nextRoute => {
      setRoute(nextRoute);
    });

    return () => listener.remove();
  }, []);

  return <div>
    <a {...routes.home.link()}>
      Home
    </a>
    <a { ...routes.postList.link()}>
      PostList
    </a>
    <a { ...routes.postList.link({ page: 1 })}>
      PostList Page 1
    </a>
    <a { ...routes.post.link({ postId: "abc" })}>
      Post abc
    </a>
    <Page route={route}/>
  <div>
}

function Page(props: { route: Route<typeof routes}> }) {
  const { route } = props;

  switch(route.name) {
    case routes.home.name:
      return <HomePage/>;
    case routes.postList.name:
      return <PostListPage page={route.params.page}/>;
    case routes.post.name:
      return <PostPage postId={route.params.postId}/>;
    default:
      return <NotFoundPage/>;
  }
}

function HomePage() {
  return <div>Home</div>;
}

function PostListPage(props: { page?: number }) {
  return <div>PostList {props.page}</div>;
}

function PostPage(props: { postId: string }) {
  return <div>Post {props.postId}</div>;
}

function NotFoundPage() {
  return <div>NotFound</div>;
}
```

<br/>

## API Overview

### defineRoute

```ts
defineRoute(path: string): RouteDefinitionData;
defineRoute(
  params: ParameterCollection,
  path: (pathParams: PathParameterCollection) => string
): RouteDefinitionData;
```

This method will create a route definition data object to be consumed by `createRouter`. The simplified version of the call is simply an alias for `defineRoute({}, () => path)`. The parameters object passed to `defineRoute` is a map of variable names to the following strings representing the type of parameter being declared:

- `"path.param.string"` - A parameter of type string found in the pathname of the url.
- `"path.param.number"` - A parameter of type number found in the pathname of the url.
- `"query.param.string"` - A parameter of type string found in the query string of the url.
- `"query.param.number"` - A parameter of type number found in the query string of the url.
- `"query.param.string.optional"` - An optional parameter of type string found in the query string of the url.
- `"query.param.number.optional"` - An optional parameter of type number found in the query string of the url.

**Examples**

```ts
defineRoute("/");
```

Defines a route matching `"/"`

```ts
defineRoute(
  {
    userId: "path.param.string",
    page: "query.param.number",
    search: "query.param.string.optional"
  },
  p => `/user/${p.userId}/posts`
);
```

Defines a route matching: `"/user/some-id/posts?page=1&search=hello"` or `"/user/some-id/posts?page=1"`

<br/>

### createRouter

```ts
createRouter(routeDefinitions: RouteDefinitionDataCollection): Router
createRouter(historyType: "browser" | "memory", routeDefinitions: RouteDefinitionDataCollection): Router
```

Initializes a router. By default it will create a browser history router. You may also explicitly set the history type to `"browser"` or `"memory"`. Using `"memory"` will create an environment agnostic router. This would be useful if, for instance, you're developing a React Native application.

**Example**

```ts
const { routes, listen, getCurrentRoute, history } = createRouter({
  home: defineRoute("/"),
  postList: defineRoute(
    {
      page: "query.param.number.optional"
    },
    p => `/post`
  ),
  post: defineRoute(
    {
      postId: "path.param.string"
    },
    p => `/post/${p.postId}`
  )
});
```

`createRouter` will create a `Router` object. Immediately destructuring this `Router` object into the properties your application needs is the recommended style.

<br/>

### routes

```ts
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

The `routes` property of a `Router` object is a map of route names to a `RouteDefinition` object (not to be confused with the `RouteDefinitionData` object that `defineRoute` creates). The `RouteDefinition` object contains properties and functions for interacting with that specific route in of application.

<br/>

### name

```ts
const { routes, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

const route = getCurrentRoute();

if (route.name === routes.post.name) {
  console.log(route.params.postId);
  // Here both you and the editor will know that we're on
  // the "post" route and that route.params has a property
  // called "postId" of type string.
}
```

The `name` field is a constant value used for comparing a specific `Route` to a particular `RouteDefinition`. As show in the example above this allows you to determine which route you're dealing with.

<br/>

### push

```ts
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home.push(); // returns Promise<boolean>
routes.post.push({ postId: "abc" }); // returns Promise<boolean>
```

The `push` function will push a new entry into history and if using the "browser" `historyType` will update the browser's url. If the route has parameters those will need to be provided to the `push` function. Returns a `Promise` which resolves to a `boolean` indicating whether or not the operation completed successfully.

<br/>

### replace

```ts
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home.replace(); // returns Promise<boolean>
routes.post.replace({ postId: "abc" }); // returns Promise<boolean>
```

The `replace` function will replace the current entry in history and if using the "browser" `historyType` will update the browser's url. If the route has parameters those will need to be provided to the `replace` function. Returns a `Promise` which resolves to a `boolean` indicating whether or not the operation completed successfully.

<br/>

### href

```ts
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home.href(); // returns "/"
routes.post.href({ postId: "abc" }); // returns "/post/abc"
```

The `href` function will construct a string representing the href for the route. If the route has parameters those will need to be provided to the `href` function.

<br/>

### link

```ts
const { routes } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

routes.home.link(); // returns { href: "/", onClick: Function }
routes.post.link({ postId: "abc" }); // returns { href: "/post/abc", onClick: Function }
```

The `link` function will construct an object containing both an `href` property and an `onClick` function. When called the `onClick` function calls `preventDefault` on the event object passed to it and triggers that particular route's `push` function with the parameters provided to `link`. In React, for example, the `link` function may be used like this:

```tsx
<a {...routes.home.link()}>Home</a>
<a {...routes.post.link({ postId: "abc" })}>Post "abc"</a>
```

<br/>

### match

```ts
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
}); // returns null
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

The `match` function takes an object with a `pathName` field and optionally a `queryString` field. It test if the route matches the given `pathName` and `queryString`. If the test fails `null` is returned. If the test succeeds an object containing the values of any matched parameters is returned (if the route has no parameters an empty object `{ }` will be returned). While this function is exposed publicly most applications should not need to make use of it directly.

<br/>

### listen

```ts
const { listen } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

// Creates a new listener
const listener = listen(nextRoute => {
  console.log(nextRoute);
  // logs:
  // { name: null, params: {} }
  // or
  // { name: "home", params: {} }
  // or
  // { name: "post", params: { postId: "abc" }}
  // (where "abc" is whatever was matched from the url)
});

// Removes the listener
listener.remove();
```

The `listen` function will create a new route listener. Anytime the application route changes this function will be called with the next matching route. If the given url does not match any route in that router an object with a `null` value for the `name` property and empty object for the `params` property will be returned.

Returning `false` (or a `Promise` which resolves to `false`) from this function will abort the url change. If, for instance, there are unsaved changes on the current page or an upload is in progress you may want to make the user confirm the navigation. For example, you may hook into this functionality by doing something like the following:

```ts
listen(nextRoute => {
  if (unsavedChanges) {
    const result = confirm("Are you sure?");
    if (result === false) {
      return false;
    }
  }

  setRoute(nextRoute);
});
```

It is important to note that the `listen` function will trigger the handler you pass to it _only_ when your application's route changes. If your application is somehow unloaded this handler _will not_ be triggered. Examples of when this function will not be triggered in a web browser include:

- closing the tab your application is running in
- triggering an action that opens an external page
- reloading the page your application is running in

Each of the above situations can be intercepted using the following code:

```ts
window.addEventListener("beforeunload", event => {
  if (unsavedChanges) {
    event.preventDefault();
    event.returnValue = ""; // Legacy browsers may need this
    return ""; // Legacy browsers may need this

    // An empty returnValue message is provided because modern browsers
    // will ignore any message set in code and instead provide a
    // generic message to the user asking them to confirm the
    // navigation.
  }
});
```

The above code will display a prompt to the user asking them to confirm the navigation. Asynchronous actions cannot be performed in this code block and ultimately you cannot prevent a user from leaving your application. This technique will only force them to confirm that this navigation is indeed what they want to do.

<br/>

### getCurrentRoute

```ts
const { getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  post: defineRoute({ postId: "path.param.string" }, p => `/post/${p.postId}`)
});

console.log(getCurrentRoute());
// logs:
// { name: null, params: {} }
// or
// { name: "home", params: {} }
// or
// { name: "post", params: { postId: "abc" }}
// (where "abc" is whatever was matched from the url)
```

The `getCurrentRoute` function will return the current route. Typically, the `listen` function would be used to update your application's state to reflect the current route over time. The `getCurrentRoute` function is more useful to ensure the initial state of your application is correct. For example when using `type-route` with React your code may resemble this:

```tsx
function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const listener = listen(nextRoute => {
      setRoute(nextRoute);
    });

    return () => listener.remove();
  }, []);

  return <>Route {route.name}</>;
}
```

The initial route is retrieved via `getCurrentRoute` but all updates to the route object in the application's state are managed in the handler passed to the `listen` function.
