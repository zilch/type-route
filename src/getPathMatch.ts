import { ParsedPath } from "./types";
import { isNumeric } from "./isNumeric";

export function getPathMatch(pathName: string, parsedPath: ParsedPath) {
  const match: { [name: string]: string | number } = {};

  for (const pathPart of parsedPath) {
    if (pathName === "") {
      return null;
    }

    if (typeof pathPart === "string") {
      if (!pathName.startsWith(pathPart)) {
        return null;
      }

      pathName = pathName.split(pathPart)[1];
    } else {
      const [first, ...rest] = pathName.split("/");

      if (pathPart.kind === "path.param.number") {
        if (isNumeric(first)) {
          match[pathPart.name] = parseFloat(first);
        } else {
          return null;
        }
      } else {
        match[pathPart.name] = first;
      }

      pathName = rest.length === 0 ? "" : "/" + rest.join("/");
    }
  }

  if (pathName.length > 0) {
    return null;
  }

  return match;
}
