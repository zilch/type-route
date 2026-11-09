export function setPath(path: string) {
  window.history.replaceState(null, "", "http://localhost" + path);
}
