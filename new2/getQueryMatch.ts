import { getObjectMatch } from "./getObjectMatch";
import { ParamDefCollection } from "./types";
import { queryStringSerializer } from "./queryStringSerializer";

export function getQueryMatch(
  query: string | undefined,
  paramDefs: ParamDefCollection<"query">
) {
  return getObjectMatch({
    object: query ? queryStringSerializer.parse(query) : {},
    paramDefs,
    urlEncodeDefault: true
  });
}
