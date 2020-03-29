import { PathPart, ParamType, Param } from "./types";

type Location = {
  path: string;
  query: string;
  state: {
    _internal: {
      params: Record<string, any>;
    };
  };
};

export function match(
  location: Location,
  pathParts: PathPart[],
  params: Record<string, Param<ParamType, "optional" | "required">>
): Record<string, any> | false {
  return {};
}
