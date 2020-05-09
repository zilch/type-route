export { createRouter } from "./createRouter";
export { defineRoute } from "./defineRoute";
export { createGroup } from "./createGroup";
export { param } from "./param";
export { noMatch } from "./noMatch";
export { Route, Link, ValueSerializer, AddonContext } from "./types";

import { preventDefaultLinkClickBehavior } from "./preventDefaultAnchorClickBehavior";
import { assertUnreachable } from "./assertUnreachable";
export const utils = { preventDefaultLinkClickBehavior, assertUnreachable };
