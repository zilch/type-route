import { noMatch } from "./noMatch";
import { PathDef } from "./types";

export function getPathMatch(path: string, pathDef: PathDef) {
  const params: Record<string, unknown> = {};

  if (path === "/" && pathDef.length === 0) {
    return { params, numExtraneousParams: 0 };
  }

  const pathHasTrailingSlash = path.length > 1 && endsWith(path, "/");

  if (pathHasTrailingSlash) {
    path = path.slice(0, path.length - 1);
  }

  const pathSegmentList = path.split("/").slice(1);

  for (
    let segmentIndex = 0;
    segmentIndex < Math.max(pathDef.length, pathSegmentList.length);
    segmentIndex++
  ) {
    const pathSegmentDef =
      segmentIndex >= pathDef.length ? null : pathDef[segmentIndex];
    let pathSegment =
      segmentIndex >= pathSegmentList.length
        ? null
        : pathSegmentList[segmentIndex];

    if (pathSegmentDef === null) {
      return false;
    }

    const numRemainingPathSegmentDefs = pathDef.length - 1 - segmentIndex;

    if (pathSegment === null) {
      if (
        numRemainingPathSegmentDefs !== 0 ||
        !pathSegmentDef.namedParamDef?.["~internal"].optional
      ) {
        return false;
      }

      break;
    }

    if (pathSegmentDef.namedParamDef?.["~internal"].trailing) {
      pathSegment = pathSegmentList.slice(segmentIndex).join("/");
    }

    if (!startsWith(pathSegment, pathSegmentDef.leading)) {
      return false;
    }

    const pathSegmentMinusLeading = pathSegment.slice(
      pathSegmentDef.leading.length
    );

    if (!endsWith(pathSegmentMinusLeading, pathSegmentDef.trailing)) {
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
      if (pathSegmentDef.namedParamDef["~internal"].optional) {
        continue;
      }

      return false;
    }

    const urlEncode =
      pathSegmentDef.namedParamDef["~internal"].valueSerializer.urlEncode ??
      !pathSegmentDef.namedParamDef["~internal"].trailing;

    let value = pathSegmentDef.namedParamDef["~internal"].valueSerializer.parse(
      urlEncode
        ? decodeURIComponent(pathSegmentMinusLeadingAndTrailing)
        : pathSegmentMinusLeadingAndTrailing
    );

    if (value === noMatch) {
      return false;
    }

    if (pathSegmentDef.namedParamDef["~internal"].trailing) {
      if (pathSegmentDef.leading === "") {
        value = `/${value}`;
      }

      if (pathHasTrailingSlash && pathSegmentDef.trailing === "") {
        value = `${value}/`;
      }
    }

    params[pathSegmentDef.namedParamDef.paramName] = value;

    if (pathSegmentDef.namedParamDef["~internal"].trailing) {
      break;
    }
  }

  return { params, numExtraneousParams: 0 };
}

function startsWith(value: string, start: string) {
  for (let i = 0; i < start.length; i++) {
    if (start[i] !== value[i]) {
      return false;
    }
  }
  return true;
}

function endsWith(value: string, end: string) {
  for (let i = 1; i <= end.length; i++) {
    if (end[end.length - i] !== value[value.length - i]) {
      return false;
    }
  }
  return true;
}
