import { ClickEvent } from "./types";

export function preventDefaultLinkClickBehavior(event: any = {}) {
  const e = event as ClickEvent;
  const isModifiedEvent = !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);

  const isSelfTarget =
    !e.target || !e.target.target || e.target.target === "_self";

  if (
    isSelfTarget && // Ignore everything but links with target self
    !e.defaultPrevented && // onClick prevented default
    e.button === 0 && // ignore everything but left clicks
    !isModifiedEvent // ignore clicks with modifier keys
  ) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    return true;
  }

  return false;
}
