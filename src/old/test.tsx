import React, { useEffect } from "react";
import {
  createRouter,
  defineRoute,
  parameter,
  ParameterType
} from "type-route";

const option: ParameterType<{ hi: string; there: string }> = {
  urlEncode: false,
  toString: value => {
    return `${value.hi}-${value.there}`;
  },
  parse: raw => {
    const parts = raw.split("-");

    if (parts.length !== 2) {
      return noMatch;
    }

    return {
      hi: parts[0],
      there: parts[1]
    };
  }
};

export const { routes, listen, history } = createRouter(
  {
    home: defineRoute("/"),

    host: defineRoute(
      {
        ipAddress: parameter.path.string
      },
      x => `/hosts/${x.ipAddress}`
    ),

    hostList: defineRoute(
      {
        params: parameter.query.optional.ofType<HostListParams>()
      },
      () => `/hosts`
    ),

    software: defineRoute(
      {
        name: parameter.path.string,
        version: parameter.path.optional.string
      },
      x => `/software/${x.name}/${x.version}`
    ),

    car: defineRoute(
      {
        id: parameter.path.number,
        slug: parameter.path.trailing.optional.string
      },
      x => `/listings/${x.id}/${x.slug}`
    ),

    hello: defineRoute(
      {
        partial: parameter.path.string
      },
      x => `/hello-${x.partial}`
    ),

    location: defineRoute(
      {
        hiThere: parameter.state.string
      },
      () => `/hosts`
    )
  },
  {
    legacyUrlHashMode: true,
    queryStringSerialization: {
      parse: () => 0,
      toString: () => 0
    }
  }
);

history.reinitialize("memory", {
  entries: ["/hello"]
});

function parseQueryString(queryString: string) {
  const parts: string[] = [];
  let newPart = "";

  for (const letter of queryString.split("")) {
    if (letter === "&" && !newPart.endsWith("\\")) {
      parts.push(newPart);
      newPart = "";
    } else {
      newPart += letter;
    }
  }

  if (newPart !== "") {
    parts.push(newPart);
  }

  const result: Record<string, string> = {};

  for (const part of parts) {
    const [key, value, ...rest] = part.split("=");
    if (!key || !value || rest.length !== 0) {
      continue;
    }

    if (key.endsWith("[]")) {
      const adjustedKey = key.slice(-2);
      if (!adjustedKey) {
        continue;
      }
      result[adjustedKey] = result[adjustedKey]
        ? `${result[adjustedKey]},${value}`
        : value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

function stringifyQueryString();

function App() {
  const [route, setRoute] = useState(history.getInitialRoute());

  useEffect(() => listen(setRoute), []);

  const [actualRoute, setActualRoute] = useState(route);

  useEffect(() => {
    if (route.name === routes.oldRoute.name) {
      routes.newRoute.replace();
      return;
    }

    setActualRoute(route);
  }, [route]);

  return (
    <>
      <Navigation />
      <Page route={route} />
    </>
  );
}
