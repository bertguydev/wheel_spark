import type { WheelState } from "./wheel.ts";
import type { WheelTool } from "./wheel-tools.ts";

// Compare durable content, not session IDs, so restored presets behave the same.
export function needsPresetConfirmation(wheel: WheelState, tool: WheelTool): boolean {
  return ![tool.defaults, ...(tool.presets ?? [])].some((preset) =>
    wheel.title === preset.title &&
    wheel.options.length === preset.labels.length &&
    wheel.options.every((option, index) => option.label === preset.labels[index])
  );
}
