import { validLabels, type WheelOption, type WheelState } from "./wheel.ts";
import { HOME_TOOL, type WheelTool } from "./wheel-tools.ts";

export const WHEEL_STORAGE_KEY = HOME_TOOL.storageKey;

export type PersistedWheel = {
  version: 2;
  title: string;
  options: string[];
};

export function parseStoredWheel(raw: string | null): PersistedWheel | null {
  if (raw === null) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null
      || !("version" in data) || (data.version !== 1 && data.version !== 2)
      || !("options" in data) || !validLabels(data.options)) return null;
    if (data.version === 2 && "title" in data && typeof data.title !== "string") return null;
    return { version: 2, title: data.version === 2 && "title" in data ? (data.title as string).trim() : "", options: data.options };
  } catch {
    return null;
  }
}

export function loadWheel(tool: WheelTool = HOME_TOOL): WheelState {
  let saved: PersistedWheel | null = null;
  try {
    saved = parseStoredWheel(window.localStorage.getItem(tool.storageKey));
  } catch {
    // Access to localStorage itself can throw. The wheel still works in memory.
  }
  // IDs are session-local; reconstruct them and continue new IDs from this count.
  return { title: saved?.title ?? tool.defaults.title, options: (saved?.options ?? tool.defaults.labels).map((label, id) => ({ id, label })) };
}

export function saveWheel(options: WheelOption[], title: string, tool: WheelTool = HOME_TOOL): void {
  const labels = options.map(({ label }) => label);
  // A temporary blank input must not replace the last usable saved wheel.
  if (!validLabels(labels)) return;
  const data: PersistedWheel = { version: 2, title: title.trim(), options: labels };
  try {
    const storage = window.localStorage;
    const serialized = JSON.stringify(data);
    if (storage.getItem(tool.storageKey) !== serialized) {
      storage.setItem(tool.storageKey, serialized);
    }
  } catch {
    // Privacy restrictions and quota errors must not interrupt editing or spins.
  }
}
