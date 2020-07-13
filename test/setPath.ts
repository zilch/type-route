export function setPath(path: string) {
  delete (global as any).window.location;
  (global as any).window.location = new URL("http://localhost" + path);
}
