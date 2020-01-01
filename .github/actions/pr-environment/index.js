const core = require("@actions/core");
const github = require("@actions/github");
const codesandbox = require("codesandbox/lib/api/define");
const fs = require("fs");
const path = require("path");
const packageJson = require("../../../package.json");
const got = require("got");

main().catch(error => {
  core.setFailed(error.message);
});

async function main() {
  const client = new github.GitHub(process.env.GITHUB_TOKEN);

  const files = readFiles("./src");

  const playgroundFiles = {};

  Object.keys(files).forEach(fileName => {
    const playgroundFileName = fileName.slice(process.cwd().length);
    playgroundFiles[playgroundFileName] = files[fileName];
  });

  const { sandbox_id: sandboxId } = await got({
    url: "https://codesandbox.io/api/v1/sandboxes/define",
    method: "POST",
    json: {
      json: 1,
      parameters: {
        files: {
          ...playgroundFiles,
          "tsconfig.json": {
            content: fs.readFileSync("./tsconfig.json")
          },
          "package.json": {
            content: {
              main: "./src/playground.html",
              scripts: {
                start: "parcel ./src/playground.html --open",
                build: "parcel build ./src/playground/index.html"
              },
              dependencies: {
                ...packageJson.dependencies,
                "parcel-bundler": "^1.6.1",
                react: "=16.8.6",
                "@types/react": "=16.8.18",
                "react-dom": "=16.8.6",
                "@types/react-dom": "=16.8.4"
              }
            }
          }
        }
      }
    }
  });

  await client.issues.createComment({
    issue_number: github.context.payload.pull_request.number,
    body: `New CodeSandbox playground ready (based on ${github.context.sha}). View playground ${sandboxId}.`,
    owner: "bradenhs",
    repo: "type-route"
  });
}

function readFiles(directoryName) {
  const fileNameCollection = fs.readdirSync(directoryName);
  const files = {};

  for (const fileName of fileNameCollection) {
    const filePath = path.resolve(directoryName, fileName);

    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      files[filePath] = fs.readFileSync(filePath).toString();
    } else {
      Object.assign(files, readFiles(filePath));
    }
  }

  return files;
}
