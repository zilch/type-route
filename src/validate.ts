import { ParameterDefinition, ParameterDefinitionCollection } from "./types";

type AssertionContext = {
  functionName: string;
  signature: string | string[];
};

function assertion<T extends (...args: any[]) => void>(
  ctx: AssertionContext,
  fn: T
): T {
  const assert = (...args: any[]) => {
    try {
      fn(...args);
    } catch (err) {
      err.message = `\n\nError invoking \`${ctx.functionName}\`\n\n${
        err.message
      }\n\nUsage:\n\n${
        Array.isArray(ctx.signature) ? ctx.signature.join("\n") : ctx.signature
      }\n`;
      throw err;
    }
  };

  return assert as any;
}

export function error(message: string) {
  const err = new Error(message);
  err.name = "TypeRouteError";
  return err;
}

function assertNumArguments(
  functionName: string,
  args: any[],
  min: number,
  max: number
) {
  if (args.length < min || args.length > max) {
    throw error(
      `Invalid number of arguments passed to \`${functionName}\`\nGot ${
        args.length
      }\nExpected ${min === max ? min : min + "-" + max}`
    );
  }
}

function assertArgumentType(
  functionName: string,
  argumentName: string,
  args: any[],
  position: number,
  isValid: (arg: any) => true | string
) {
  const result = isValid(args[position]);

  if (result === true) {
    return;
  }

  throw error(
    `Invalid value provided to \`${functionName}\` for argument \`${argumentName}\` at position ${position}\n\n${result}`
  );
}

function isTypeOf(arg: any, expectedTypeOf: string) {
  const actualTypeOf = typeof arg;

  if (actualTypeOf === expectedTypeOf) {
    if (actualTypeOf === "object" && arg === null) {
      return `Got \`null\`\nExpected an object`;
    }

    return true;
  }

  return `Got type \`${actualTypeOf}\`\nExpected type \`${expectedTypeOf}\``;
}

function isString(arg: any) {
  return isTypeOf(arg, "string");
}

function isStringArray(arg: any) {
  if (!Array.isArray(arg)) {
    return `Got type \`${typeof arg}\`\nExpected \`array\``;
  }

  if (arg.some(value => typeof value !== "string")) {
    return `Got \`${JSON.stringify(
      arg
    )}\`\nExpected all array items to be of type \`string\``;
  }

  return true;
}

function isFunction(arg: any) {
  return isTypeOf(arg, "function");
}

function isHistoryType(arg: any) {
  if (arg === "browser" || arg === "memory") {
    return true;
  }

  return `Got \`${arg}\`\nExpected either \`browser\` or \`memory\``;
}

function isRouteDefinitionBuilder(key: string, value: any) {
  const checks = [
    () => isTypeOf(value, "object"),
    () => isParameterDefinitionCollection(value.params),
    () => isFunction(value.path),
    () => isFunction(value.extend)
  ];

  for (const check of checks) {
    const result = check();
    if (result !== true) {
      return `Unexpected value for key \`${key}\`\n\nUse \`defineRoute\` for creating route definitions to pass to \`createRouter\``;
    }
  }

  return true;
}

function isRouteDefinitionBuilderCollection(arg: any) {
  const result = isTypeOf(arg, "object");

  if (result !== true) {
    return result;
  }

  for (const key in arg) {
    if (typeof key !== "string") {
      return `Got key in object of type \`${typeof key}\`\nExpected key to be of type \`string\``;
    }

    const value = arg[key] as ParameterDefinition;

    const result = isRouteDefinitionBuilder(key, value);

    if (result === true) {
      continue;
    }

    return result;
  }

  return true;
}

function isStringOrFalse(arg: any) {
  if (arg === false || typeof arg === "string") {
    return true;
  }

  return `Expected \`string\` or \`false\`\nGot ${arg}`;
}

function isRoute(arg: any) {
  const result = isTypeOf(arg, "object");

  if (result !== true) {
    return result;
  }

  const checks = [
    () => ["name", isStringOrFalse(arg.name)],
    () => ["action", isString(arg.action)],
    () => ["params", isTypeOf(arg.params, "object")]
  ];

  for (const check of checks) {
    const [name, result] = check();
    if (result !== true) {
      return `Unexpected value for key \`${name}\`\n${result}`;
    }
  }

  return true;
}

