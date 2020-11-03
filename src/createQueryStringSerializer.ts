import { QueryStringSerializer, QueryStringArrayFormat } from "./types";
import { stringUtils } from "./stringUtils";

export function createQueryStringSerializer(
  args: {
    queryStringArrayFormat?: QueryStringArrayFormat;
    arraySeparator?: string;
  } = {}
): QueryStringSerializer {
  const queryStringArrayFormat =
    args.queryStringArrayFormat ?? "singleKeyWithBracket";
  const arraySeparator = args.arraySeparator ?? ",";

  const multiKey =
    queryStringArrayFormat === "multiKey" ||
    queryStringArrayFormat === "multiKeyWithBracket";

  const arrayKeySuffix =
    queryStringArrayFormat === "multiKey" ||
    queryStringArrayFormat === "singleKey"
      ? ""
      : "[]";

  return {
    parse: (raw) => {
      const queryParams: Record<string, string | null> = {};

      for (const part of raw.split("&")) {
        const [rawParamName, rawParamValue, ...rest] = part.split("=");

        if (rawParamName === undefined || rest.length > 0) {
          continue;
        }

        const key = decodeURIComponent(
          stringUtils.endsWith(rawParamName, arrayKeySuffix)
            ? rawParamName.slice(0, rawParamName.length - arrayKeySuffix.length)
            : rawParamName
        );

        if (rawParamValue === undefined) {
          queryParams[key] = null;
        } else if (queryParams[key] && multiKey) {
          queryParams[key] += `${arraySeparator}${rawParamValue}`;
        } else {
          queryParams[key] = rawParamValue;
        }
      }

      return queryParams;
    },

    stringify: (queryParams) => {
      return Object.keys(queryParams)
        .map((name) => {
          const encodedName = encodeURIComponent(name);
          const key = queryParams[name].array
            ? `${encodedName}${arrayKeySuffix}`
            : encodedName;
          const value = queryParams[name].value;

          if (value === null) {
            return key;
          }

          if (queryParams[name].array && multiKey) {
            const valueParts = value.split(arraySeparator);
            return valueParts.map((part) => `${key}=${part}`).join("&");
          }

          return `${key}=${value}`;
        })
        .join("&");
    },
  };
}
