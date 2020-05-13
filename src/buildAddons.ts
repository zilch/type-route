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
  href: (params: Record<string, unknown>) => string;
  link: (params: Record<string, unknown>) => Link;
  replace: (params: Record<string, unknown>) => boolean;
  push: (params: Record<string, unknown>) => boolean;
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
        href: () => href(params),
        link: () => link(params),
        push: () => push(params),
        replace: () => replace(params),
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
