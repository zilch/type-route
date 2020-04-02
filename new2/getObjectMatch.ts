import { ParamDefCollection } from "./types";
import { noMatch } from "./noMatch";

export function getObjectMatch({
  object,
  paramDefs,
  urlEncodeDefault
}: {
  object: Record<string, string>;
  paramDefs: ParamDefCollection;
  urlEncodeDefault: boolean;
}) {
  const match: Record<string, unknown> = {};

  const namedParamDefs = Object.keys(paramDefs).map(name => {
    return { name, ...paramDefs[name] };
  });

  for (const paramDef of namedParamDefs) {
    let raw = object[paramDef.name];

    if (raw === undefined) {
      if (paramDef.optional) {
        continue;
      }

      return false;
    }

    const value = paramDef.valueSerializer.parse(
      paramDef.valueSerializer.urlEncode ?? urlEncodeDefault
        ? decodeURIComponent(raw)
        : raw
    );

    if (value === noMatch) {
      if (paramDef.optional) {
        continue;
      }

      return false;
    }

    match[paramDef.name] = value;
  }

  return match;
}
