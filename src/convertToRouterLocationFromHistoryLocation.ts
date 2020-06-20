import { RouterLocation, LocationState } from "./types";
import { Location as HistoryLocation } from "history";
import { stringUtils } from "./stringUtils";

const { startsWith } = stringUtils;

export function convertToRouterLocationFromHistoryLocation(
  rawLocation: Pick<
    HistoryLocation<LocationState>,
    "pathname" | "search" | "state"
  >,
  baseUrl: string
): RouterLocation {
  return {
    fullPath: rawLocation.pathname,
    path: startsWith(rawLocation.pathname, baseUrl)
      ? baseUrl !== "/"
        ? rawLocation.pathname.replace(baseUrl, "")
        : rawLocation.pathname
      : undefined,
    query: rawLocation.search
      ? startsWith(rawLocation.search, "?")
        ? rawLocation.search.slice(1)
        : rawLocation.search
      : undefined,
    state: rawLocation.state?.state || undefined,
  };
}
