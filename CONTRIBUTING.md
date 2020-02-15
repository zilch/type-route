## Type Route Source

`npm install` then `npm run playground` or `npm test`

## Documentation Website

`cd website` then `npm install` then `npm start`

## Releasing New Versions

Releases are handled via commits pushed to origin and the GitHub release user interface. Every commit is published and official releases (complete with changelog entries in the release description) happen via creating tags in the GitHub releases interface. Here's a summary of which actions trigger which type of release.

| Event                                          | Version     | Dist Tag    |
| ---------------------------------------------- | ----------- | ----------- |
| Commit pushed                                  | 0.0.0-sha   | branch name |
| Tag vX.Y.Z-alpha (where alpha can be anything) | X.Y.Z-alpha | `alpha`     |
| Tag vX.Y.Z (version greater than latest)       | X.Y.Z       | `latest`    |
| Tag vX.Y.Z (version less than latest)          | X.Y.Z       | commit Sha  |
