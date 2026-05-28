import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function getSnapshot() {
  if (typeof globalThis === "undefined" || !("matchMedia" in globalThis)) {
    return false;
  }
  return globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function subscribe(onStoreChange: () => void) {
  if (typeof globalThis === "undefined" || !("matchMedia" in globalThis)) {
    return () => {};
  }

  const mediaQuery = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}
