export function assertUnreachable(_: never): never {
  throw new Error("This code block should be unreachable.");
}
