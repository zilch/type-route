import { UmbrellaParamDefCollection } from "./types";
import { noMatch } from "./noMatch";

export function getObjectMatch({
  object,
  paramDefs,
  urlEncodeDefault,
  arraySeparator,
}: {
  object: Record<string, string | null>;
  paramDefs: UmbrellaParamDefCollection;
  urlEncodeDefault: boolean;
  arraySeparator: string;
}) {
  const params: Record<string, unknown> = {};

  const namedParamDefs = Object.keys(paramDefs).map((name) => {
    return { name, ...paramDefs[name] };
  });

  const extraneousParams = { ...object };

  for (const paramDef of namedParamDefs) {
    let raw = object[paramDef.name];
    delete extraneousParams[paramDef.name];

    if (raw === undefined) {
      if (paramDef["~internal"].optional) {
        continue;
      }

      return false;
    }

    let value;

    if (raw === null) {
      if (paramDef["~internal"].array) {
        value = [];
      } else if (paramDef["~internal"].optional) {
        continue;
      } else {
        return false;
      }
    } else if (paramDef["~internal"].array) {
      value = raw.split(arraySeparator).map((part) => {
        return paramDef["~internal"].valueSerializer.parse(
          paramDef["~internal"].valueSerializer.urlEncode ?? urlEncodeDefault
            ? decodeURIComponent(part)
            : part
        );
      });

      if (value.some((part) => part === noMatch)) {
        if (paramDef["~internal"].optional) {
          continue;
        }

        return false;
      }
    } else {
      value = paramDef["~internal"].valueSerializer.parse(
        paramDef["~internal"].valueSerializer.urlEncode ?? urlEncodeDefault
          ? decodeURIComponent(raw)
          : raw
      );

      if (value === noMatch) {
        if (paramDef["~internal"].optional) {
          continue;
        }

        return false;
      }
    }

    params[paramDef.name] = value;
  }

  return { params, numExtraneousParams: Object.keys(extraneousParams).length };
}
