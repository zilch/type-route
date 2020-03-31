import { QueryStringSerializer } from "./types";

export const queryStringSerializer: QueryStringSerializer = {
  parse: raw => {
    const queryParams: Record<string, string> = {};

    for (const part of raw.split("&")) {
      const [rawParamName, rawParamValue, ...rest] = part.split("=");

      if (
        rawParamName === undefined ||
        rawParamValue === undefined ||
        rest.length > 0
      ) {
        continue;
      }

      queryParams[decodeURIComponent(rawParamName)] = rawParamValue;
    }

    return queryParams;
  },

  stringify: queryParams => {
    return Object.keys(queryParams)
      .map(name => `${encodeURIComponent(name)}=${queryParams[name]}`)
      .join("&");
  }
};
