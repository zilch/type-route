import { getObjectMatch } from "./getObjectMatch";
import { ParamDefCollection, QueryStringSerializer } from "./types";

export function getQueryMatch(
  query: string | undefined,
  paramDefs: ParamDefCollection<"query">,
  queryStringSerializer: QueryStringSerializer
) {
  return getObjectMatch({
    object: query ? queryStringSerializer.parse(query) : {},
    paramDefs,
    urlEncodeDefault: true
  });
}
