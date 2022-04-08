document.documentElement.lang = "en";

window.onload = function () {
  let lastShowShadow = false;

  document.addEventListener("scroll", function () {
    let showShadow = window.scrollY > 10;

    if (lastShowShadow !== showShadow) {
      lastShowShadow = showShadow;
      const element = document.querySelector(".fixedHeaderContainer");
      if (showShadow) {
        element.classList.add("navShadow");
      } else {
        element.classList.remove("navShadow");
      }
    }
  });

  const configFactoryCollection = {
    "codesandbox-react": (code) => ({
      files: {
        "sandbox.config.json": {
          content:
            "{\n" + '  "template": "create-react-app-typescript"\n' + "}\n",
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
              "type-route": "=0.7.1",
              tslib: "2.0.0",
            },
          },
        },
      },
    }),
    "codesandbox-standard": (code) => ({
      files: {
        "sandbox.config.json": {
          content:
            "{\n" + '  "template": "create-react-app-typescript"\n' + "}\n",
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
              "type-route": "=0.7.1",
            },
          },
        },
      },
    }),
  };

  document.querySelectorAll("a[data-code]").forEach(function (element) {
    const code = element.getAttribute("data-code");
    const config = configFactoryCollection["codesandbox-react"](code);
    const parameters = codesandbox.getParameters(config);
    element.href =
      "https://codesandbox.io/api/v1/sandboxes/define?parameters=" + parameters;
  });

  document
    .querySelectorAll(
      Object.keys(configFactoryCollection)
        .map((key) => "." + key)
        .join(",")
    )
    .forEach((element) => {
      const topLink = getSandboxLink(element, "top");
      if (topLink !== null) {
        element.parentNode.insertBefore(topLink, element);
      }

      if (element.clientHeight < window.innerHeight - 300) {
        return;
      }

      const bottomLink = getSandboxLink(element, "bottom");
      if (bottomLink !== null) {
        element.parentNode.insertBefore(bottomLink, element.nextSibling);
      }
    });

  document.querySelectorAll("pre code").forEach((element) => {
    const highlight = element.className
      .split(/\s+/)
      .find((className) => className[0] === "{");

    if (!highlight) {
      return;
    }

    const highlightedLines = [].concat.apply(
      [],
      highlight
        .slice(1, -1)
        .split(",")
        .map((section) => {
          if (section.indexOf("-") === -1) {
            return [parseInt(section, 10)];
          }
          const range = section.split("-");
          const rangeStart = parseInt(range[0], 10);
          const rangeEnd = parseInt(range[1], 10);
          const rangeLines = [];
          for (let line = rangeStart; line <= rangeEnd; line++) {
            rangeLines.push(line);
          }
          return rangeLines;
        })
    );

    element.innerHTML = element.innerHTML
      .split("\n")
      .map(function (code, index) {
        if (highlightedLines.indexOf(index + 1) === -1) {
          return code;
        }

        return `<div class="line-highlight"></div><span>${code}</span>`;
      })
      .join("<br/>");

    element.querySelectorAll("*").forEach(function (element) {
      element.childNodes.forEach(function (node) {
        if (node.nodeName === "#text") {
          const span = document.createElement("span");
          span.innerHTML = node.nodeValue;
          element.replaceChild(span, node);
        }
      });
    });

    element.querySelectorAll("*").forEach(function (element) {
      if (element.children.length === 0 && element.innerHTML.length > 0) {
        element.className += " above-highlight";
      }
    });
  });

  function getSandboxLink(element, position) {
    const type = [...element.classList].find((name) =>
      name.startsWith("codesandbox-")
    );

    const createConfig = configFactoryCollection[type];

    if (createConfig === undefined) {
      return null;
    }

    const config = createConfig(element.textContent);
    const parameters = codesandbox.getParameters(config);

    const sandboxLink = document.createElement("a");
    sandboxLink.className = "codesandbox-link " + position;
    sandboxLink.innerHTML = "Run&nbsp;&nbsp;→";
    sandboxLink.href =
      "https://codesandbox.io/api/v1/sandboxes/define?parameters=" + parameters;
    sandboxLink.target = "_blank";

    return sandboxLink;
  }
};
