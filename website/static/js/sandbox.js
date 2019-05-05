(function() {
  window.onload = function() {
    document.querySelectorAll("[data-code]").forEach(embedProject);
  };

  function embedProject(element) {
    const code = trimCodeBlock(element.getAttribute("data-code"));
    const html = trimCodeBlock(element.getAttribute("data-html"));

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

    const projectContainer = document.createElement("div");
    element.appendChild(projectContainer);
    StackBlitzSDK.embedProject(projectContainer, project, {
      forceEmbedLayout: true,
      hideExplorer: true,
      view: html === null ? "editor" : undefined,
      clickToLoad: false
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
