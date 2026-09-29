import type { WheelState } from "./wheel.ts";
import { loadWheel, saveWheel } from "./wheel-storage.ts";
import { sharedWheelFromUrl, withoutSharedWheel } from "./wheel-sharing.ts";
import { HOME_TOOL, type WheelTool } from "./wheel-tools.ts";

export type WheelSession = { wheel: WheelState; source: "shared" | "local" };

export function initializeWheel(href: string, tool: WheelTool = HOME_TOOL): WheelSession {
  const shared = sharedWheelFromUrl(href);
  return shared ? { wheel: shared, source: "shared" } : { wheel: loadWheel(tool), source: "local" };
}

// Only explicit configuration edits call this. Spinning and sharing never do.
export function adoptWheel(wheel: WheelState): WheelSession {
  return { wheel, source: "local" };
}

export function persistWheelSession(session: WheelSession, tool: WheelTool = HOME_TOOL): void {
  if (session.source === "local") saveWheel(session.wheel.options, session.wheel.title, tool);
}

export function clearSharedWheelUrl(): void {
  try {
    const current = window.location.href;
    const clean = withoutSharedWheel(current);
    if (clean !== current) window.history.replaceState(window.history.state, "", clean);
  } catch {
    // Restricted History access must not prevent editing or saving the wheel.
  }
}
