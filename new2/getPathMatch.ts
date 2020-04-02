import { noMatch } from "./noMatch";
import { PathDef } from "./types";

export function getPathMatch(path: string, pathDef: PathDef) {
  const match: Record<string, unknown> = {};

  if (!path.startsWith("/")) {
    throw new Error(
      "Unexpected condition - path should start with a forward slash."
    );
  }

  const pathHasTrailingSlash = path.length > 1 && path.endsWith("/");

  if (pathHasTrailingSlash) {
    path = path.slice(0, path.length - 1);
  }

  const pathSegmentList = path.split("/").slice(1);

  for (
    let segmentIndex = 0;
    segmentIndex < Math.max(pathDef.length, pathSegmentList.length);
    segmentIndex++
  ) {
    const pathSegmentDef = pathDef[segmentIndex] ? pathDef[segmentIndex] : null;
    let pathSegment = pathSegmentList[segmentIndex]
      ? pathSegmentList[segmentIndex]
      : null;

    if (pathSegment === null && pathSegmentDef === null) {
      throw new Error("Unexpected condition - both should not be null");
    }

    if (pathSegmentDef === null) {
      return false;
    }

    const numRemainingPathSegmentDefs = pathDef.length - 1 - segmentIndex;

    if (pathSegment === null) {
      if (
        numRemainingPathSegmentDefs !== 0 ||
        !pathSegmentDef.namedParamDef?.optional
      ) {
        return false;
      }

      break;
    }

    if (pathSegmentDef.namedParamDef?.trailing) {
      if (numRemainingPathSegmentDefs > 0) {
        throw new Error(
          "Unexpected condition - trailing parameter should be the last"
        );
      }

      pathSegment = pathSegmentList.slice(segmentIndex).join("/");
    }

    if (!pathSegment.startsWith(pathSegmentDef.leading)) {
      return false;
    }

    const pathSegmentMinusLeading = pathSegment.slice(
      pathSegmentDef.leading.length
    );

    if (!pathSegmentMinusLeading.endsWith(pathSegmentDef.trailing)) {
      return false;
    }

    const pathSegmentMinusLeadingAndTrailing = pathSegmentMinusLeading.slice(
      0,
      pathSegmentMinusLeading.length - pathSegmentDef.trailing.length
    );

    if (!pathSegmentDef.namedParamDef) {
      if (pathSegmentMinusLeadingAndTrailing === "") {
        continue;
      }

      return false;
    }

    if (pathSegmentMinusLeadingAndTrailing === "") {
      if (pathSegmentDef.namedParamDef.optional) {
        continue;
      }

      return false;
    }

    const urlEncode =
      pathSegmentDef.namedParamDef.valueSerializer.urlEncode ??
      !pathSegmentDef.namedParamDef.trailing;

    let value = pathSegmentDef.namedParamDef.valueSerializer.parse(
      urlEncode
        ? decodeURIComponent(pathSegmentMinusLeadingAndTrailing)
        : pathSegmentMinusLeadingAndTrailing
    );

    if (value === noMatch) {
      return false;
    }

    if (pathSegmentDef.namedParamDef.trailing) {
      if (pathSegmentDef.leading === "") {
        value = `/${value}`;
      }

      if (pathHasTrailingSlash && pathSegmentDef.trailing === "") {
        value = `${value}/`;
      }
    }

    match[pathSegmentDef.namedParamDef.paramName] = value;

    if (pathSegmentDef.namedParamDef.trailing) {
      break;
    }
  }

  return match;
}
