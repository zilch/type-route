import { ParsedPath } from "./types";
import { isNumeric } from "./isNumeric";

export function getPathMatch(pathName: string, parsedPath: ParsedPath) {
  const match: { [name: string]: string | number } = {};

  for (const pathPart of parsedPath) {
    if (pathName === "") {
      return false;
    }

    if (typeof pathPart === "string") {
      if (!pathName.startsWith(pathPart)) {
        return false;
      }

      pathName = pathName.slice(pathPart.length);
    } else {
      const [first, ...rest] = pathName.split("/");

      if (pathPart.kind === "path.param.number") {
        if (isNumeric(first)) {
          match[pathPart.name] = parseFloat(first);
        } else {
          return false;
        }
      } else {
        match[pathPart.name] = first;
      }

      pathName = rest.length === 0 ? "" : "/" + rest.join("/");
    }
  }

  if (pathName.length > 0) {
    return false;
  }

  return match;
}
