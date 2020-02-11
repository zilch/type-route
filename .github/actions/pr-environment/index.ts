import * as core from "@actions/core";
import * as github from "@actions/github";
import fs from "fs";
import path from "path";
import packageJson from "../../../package.json";
import tsConfig from "../../../tsconfig.json";
import got from "got";

main().catch(error => {
  core.setFailed(error.message);
});

async function main() {
  const pullRequest = github.context.payload.pull_request;
  // Token for the unprivileged type-route-bot
  const githubToken = "7188878ecc9fd67ea422d0d7b256d51c095144c6";
  // const headSha = core.getInput("head_sha");

  console.log(githubToken);
  // if (headSha === undefined) {
  //   throw new Error("Expect sha to be defined");
  // }

  if (pullRequest === undefined) {
    throw new Error(
      "Expected github.context.payload.pull_request to be defined"
    );
  }

  if (githubToken === undefined) {
    throw new Error("Expected GITHUB_TOKEN env var to be defined");
  }

  const client = new github.GitHub(githubToken);

  const files = readFiles("./src");

  const playgroundFiles: { [fileName: string]: { content: string } } = {};

  Object.keys(files).forEach(fileName => {
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
            content: tsConfig
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
  );

  await client.issues.createComment({
    owner: "bradenhs",
    repo: "type-route",
    issue_number: github.context.issue.number,
    body: `🚀 PR Environment Ready → **https://codesandbox.io/s/${response.body.sandbox_id}?module=src/playground.tsx**`
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
