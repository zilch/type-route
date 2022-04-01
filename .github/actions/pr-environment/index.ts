import * as core from "@actions/core";
import * as github from "@actions/github";
import fs from "fs";
import path from "path";
import packageJson from "../../../package.json";
import tsConfig from "../../../tsconfig.json";
import got from "got";

main().catch((error) => {
  core.setFailed(error.message);
});

async function main() {
  const pullRequest = github.context.payload.pull_request;

  if (pullRequest === undefined) {
    core.info("This doesn't appear to be a pull_request. Skipping.");
    return;
  }

  // Token for the type-route-bot. This bot has no special permissions and
  // is only used for commenting on PRs. GitHub doesn't like putting an
  // auth token directly in CI so this is base64 encoded here.
  const githubToken = new Buffer(
    "MjQxNjJjYjMxNjcwMzk1MWEwM2U1NjYwZGM1ODM4YzRkZjFmODI0NA==",
    "base64"
  ).toString("ascii");

  const client = new github.GitHub(githubToken);
  const files = readFiles("./src");
  const playgroundFiles: { [fileName: string]: { content: string } } = {};

  Object.keys(files).forEach((fileName) => {
    const playgroundFileName = fileName.slice(process.cwd().length);
    playgroundFiles[playgroundFileName] = { content: files[fileName] };
  });

  const response = await got.post<{ sandbox_id: string }>(
    "https://codesandbox.io/api/v1/sandboxes/define",
    {
      responseType: "json",
      json: {
        json: 1,
        files: {
          ...playgroundFiles,
          "tsconfig.json": {
            content: tsConfig,
          },
          "package.json": {
            content: {
              main: "./src/playground.html",
              scripts: {
                start: "parcel ./src/playground.html --open",
                build: "parcel build ./src/playground/index.html",
              },
              dependencies: {
                ...packageJson.dependencies,
                parcel: "^2.2.0",
                react: "=18.0.0",
                "@types/react": "=17.0.43",
                "react-dom": "=18.0.0",
                "@types/react-dom": "=17.0.14",
                typescript: "=4.6.3",
                tslib: "2.3.1",
              },
            },
          },
        },
      },
    }
  );

  await client.issues.createComment({
    owner: "typehero",
    repo: "type-route",
    issue_number: pullRequest.number,
    body: `🚀 **PR Environment Ready** → **https://codesandbox.io/s/${response.body.sandbox_id}?module=src/playground.tsx**`,
  });
}

function readFiles(directoryName: string) {
  const fileNameCollection = fs.readdirSync(directoryName);
  const files: { [filePath: string]: string } = {};

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
