import { expectTypeRouteError } from "./expectTypeRouteError";
import { TypeRouteError } from "../src/TypeRouteError";
import { assert } from "../src/assert";

describe("assert", () => {
  test("collectionOfType", () => {
    expectTypeRouteError(
      TypeRouteError.Expected_type_does_not_match_actual_type,
      () => {
        assert.collectionOfType(["number", "string"], "test", false)("context");
      }
    );
  });

  test("arrayOfType", () => {
    expectTypeRouteError(
      TypeRouteError.Expected_type_does_not_match_actual_type,
      () => {
        assert.arrayOfType(["number", "string"], "test", false)("context");
      }
    );
  });
});
