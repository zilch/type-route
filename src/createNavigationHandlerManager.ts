import { UmbrellaNavigationHandler } from "./types";

export function createNavigationHandlerManager({
  startListening,
  stopListening,
}: {
  startListening: () => void;
  stopListening: () => void;
}) {
  const handlerIdList: {
    handler: UmbrellaNavigationHandler;
    id: number;
  }[] = [];
  let idCounter = 0;

  return { add, getHandlers };

  function getHandlers() {
    return handlerIdList.map(({ handler }) => handler);
  }

  function add(handler: UmbrellaNavigationHandler) {
    const id = idCounter++;
    handlerIdList.push({ id, handler });

    if (handlerIdList.length === 1) {
      startListening();
    }

    return remove;

    function remove() {
      const index = handlerIdList.map(({ id }) => id).indexOf(id);
      if (index >= 0) {
        handlerIdList.splice(index, 1);
        if (handlerIdList.length === 0) {
          stopListening();
        }
      }
    }
  }
}
