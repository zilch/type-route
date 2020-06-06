---
title: Complex Route Parameters
---

The default route parameter types are limited to just `number` and `string`. Sometimes there will be cases where you need to capture more complex data in the url (such as arrays). The recommended way to do this is by using the `string` data type and using a custom serializer and deserializer. This could be as simple as calling `JSON.stringify` and `JSON.parse`.

```tsx codesandbox-react
import { createRouter, defineRoute } from "type-route";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const { listen, routes, getCurrentRoute } = createRouter({
  example: defineRoute(
    {
      numArray: "query.param.string"
    },
    () => `/complex-route`
  )
});

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => listen(setRoute), []);

  let pageContents;

  if (route.name === routes.example.name) {
    const arr = JSON.parse(route.params.numArray) as number[];

    pageContents = (
      <>
        {arr.map((num, index) => {
          return <div key={index}>{num}</div>;
        })}
      </>
    );
  } else {
    pageContents = <div>Not Found</div>;
  }

  return (
    <>
      <nav>
        <a
          {...routes.example.link({
            numArray: JSON.stringify([1, 2])
          })}
        >
          Num Array [1,2]
        </a>
      </nav>
      {pageContents}
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
```
