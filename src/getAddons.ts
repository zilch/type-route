import { AddonContext } from "./types";

export function getAddons(
  addonsDefs: Record<string, (ctx: AddonContext<any>, ...args: any[]) => any>
): Record<string, (...args: any[]) => any> {}
