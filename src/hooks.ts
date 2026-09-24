import { useEffect, useState } from "react";

/**
 * Subscribes to a media query.
 *
 * The layout switch between drawer and fixed sidebar can't be pure CSS: the
 * drawer needs open/closed state, a scrim, and to close itself on navigation.
 * So the breakpoint has to be readable from JavaScript too — and this is the
 * one place it's defined, matching `--bp-mobile` in the stylesheet.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof matchMedia === "function" && matchMedia(query).matches,
  );

  useEffect(() => {
    const list = matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Below this the sidebar becomes an overlay drawer. */
export const MOBILE = "(max-width: 860px)";
