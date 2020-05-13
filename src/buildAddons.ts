import { Link, UmbrellaRoute } from "./types";
import { mapObject } from "./mapObject";

export function buildAddons({
  addons,
  href,
  link,
  replace,
  push,
  routeName,
  getAddonArgsAndParams,
}: {
  addons: Record<string, (...args: any[]) => any>;
  href: () => string;
  link: () => Link;
  replace: () => boolean;
  push: () => boolean;
  routeName: string | false;
  getAddonArgsAndParams: (
    args: any[]
  ) => {
    params: Record<string, unknown>;
    args: any[];
  };
}) {
  const constructedAddons = mapObject(addons, (addon) => {
    return (...inputArgs: any[]) => {
      const { args, params } = getAddonArgsAndParams(inputArgs);
      const route: UmbrellaRoute = {
        href,
        link,
        push,
        replace,
        params,
        name: routeName,
        addons: {},
      };

      Object.defineProperty(route, "addons", {
        get() {
          return constructedAddons;
        },
      });

      return addon(route, ...args);
    };
  });

  return constructedAddons;
}
