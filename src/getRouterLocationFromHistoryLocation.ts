import { RouterLocation, LocationState } from "./types";
import { Location as HistoryLocation } from "history";

export function getRouterLocationFromHistoryLocation(
  historyLocation: HistoryLocation<LocationState>
): RouterLocation {
  return {
    path: historyLocation.pathname,
    query: historyLocation.search ? historyLocation.search.slice(1) : undefined,
    state: historyLocation.state?.stateParams || undefined,
  };
}
