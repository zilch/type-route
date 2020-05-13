import { RouterConfig } from "./types";
import { assert } from "./assert";

export function createConfig<TAddons>(config: RouterConfig<TAddons>) {
  if (__DEV__) {
    assert("createConfig", [assert.type("object", "config", config)]);
  }

  return config;
}
