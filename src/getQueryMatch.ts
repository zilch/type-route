import { getObjectMatch } from "./getObjectMatch";
import { ParamDefCollection, QueryStringSerializer } from "./types";
import { assert } from "./assert";

export function getQueryMatch(
  query: string | undefined,
  paramDefs: ParamDefCollection<"query">,
  queryStringSerializer: QueryStringSerializer
) {
  let object = {};

  if (query) {
    object = queryStringSerializer.parse(query);

    assert("[QueryStringSerializer].parse", [
      assert.collectionOfType("string", "parsedQueryString", object)
    ]);
  }

  return getObjectMatch({
    object,
    paramDefs,
    urlEncodeDefault: true
  });
}
