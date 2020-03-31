import { ParamDefCollection } from "./types";
import { getObjectMatch } from "./getObjectMatch";

export function getStateMatch(
  state: Record<string, string> | undefined,
  paramDefs: ParamDefCollection<"state">
) {
  return getObjectMatch({
    object: state ?? {},
    paramDefs,
    urlEncodeDefault: false
  });
}
