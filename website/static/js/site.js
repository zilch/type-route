(function() {
  window.onload = function() {
    document.querySelectorAll("code.stackblitz").forEach(embedProject);

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
  };

  function embedProject(element) {
    const rawCode = element.getAttribute("data-code") || element.innerText;
    const rawCodeParts = rawCode.split("//---");
    const code =
      rawCodeParts.length === 1
        ? trimCodeBlock(rawCodeParts[0])
        : trimCodeBlock(rawCodeParts[1]);
    const html =
      rawCodeParts.length === 1 ? null : trimCodeBlock(rawCodeParts[0]);

    const files = {
      "index.ts": code,
      "index.html": html || "Nothing to preview for this example."
    };

    const project = {
      files,
      title: "type-route",
      template: "typescript",
      dependencies: {
        "type-route": "*"
      },
      settings: {
        compile: {
          trigger: "save",
          action: "refresh",
          clearConsole: false
        }
      }
    };

    element.innerHTML = "";
    const projectContainer = document.createElement("div");
    element.appendChild(projectContainer);
    StackBlitzSDK.embedProject(projectContainer, project, {
      forceEmbedLayout: true,
      clickToLoad: true,
      hideExplorer: true,
      view: html === null ? "editor" : undefined
    }).then(function() {
      element.classList.add("loaded");
    });
  }

  function trimCodeBlock(code) {
    if (code === null) {
      return null;
    }

    const lines = code.split("\n");
    const firstContentLine = lines.find(line => line.trim() !== "");
    const startingWhitespace = getStartingWhitespace(firstContentLine);

    return (
      lines
        .map(line => line.slice(startingWhitespace))
        .join("\n")
        .trim() + "\n"
    );
  }

  function getStartingWhitespace(str) {
    let startingWhitespace = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === " ") {
        startingWhitespace++;
      } else {
        break;
      }
    }
    return startingWhitespace;
  }
})();
