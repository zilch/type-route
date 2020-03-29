import { PathPart } from "./types";
import { noMatch } from "./constants";

export function matchPath(
  path: string,
  pathParts: PathPart[]
): Record<string, any> | false {
  if (!path.startsWith("/")) {
    throw new Error();
  }

  if (path.length > 1 && path.endsWith("/")) {
    throw new Error();
  }

  const [_, ...segments] = path === "/" ? [] : path.split("/");
  const parsedParams: Record<string, any> = {};

  for (let i = 0; i < Math.max(segments.length, pathParts.length); i++) {
    let segment: string | null = segments[i] ?? null;
    const pathPart: PathPart | null = pathParts[i] ?? null;

    if (segment === null || pathPart === null) {
      throw new Error("not yet implemented");
    }

    if (!segment.startsWith(pathPart.leading)) {
      return false;
    }

    segment = segment.slice(pathPart.leading.length);

    if (!segment.endsWith(pathPart.trailing)) {
      return false;
    }

    segment = segment.slice(0, segment.length - pathPart.trailing.length);

    if (!pathPart.param) {
      if (segment.length > 0) {
        return false;
      }

      continue;
    }

    if (segment.length === 0) {
      if (pathPart.param._internal.optionality === "optional") {
        continue;
      }

      return false;
    }

    const result = pathPart.param._internal.paramValueSerializer.parse(segment);

    if (result === noMatch) {
      return false;
    }

    parsedParams[pathPart.param._internal.name] = result;
  }

  return {};
}