function assertRouteFn(
  functionName: string,
  args: any[],
  parameters: ParameterDefinitionCollection
) {
  const hasRequired = Object.keys(parameters).some(
    key =>
      parameters[key] === "path.param.number" ||
      parameters[key] === "path.param.string" ||
      parameters[key] === "query.param.number" ||
      parameters[key] === "query.param.number"
  );

  assertNumArguments(functionName, args, hasRequired ? 1 : 0, 1);

  if (args.length === 0) {
    return;
  }

  const result = isTypeOf(args[0], "object");

  if (result !== true) {
    return result;
  }

  const actualKeys = Object.keys(args[0]);
  const leftoverParameters = { ...parameters };

  for (const key of actualKeys) {
    const kind = parameters[key];
    const value = args[0][key];

    if (kind === undefined) {
      throw error(`Got unexpected key \`${key}\` in params object`);
    }

    if (
      kind === "path.param.number" ||
      kind === "query.param.number" ||
      kind === "query.param.number.optional"
    ) {
      if (typeof value !== "number") {
        if (kind !== "query.param.number.optional" || value !== undefined) {
          throw error(
            `Got \`${value}\` for key \`${key}\` in params object\nExpected value to be of type \`number\``
          );
        }
      }
    } else {
      if (typeof value !== "string") {
        if (kind !== "query.param.string.optional" || value !== undefined) {
          throw error(
            `Got \`${value}\` for key \`${key}\` in params object\nExpected value to be of type \`string\``
          );
        }
      }
    }

    delete leftoverParameters[key];
  }

  const leftoverParameterKeys = Object.keys(leftoverParameters);

  for (const key of leftoverParameterKeys) {
    if (
      parameters[key] === "path.param.number" ||
      parameters[key] === "path.param.string" ||
      parameters[key] === "query.param.number" ||
      parameters[key] === "query.param.string"
    ) {
      throw error(`Missing required field \`${key}\` in params object`);
    }
  }
}

function isParameterDefinitionCollection(arg: any) {
  const result = isTypeOf(arg, "object");

  if (result !== true) {
    return result;
  }

  for (const key in arg) {
    if (typeof key !== "string") {
      return `Got key in object of type \`${typeof key}\`\nExpected key to be of type \`string\``;
    }

    const value = arg[key] as ParameterDefinition;

    if (
      value === "path.param.number" ||
      value === "path.param.string" ||
      value === "query.param.number" ||
      value === "query.param.number.optional" ||
      value == "query.param.string" ||
      value === "query.param.string.optional"
    ) {
      continue;
    }

    return `Got \`${value}\` for key \`${key}\` in params object\nExpected value to be one of the following:\n- \`query.param.string.optional\`\n- \`query.param.string\`\n- \`query.param.number.optional\`\n- \`query.param.number\`\n- \`path.param.string\`\n- \`path.param.number\``;
  }

  return true;
}

function isRouteDefinition(arg: any) {
  const result = isTypeOf(arg, "object");

  if (result !== true) {
    return result;
  }

  const checks = [
    () => ["name", isString(arg.name)],
    () => ["href", isFunction(arg.href)],
    () => ["push", isFunction(arg.push)],
    () => ["link", isFunction(arg.link)],
    () => ["replace", isFunction(arg.replace)],
    () => ["match", isFunction(arg.match)]
  ];

  for (const check of checks) {
    const [key, result] = check();
    if (result !== true) {
      return `Expected a RouteDefinition object.\nGot unexpected value for key \`${key}\`\n${result}`;
    }
  }

  return true as true;
}

function isRouteDefinitionGroup(arg: any) {
  const result = isTypeOf(arg, "object");

  if (result !== true) {
    return result;
  }

  const checks = [
    () => ["routeNames", isStringArray(arg.routeNames)],
    () => ["has", isFunction(arg.has)]
  ];

  for (const check of checks) {
    const [key, result] = check();
    if (result !== true) {
      return `Expected a RouteDefinitionGroup object.\nGot unexpected value for key \`${key}\`\n${result}`;
    }
  }

  return true as true;
}

function createBuildRouteDefinitionAssertion(functionName: string) {
  return assertion(
    {
      functionName,
      signature: [
        `${functionName}(path: string): RouteDefinitionBuilder;`,
        `${functionName}(params: Parameters, path: (params: Parameters) => string): RouteDefinitionBuilder;`
      ]
    },
    (
      args: any[],
      parentParameterDefinitions: ParameterDefinitionCollection = {}
    ) => {
      assertNumArguments(functionName, args, 1, 2);

      if (args.length === 1) {
        assertArgumentType(functionName, "path", args, 0, isString);
      } else {
        assertArgumentType(
          functionName,
          "params",
          args,
          0,
          isParameterDefinitionCollection
        );
        assertArgumentType(functionName, "path", args, 1, isFunction);

        assertArgumentType(functionName, "params", args, 0, arg => {
          const childParameterNames = Object.keys(arg);
          const parentParameterNames = Object.keys(parentParameterDefinitions);

          for (const parentParameterName of parentParameterNames) {
            for (const childParameterName of childParameterNames) {
              if (childParameterName === parentParameterName) {
                return `Child routes may not have the same parameters as parent routes. Child attempted to refined parameter \`${childParameterName}\`.`;
              }
            }
          }

          return true;
        });
      }
    }
  );
}

