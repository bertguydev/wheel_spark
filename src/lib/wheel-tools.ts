import type { WheelState } from "./wheel.ts";

export type WheelPreset = { id: string; name: string; title: string; labels: readonly string[] };
export type WheelTool = {
  storageKey: string;
  defaults: WheelPreset;
  presets?: readonly WheelPreset[];
};

export const HOME_TOOL: WheelTool = {
  // Keep the original key and defaults for existing users.
  storageKey: "sparkywheel:wheel",
  defaults: { id: "home", name: "Default wheel", title: "", labels: ["Pizza", "Tacos", "Burgers", "Sushi", "Thai", "Pasta"] },
};

const dinner: WheelPreset = {
  id: "dinner", name: "Dinner Ideas", title: "What should I eat?",
  labels: ["Pizza", "Tacos", "Burgers", "Pasta", "Stir-fry", "Curry", "Burritos", "Noodle soup", "Baked potatoes", "Grain bowls"],
};

export const FOOD_TOOL: WheelTool = {
  storageKey: "sparkywheel:wheel:food-wheel",
  defaults: dinner,
  presets: [
    dinner,
    { id: "takeout", name: "Takeout / Cuisines", title: "Which cuisine tonight?", labels: ["Italian", "Mexican", "Chinese", "Japanese", "Thai", "Indian", "Greek", "Korean"] },
    { id: "quick", name: "Quick Meals", title: "What quick meal should I make?", labels: ["Quesadillas", "Omelet", "Grilled cheese", "Pasta with pesto", "Bean burritos", "Loaded toast", "Couscous bowl", "Hummus wrap"] },
  ],
};

// Return fresh options so editing a wheel can never mutate a preset.
export function wheelFromPreset(preset: WheelPreset): WheelState {
  return { title: preset.title, options: preset.labels.map((label, id) => ({ id, label })) };
}
