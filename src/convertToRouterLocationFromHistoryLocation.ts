import { RouterLocation, LocationState } from "./types";
import { Location as HistoryLocation } from "history";

export function convertToRouterLocationFromHistoryLocation(
  rawLocation: Pick<
    HistoryLocation<LocationState>,
    "pathname" | "search" | "state"
  >
): RouterLocation {
  return {
    path: rawLocation.pathname,
    query: rawLocation.search ? rawLocation.search.slice(1) : undefined,
    state: rawLocation.state?.state || undefined,
  };
}