export const validate = {
  ["defineRoute"]: createBuildRouteDefinitionAssertion("defineRoute"),

  ["[routeDefinitionBuilder].extend"]: createBuildRouteDefinitionAssertion(
    "extend"
  ),

  ["createRouter"]: assertion(
    {
      functionName: "createRouter",
      signature: [
        "createRouter(routeDefinitions: RouteDefinitions): Router;",
        'createRouter(historyType: "browser" | "memory", routeDefinitions: RouteDefinitions): Router;'
      ]
    },
    (args: any[]) => {
      assertNumArguments("createRouter", args, 1, 2);

      if (args.length === 1) {
        assertArgumentType(
          "createRouter",
          "routeDefinitions",
          args,
          0,
          isRouteDefinitionBuilderCollection
        );
      } else {
        assertArgumentType(
          "createRouter",
          "historyType",
          args,
          0,
          isHistoryType
        );
        assertArgumentType(
          "createRouter",
          "routeDefinitions",
          args,
          1,
          isRouteDefinitionBuilderCollection
        );
      }
    }
  ),

  ["[router].listen"]: assertion(
    {
      functionName: "listen",
      signature:
        "listen(handler: (nextRoute: Route, currentRoute: Route) => Promise<false | void> | false | void): { remove: () => void }"
    },
    (args: any[]) => {
      assertNumArguments("listen", args, 1, 1);
      assertArgumentType("listen", "handler", args, 0, isFunction);
    }
  ),

  ["[router].listen.remove"]: assertion(
    {
      functionName: "remove",
      signature: "remove();"
    },
    (args: any[]) => {
      assertNumArguments("remove", args, 0, 0);
    }
  ),

  ["[router].getCurrentRoute"]: assertion(
    {
      functionName: "getCurrentRoute",
      signature: "getCurrentRoute();"
    },
    (args: any[]) => {
      assertNumArguments("getCurrentRoute", args, 0, 0);
    }
  ),

  ["[route].href"]: assertion(
    {
      functionName: "href",
      signature: ["href(params?: Parameters): string"]
    },
    (args: any[], parameters: ParameterDefinitionCollection) => {
      assertRouteFn("href", args, parameters);
    }
  ),

  ["[route].push"]: assertion(
    {
      functionName: "push",
      signature: ["push(params?: Parameters): Promise<boolean>"]
    },
    (args: any[], parameters: ParameterDefinitionCollection) => {
      assertRouteFn("push", args, parameters);
    }
  ),

  ["[route].replace"]: assertion(
    {
      functionName: "replace",
      signature: ["replace(params?: Parameters): Promise<boolean>"]
    },
    (args: any[], parameters: ParameterDefinitionCollection) => {
      assertRouteFn("replace", args, parameters);
    }
  ),

  ["[route].link"]: assertion(
    {
      functionName: "link",
      signature: [
        "link(params?: Parameters): { href: string, onClick: (event?: { preventDefault?: () => void }) => void }"
      ]
    },
    (args: any[], parameters: ParameterDefinitionCollection) => {
      assertRouteFn("link", args, parameters);
    }
  ),

  ["[route].match"]: assertion(
    {
      functionName: "match",
      signature:
        "match(params: { pathName: string; queryString?: string }): RouteParameters | false;"
    },
    (args: any[]) => {
      assertNumArguments("match", args, 1, 1);
      assertArgumentType("match", "params", args, 0, arg => {
        const checks = [
          () => isTypeOf(arg, "object"),
          () => isTypeOf(arg.pathName, "string"),
          () =>
            arg.queryString === undefined || isTypeOf(arg.queryString, "string")
        ];

        for (const check of checks) {
          const result = check();
          if (result !== true) {
            return `Got ${JSON.stringify(
              arg
            )}\nExpected { pathName: string; queryString?: string }`;
          }
        }

        return true;
      });
    }
  ),

  ["createGroup"]: assertion(
    {
      functionName: "createGroup",
      signature:
        "createGroup(groupItems: (RouteDefinition | RouteDefinitionGroup)[]): RouteDefinitionGroup"
    },
    (args: any[]) => {
      assertNumArguments("createGroup", args, 1, 1);
      assertArgumentType("createGroup", "groupItems", args, 0, groupItems => {
        if (!Array.isArray(groupItems)) {
          return `Expected an array.`;
        }

        for (let index = 0; index < groupItems.length; index++) {
          const item = groupItems[index];

          const [definitionResult, groupResult] = [
            isRouteDefinition(item),
            isRouteDefinitionGroup(item)
          ];

          if (definitionResult !== true && groupResult !== true) {
            console.log(item);
            return `Unable to match element ${index} in groupItems array as RouteDefinition:\n\n${definitionResult}\n\nUnable to match as RouteDefinitionGroup:\n\n${groupResult}\n\nAll values in array must be either a RouteDefinition or RouteDefinitionGroup object.`;
          }
        }

        return true as true;
      });
    }
  ),

  ["[group].has"]: assertion(
    {
      functionName: "has",
      signature: "has(route: Route): boolean"
    },
    (args: any[]) => {
      assertNumArguments("has", args, 1, 1);
      assertArgumentType("has", "route", args, 0, isRoute);
    }
  )
};
