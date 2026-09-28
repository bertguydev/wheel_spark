import { validLabels, type WheelOption, type WheelState } from "./wheel.ts";

export const WHEEL_STORAGE_KEY = "sparkywheel:wheel";

export type PersistedWheel = {
  version: 2;
  title: string;
  options: string[];
};

const DEFAULT_LABELS = ["Pizza", "Tacos", "Burgers", "Sushi", "Thai", "Pasta"];

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

export function loadWheel(): WheelState {
  let saved: PersistedWheel | null = null;
  try {
    saved = parseStoredWheel(window.localStorage.getItem(WHEEL_STORAGE_KEY));
  } catch {
    // Access to localStorage itself can throw. The wheel still works in memory.
  }
  // IDs are session-local; reconstruct them and continue new IDs from this count.
  return { title: saved?.title ?? "", options: (saved?.options ?? DEFAULT_LABELS).map((label, id) => ({ id, label })) };
}

export function saveWheel(options: WheelOption[], title: string): void {
  const labels = options.map(({ label }) => label);
  // A temporary blank input must not replace the last usable saved wheel.
  if (!validLabels(labels)) return;
  const data: PersistedWheel = { version: 2, title: title.trim(), options: labels };
  try {
    const storage = window.localStorage;
    const serialized = JSON.stringify(data);
    if (storage.getItem(WHEEL_STORAGE_KEY) !== serialized) {
      storage.setItem(WHEEL_STORAGE_KEY, serialized);
    }
  } catch {
    // Privacy restrictions and quota errors must not interrupt editing or spins.
  }
}
