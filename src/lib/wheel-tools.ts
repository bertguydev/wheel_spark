import type { WheelState } from "./wheel.ts";

export type WheelPreset = { id: string; name: string; title: string; labels: readonly string[] };
export type WheelTool = {
  modeControls?: boolean;
  presetLabel?: string;
  titlePlaceholder?: string;
  storageKey: string;
  defaults: WheelPreset;
  presets?: readonly WheelPreset[];
};

const yesNo: WheelPreset = { id: "yes-no", name: "Yes / No", title: "", labels: ["Yes", "No"] };
export const YES_NO_TOOL: WheelTool = {
  storageKey: "sparkywheel:wheel:yes-or-no-wheel",
  defaults: yesNo,
  modeControls: true,
  presets: [yesNo, { id: "yes-no-maybe", name: "Yes / No / Maybe", title: "", labels: ["Yes", "No", "Maybe"] }],
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

const drawingMix: WheelPreset = {
  id: "drawing-mix", name: "Creative Mix", title: "",
  labels: ["Frog wearing a crown", "Cozy treehouse", "Astronaut with a kite", "Sleepy dragon", "Mushroom village", "Robot cooking dinner", "Underwater castle", "Haunted house", "Cat in a cardboard box", "Tiny island", "Monster delivering mail", "Wizard's desk", "Snail with a garden", "Moonlit campsite"],
};

export const DRAWING_TOOL: WheelTool = {
  storageKey: "sparkywheel:wheel:drawing-ideas-wheel",
  defaults: drawingMix,
  presetLabel: "Drawing prompt collection",
  titlePlaceholder: "What should I draw?",
  presets: [
    drawingMix,
    { id: "easy", name: "Easy Ideas", title: "", labels: ["Coffee mug", "Houseplant", "Mushroom", "Sneaker", "Bicycle", "Lighthouse", "Backpack", "Cupcake", "Sunglasses", "Hot-air balloon", "Camera", "Cozy cabin"] },
    { id: "animals", name: "Animals", title: "", labels: ["Fox", "Owl", "Frog", "Octopus", "Whale", "Raccoon", "Penguin", "Axolotl", "Turtle", "Red panda", "Gecko", "Capybara"] },
    { id: "imagination", name: "Imagination", title: "", labels: ["Dragon working at a coffee shop", "Tiny city inside a bottle", "Astronaut gardening on the moon", "Ghost afraid of the dark", "Robot learning to paint", "Castle floating in the clouds", "Wizard stuck in traffic", "Monster doing laundry", "Pirate spaceship", "Library at the bottom of the ocean", "Alien visiting a grocery store", "Secret door inside a tree"] },
  ],
};

// Return fresh options so editing a wheel can never mutate a preset.
export function wheelFromPreset(preset: WheelPreset): WheelState {
  return { title: preset.title, options: preset.labels.map((label, id) => ({ id, label })) };
}
