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
      const bottomLink = getSandboxLink(element, "bottom");

      if (topLink !== null) {
        element.parentNode.insertBefore(topLink, element);
      }

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
    sandboxLink.innerHTML =
      "Edit on CodeSandbox <span class='external-link-icon'/>";
    sandboxLink.href =
      "https://codesandbox.io/api/v1/sandboxes/define?parameters=" + parameters;
    sandboxLink.target = "_blank";

    return sandboxLink;
  }
};
