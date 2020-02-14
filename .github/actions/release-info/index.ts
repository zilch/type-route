import * as core from "@actions/core";
import * as github from "@actions/github";
import { execSync } from "child_process";
import semver from "semver";

main().catch(error => {
  core.setFailed(error.message);
});

async function main() {
  const refsTagsPrefix = "refs/tags/";
  const refsHeadsPrefix = "refs/heads/";

  const { ref } = github.context;

  const refPrefix = ref.startsWith(refsTagsPrefix)
    ? refsTagsPrefix
    : ref.startsWith(refsHeadsPrefix)
    ? refsHeadsPrefix
    : null;

  if (refPrefix === null) {
    throw new Error(
      `Expected ref to match "${refsTagsPrefix}*" or "${refsHeadsPrefix}*"`
    );
  }

  const triggeredByTag = refPrefix === refsTagsPrefix;
  const parsedRef = ref.slice(refPrefix.length);

  if (!triggeredByTag && parsedRef === "latest") {
    throw new Error('Unable to publish branch with ref "latest"');
  }

  const version = semver.valid(
    triggeredByTag ? parsedRef : `0.0.0-${github.context.sha}`
  );

  if (version === null) {
    throw new Error(`"${version}" is not a valid semver version`);
  }

  let distTag = triggeredByTag ? "latest" : parsedRef;

  if (triggeredByTag && version.includes("-")) {
    distTag = version.split(/\-(.+)/)[1];
  }

  if (distTag === "latest") {
    const latestVersion = execSync("npm show type-route version").toString();
    if (semver.lt(version, latestVersion)) {
      distTag = github.context.sha;
    }
  }

  core.setOutput("distTag", distTag);
  core.setOutput("version", version);

  console.log({ distTag, version });
}
