import assert from "node:assert/strict";
import { test } from "node:test";
import { needsPresetConfirmation } from "../src/lib/preset-confirmation.ts";
import { FOOD_TOOL, wheelFromPreset } from "../src/lib/wheel-tools.ts";

test("built-in presets, including restored session IDs, switch without confirmation", () => {
  for (const preset of FOOD_TOOL.presets) {
    const wheel = wheelFromPreset(preset);
    wheel.options.forEach((option, index) => { option.id = index + 100; });
    assert.equal(needsPresetConfirmation(wheel, FOOD_TOOL), false);
  }
});

test("custom titles, labels, order, additions and deletions require protection", () => {
  const changes = [
    w => { w.title = "My dinner"; },
    w => { w.options[0].label = "Soup"; },
    w => { w.options.reverse(); },
    w => { w.options.push({ id: 99, label: "Rice" }); },
    w => { w.options.pop(); },
    w => { w.options[0].label = ""; },
  ];
  for (const change of changes) {
    const wheel = wheelFromPreset(FOOD_TOOL.defaults);
    change(wheel);
    const before = structuredClone(wheel);
    assert.equal(needsPresetConfirmation(wheel, FOOD_TOOL), true);
    assert.deepEqual(wheel, before, "checking never changes custom data");
  }
});

test("reverting edits to the exact preset removes the warning", () => {
  const wheel = wheelFromPreset(FOOD_TOOL.defaults);
  wheel.options[0].label = "Soup";
  assert.equal(needsPresetConfirmation(wheel, FOOD_TOOL), true);
  wheel.options[0].label = FOOD_TOOL.defaults.labels[0];
  assert.equal(needsPresetConfirmation(wheel, FOOD_TOOL), false);
});
