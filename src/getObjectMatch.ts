import { UmbrellaParamDefCollection } from "./types";
import { noMatch } from "./noMatch";

export function getObjectMatch({
  object,
  paramDefs,
  urlEncodeDefault
}: {
  object: Record<string, string>;
  paramDefs: UmbrellaParamDefCollection;
  urlEncodeDefault: boolean;
}) {
  const params: Record<string, unknown> = {};

  const namedParamDefs = Object.keys(paramDefs).map(name => {
    return { name, ...paramDefs[name] };
  });

  const extraneousParams = { ...object };

  for (const paramDef of namedParamDefs) {
    let raw = object[paramDef.name];
    delete extraneousParams[paramDef.name];

    if (raw === undefined) {
      if (paramDef._internal.optional) {
        continue;
      }

      return false;
    }

    const value = paramDef._internal.valueSerializer.parse(
      paramDef._internal.valueSerializer.urlEncode ?? urlEncodeDefault
        ? decodeURIComponent(raw)
        : raw
    );

    if (value === noMatch) {
      if (paramDef._internal.optional) {
        continue;
      }

      return false;
    }

    params[paramDef.name] = value;
  }

  return { params, numExtraneousParams: Object.keys(extraneousParams).length };
}
