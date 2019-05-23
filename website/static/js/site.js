window.onload = function() {
  let lastShowShadow = false;

  document.addEventListener("scroll", function() {
    showShadow = window.scrollY > 10;

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
    "codesandbox-react": code => ({
      files: {
        "sandbox.config.json": {
          content:
            "{\n" + '  "template": "create-react-app-typescript"\n' + "}\n"
        },
        "src/index.tsx": {
          content: code
        },
        "package.json": {
          content: {
            dependencies: {
              "type-route": "latest",
              react: "latest",
              "@types/react": "latest",
              "react-dom": "latest",
              "@types/react-dom": "latest"
            }
          }
        }
      }
    }),
    "codesandbox-standard": code => ({
      files: {
        "index.ts": {
          content: code
        },
        "package.json": {
          content: {
            dependencies: {
              "type-route": "latest"
            }
          }
        }
      }
    })
  };

  document
    .querySelectorAll(
      Object.keys(configFactoryCollection)
        .map(key => "." + key)
        .join(",")
    )
    .forEach(element => {
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

  function getSandboxLink(element, position) {
    const type = [...element.classList].find(name =>
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
    sandboxLink.innerHTML = "Run on CodeSandbox&nbsp;&nbsp;&nbsp;▶";
    sandboxLink.href =
      "https://codesandbox.io/api/v1/sandboxes/define?parameters=" + parameters;
    sandboxLink.target = "_blank";

    return sandboxLink;
  }
};
