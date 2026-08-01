import { useEffect, useState } from "react";

/** Not in lib.dom yet — Chromium-only, feature-detected below. */
type NetworkInformation = { saveData?: boolean; effectiveType?: string };

const SLOW = new Set(["slow-2g", "2g", "3g"]);
const MOBILE_BREAKPOINT = 768;

/**
 * Whether this visitor should get the video at all.
 *
 * Returns false on the server and on first client paint, so the poster is what
 * renders immediately — something is on screen before a single video byte is
 * requested. The video only mounts after this flips true on the client.
 *
 * Declines for: reduced-motion users, narrow viewports, Data Saver, and
 * 3g-or-worse connections. The video is decorative; none of these visitors
 * lose anything but the download.
 */
export function useHeroVideoEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < MOBILE_BREAKPOINT) return;

    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && SLOW.has(conn.effectiveType)) return;

    setEnabled(true);
  }, []);

  return enabled;
}
