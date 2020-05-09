import { RouterLocation } from "./types";

export function getLocationFromUrl(url: string, state?: any): RouterLocation {
  const [path, ...rest] = url.split("?");
  const query = rest.length === 0 ? undefined : rest.join("?");
  return { path, query, state };
}
