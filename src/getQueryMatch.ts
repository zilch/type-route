import { QueryParameterDefinitionCollection } from "./types";
import qs from "querystringify";
import { isNumeric } from "./isNumeric";
import { error } from "./validate";

export function getQueryMatch(
  queryString: string,
  queryParameters: QueryParameterDefinitionCollection
) {
  const match: { [name: string]: string | number } = {};

  const queryParameterNames = Object.keys(queryParameters);

  if (queryParameterNames.length === 0 && queryString === "") {
    return match;
  }

  const queryParameterValues = qs.parse(queryString) as Record<string, string>;

  for (const name of queryParameterNames) {
    const kind = queryParameters[name];
    const value = queryParameterValues[name];

    if (kind === "query.param.number") {
      if (value === undefined || !isNumeric(value)) {
        return false;
      }

      match[name] = parseFloat(value);
    } else if (kind === "query.param.string") {
      if (value === undefined) {
        return false;
      }

      match[name] = value;
    } else if (kind === "query.param.number.optional") {
      if (value !== undefined) {
        if (!isNumeric(value)) {
          return false;
        }

        match[name] = parseFloat(value);
      }
    } else if (kind === "query.param.string.optional") {
      if (value !== undefined) {
        match[name] = value;
      }
    } else {
      throw error(`\n\nUnexpected kind "${kind}"\n`);
    }

    delete queryParameterValues[name];
  }

  if (Object.keys(queryParameterValues).length > 0) {
    return false;
  }

  return match;
}
