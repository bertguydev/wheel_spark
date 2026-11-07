import type { WheelState } from "./wheel.ts";
import type { WheelPreset, WheelTool } from "./wheel-tools.ts";

// Compare durable content, not session IDs, so restored presets behave the same.
export function findActivePreset(wheel: WheelState, tool: WheelTool): WheelPreset | undefined {
  return [tool.defaults, ...(tool.presets ?? [])].find((preset) =>
    wheel.title === preset.title &&
    wheel.options.length === preset.labels.length &&
    wheel.options.every((option, index) => option.label === preset.labels[index])
  );
}

export function needsPresetConfirmation(wheel: WheelState, tool: WheelTool): boolean {
  return !findActivePreset(wheel, tool);
}
