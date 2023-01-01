// .vitepress/theme/index.js
import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import "./custom.css";

const tryOnCodeSandboxCode = `import React from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, param, Route } from "type-route";

const { RouteProvider, useRoute, routes } = createRouter({
  home: defineRoute("/"),
  userList: defineRoute(
    {
      page: param.query.optional.number
    },
    () => "/user"
  ),
  user: defineRoute(
    {
      userId: param.path.string
    },
    p => \`/user/\${p.userId}\`
  )
});

function App() {
  const route = useRoute();

  return (
    <>
      <Navigation />
      {route.name === "home" && <HomePage/>}
      {route.name === "userList" && <UserListPage route={route}/>}
      {route.name === "user" && <UserPage route={route}/>}
      {route.name === false && <NotFoundPage/>}
    </>
  );
}

function HomePage() {
  return <div>Home</div>;
}

function UserListPage({ route }: { route: Route<typeof routes.userList> }) {
  return (
    <div>
      User List
      <br />
      Page: {route.params.page || "-"}
    </div>
  );
}

function UserPage({ route }: { route: Route<typeof routes.user> }) {
  return <div>User {route.params.userId}</div>;
}

function NotFoundPage() {
  return <div>Not Found</div>;
}

function Navigation() {
  return (
    <nav>
      <a {...routes.home().link}>Home</a>
      <a {...routes.userList().link}>User List</a>
      <a
        {...routes.userList({
          page: 2
        }).link}
      >
        User List Page 2
      </a>
      <a
        {...routes.user({
          userId: "abc"
        }).link}
      >
        User "abc"
      </a>
    </nav>
  );
}

ReactDOM.render(
  <RouteProvider>
    <App />
  </RouteProvider>,
  document.querySelector("#root")
);
`;

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-bottom": () =>
        h({
          mounted() {
            addCodesandboxLinks();
          },
        }),
    });
  },
};

function addCodesandboxLinks() {
  // @ts-expect-error
  const codesandbox = window.codesandbox;

  const TYPE_ROUTE_VERSION = "1.0.1";

  const configFactoryCollection = {
    tsx: (code) => ({
      files: {
        "sandbox.config.json": {
          content: '{\n  "template": "create-react-app-typescript"\n}\n',
        },
        "src/index.tsx": {
          content: code,
        },
        "public/index.html": {
          content:
            '<style>a { margin-right: 10px; } nav { margin-bottom: 10px; } #root { margin: 10px; } .active { font-weight: bold; }</style><div id="root"></div>',
        },
        "package.json": {
          content: {
            dependencies: {
              react: "=16.8.6",
              "@types/react": "=16.8.18",
              "react-dom": "=16.8.6",
              "@types/react-dom": "=16.8.4",
              "type-route": "=" + TYPE_ROUTE_VERSION,
              tslib: "2.0.0",
            },
          },
        },
      },
    }),
    ts: (code) => ({
      files: {
        "sandbox.config.json": {
          content: '{\n  "template": "create-react-app-typescript"\n}\n',
        },
        "public/index.html": {
          content:
            '<style>a { margin-right: 10px; } nav { margin-bottom: 10px; } #root { margin: 10px; } .active { font-weight: bold; }</style><div id="root"></div>',
        },
        "index.ts": {
          content: code,
        },
        "package.json": {
          content: {
            dependencies: {
              "type-route": "=" + TYPE_ROUTE_VERSION,
            },
          },
        },
      },
    }),
  };

  document
    .querySelectorAll(
      ".VPNavBarTitle:not(.has-sidebar) > .title.done > .version"
    )
    .forEach((element) => {
      element.parentElement?.classList.remove("done");
      element.remove();
    });
  document
    .querySelectorAll(".VPNavBarTitle.has-sidebar > .title:not(.done)")
    .forEach((element) => {
      const version = document.createElement("div");
      version.innerText = "v" + TYPE_ROUTE_VERSION;
      version.className = "version";
      element.appendChild(version);
      element.classList.add("done");
    });

  document
    .querySelectorAll("a[href=\\/\\#try-on-codesandbox]")
    .forEach((tryOnCodeSandboxButton) => {
      const config = configFactoryCollection.tsx(tryOnCodeSandboxCode);
      const parameters = codesandbox.getParameters(config);
      tryOnCodeSandboxButton.setAttribute("target", "_blank");
      (tryOnCodeSandboxButton as HTMLAnchorElement).href =
        "https://codesandbox.io/api/v1/sandboxes/define?parameters=" +
        parameters;
    });

  document
    .querySelectorAll(".vp-code-group:not(.codesandbox)")
    .forEach((element) => {
      const topLink = getSandboxLink(element);

      if (topLink !== null) {
        element.appendChild(topLink);
        element.classList.add("codesandbox");
      }
    });

  function getSandboxLink(element) {
    let type: keyof typeof configFactoryCollection;

    if (!!element.querySelector(".language-tsx")) {
      type = "tsx";
    } else if (!!element.querySelector(".language-ts")) {
      type = "ts";
    } else {
      return null;
    }

    const createConfig = configFactoryCollection[type];

    const config = createConfig(element.querySelector("code").textContent);
    const parameters = codesandbox.getParameters(config);

    const sandboxLink = document.createElement("a");
    sandboxLink.className = "codesandbox-link";
    sandboxLink.innerHTML = "Run&nbsp;&nbsp;→";
    sandboxLink.href =
      "https://codesandbox.io/api/v1/sandboxes/define?parameters=" + parameters;
    sandboxLink.target = "_blank";

    return sandboxLink;
  }
}
