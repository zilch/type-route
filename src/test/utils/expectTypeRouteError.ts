import { TypeRouteError } from "../../TypeRouteError";

export function expectTypeRouteError(
  error: typeof TypeRouteError[keyof typeof TypeRouteError],
  fn: () => void
) {
  expect(fn).toThrowError(new RegExp(`TR${error.errorCode}`));
}
