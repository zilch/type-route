import {
  ParsedPath,
  ParsedPathParameterCollection,
  ParameterDefinitionCollection,
  PathFn
} from "./types";
import { error } from "./validate";

export function getParsedPath(
  routeName: string,
  pathFn: PathFn<{}>,
  parameters: ParameterDefinitionCollection
) {
  const parsedPathParameters = getParsedPathParameters(parameters);
  const pathParameterIds = getParsedPathParameterIds(parsedPathParameters);
  let path = pathFn(pathParameterIds);

  if (!path.startsWith("/")) {
    throw error(
      `\n\nIn route \`${routeName}\`\nAll paths must start with "/"\nYou provided "${path}"\n`
    );
  }

  const parsedPath: ParsedPath = [];

  const parametersNames = Object.keys(parsedPathParameters);

  if (parametersNames.length === 0) {
    return [path];
  }

  const matcher = new RegExp(
    parametersNames.map(name => parsedPathParameters[name].id).join("|")
  );

  const idToNameMap = Object.keys(parsedPathParameters).reduce(
    (result, name) => {
      result[parsedPathParameters[name].id] = name;
      return result;
    },
    {} as Record<string, string>
  );

  const unusedNames = new Set(parametersNames);

  do {
    const match = path.match(matcher);

    if (match === null) {
      if (unusedNames.size === 0) {
        parsedPath.push(path);
        break;
      }

      throw error(
        `\n\nIn route \`${routeName}\`\nYou did not use the following path parameters when constructing your path:${Array.from(
          unusedNames
        )
          .map(name => `\n- "${name}"`)
          .join(", ")}\n`
      );
    }

    const name = idToNameMap[match[0]];
    unusedNames.delete(name);

    const { id, kind } = parsedPathParameters[name];

    const pathParts = path.split(id);

    if (pathParts.length > 2) {
      throw error(
        `\n\nIn route \`${routeName}\`\nYou may only use path parameters once in a path. You used the path parameter "${name}" at least twice.\n`
      );
    }

    if (!pathParts[0].startsWith("/")) {
      throw error(
        `\n\nIn route \`${routeName}\`\nPath parameters not at the end of the path must be followed by a slash "/"\n`
      );
    }

    parsedPath.push(pathParts[0]);
    parsedPath.push({
      name,
      kind,
      id
    });

    path = pathParts[1];
  } while (path.length > 0);

  return parsedPath;
}

function getParsedPathParameterIds(
  pathParameters: ParsedPathParameterCollection
) {
  const pathParameterIds: {
    [name: string]: string;
  } = {};

  Object.keys(pathParameters).forEach(name => {
    pathParameterIds[name] = pathParameters[name].id;
  });

  return pathParameterIds;
}

function getParsedPathParameters(parameters: ParameterDefinitionCollection) {
  const parsedPathParameters: ParsedPathParameterCollection = {};

  Object.keys(parameters).forEach(name => {
    const kind = parameters[name];

    if (kind === "path.param.number" || kind === "path.param.string") {
      parsedPathParameters[name] = {
        name,
        id: `<<<${name}>>>`,
        kind
      };
    }
  });

  return parsedPathParameters;
}
