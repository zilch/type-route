import * as core from "@actions/core";
import * as github from "@actions/github";

main().catch(error => {
  core.setFailed(error.message);
});

async function main() {
  console.log(JSON.stringify(github, null, 1));
}
