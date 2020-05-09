import { RouterLocation } from "./types";

export function areLocationsEqual(
  locationA: RouterLocation,
  locationB: RouterLocation
) {
  if (
    locationA.path !== locationB.path ||
    locationA.query !== locationB.query
  ) {
    return false;
  }

  if (locationA.state === undefined || locationB.state === undefined) {
    return locationA.state === locationB.state;
  }

  const locationAKeys = Object.keys(locationA.state ?? {});
  const locationBKeys = Object.keys(locationB.state ?? {});

  if (locationAKeys.length !== locationBKeys.length) {
    return false;
  }

  for (const key of locationAKeys) {
    if (
      !locationBKeys.includes(key) ||
      locationA.state[key] !== locationB.state[key]
    ) {
      return false;
    }
  }

  return true;
}
