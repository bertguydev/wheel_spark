import assert from "node:assert/strict";
import { test } from "node:test";
import { HOME_TOOL, FOOD_TOOL, wheelFromPreset } from "../src/lib/wheel-tools.ts";
import { loadWheel, saveWheel } from "../src/lib/wheel-storage.ts";
import { initializeWheel, adoptWheel, persistWheelSession, clearSharedWheelUrl } from "../src/lib/wheel-session.ts";
import { createShareUrl } from "../src/lib/wheel-sharing.ts";
import { validLabels } from "../src/lib/wheel.ts";

function browser(context, records = []) {
  const values = new Map(records);
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    location: { href: "https://sparkywheel.com/food-wheel" },
    history: { state: null, replaceState: (_state, _unused, href) => { window.location.href = href; } },
  } });
  context.after(() => { if (original) Object.defineProperty(globalThis, "window", original); else delete globalThis.window; });
  return values;
}

test("new Food Wheel loads curated defaults without reading the homepage save", context => {
  const legacy = JSON.stringify({ version: 1, options: ["Alice", "Bob"] });
  const values = browser(context, [[HOME_TOOL.storageKey, legacy]]);
  assert.deepEqual(loadWheel(FOOD_TOOL), wheelFromPreset(FOOD_TOOL.defaults));
  assert.equal(loadWheel(FOOD_TOOL).options.length, 10);
  persistWheelSession(initializeWheel(window.location.href, FOOD_TOOL), FOOD_TOOL);
  assert.equal(values.get(HOME_TOOL.storageKey), legacy);
  assert.deepEqual(loadWheel().options.map(o => o.label), ["Alice", "Bob"]);
});

test("home V1 migration and Food customization persist independently in both directions", context => {
  browser(context, [[HOME_TOOL.storageKey, JSON.stringify({ version: 1, options: ["Alice", "Bob"] })]]);
  const food = { title: "Family favorites", options: [{ id: 4, label: "Soup" }, { id: 8, label: "Rice" }] };
  persistWheelSession(adoptWheel(food), FOOD_TOOL);
  const home = initializeWheel("https://sparkywheel.com/");
  persistWheelSession(home);
  assert.equal(loadWheel().title, "");
  assert.deepEqual(loadWheel().options.map(o => o.label), ["Alice", "Bob"]);
  assert.equal(loadWheel(FOOD_TOOL).title, food.title);
  assert.deepEqual(loadWheel(FOOD_TOOL).options.map(o => o.label), ["Soup", "Rice"]);
  saveWheel(home.wheel.options, "My people");
  assert.equal(loadWheel(FOOD_TOOL).title, food.title);
  saveWheel(food.options, "", FOOD_TOOL);
  assert.equal(loadWheel(FOOD_TOOL).title, "", "an intentionally blank title is not replaced by default");
  assert.equal(loadWheel().title, "My people");
});

test("all presets are valid; replacement and default restore only affect Food", context => {
  const values = browser(context);
  persistWheelSession(adoptWheel(wheelFromPreset(HOME_TOOL.defaults)));
  const home = values.get(HOME_TOOL.storageKey);
  for (const preset of [...FOOD_TOOL.presets, FOOD_TOOL.defaults]) {
    assert.ok(validLabels(preset.labels));
    const replacement = wheelFromPreset(preset);
    persistWheelSession(adoptWheel(replacement), FOOD_TOOL);
    assert.deepEqual(loadWheel(FOOD_TOOL), replacement);
    assert.equal(values.get(HOME_TOOL.storageKey), home);
    replacement.options[0].label = "Edited";
    assert.notEqual(wheelFromPreset(preset).options[0].label, "Edited");
  }
  assert.deepEqual(loadWheel(FOOD_TOOL), wheelFromPreset(FOOD_TOOL.defaults));
});

test("Food share retains route, viewing preserves saves, and adoption writes only Food", context => {
  const values = browser(context);
  persistWheelSession(adoptWheel(wheelFromPreset(HOME_TOOL.defaults)));
  persistWheelSession(adoptWheel(wheelFromPreset(FOOD_TOOL.defaults)), FOOD_TOOL);
  const before = new Map(values);
  const shared = wheelFromPreset(FOOD_TOOL.presets[1]);
  const link = createShareUrl(shared, "https://sparkywheel.com/food-wheel?old=1#options");
  assert.equal(link.ok, true);
  assert.equal(new URL(link.url).pathname, "/food-wheel");
  window.location.href = link.url + "&keep=1#options";
  const session = initializeWheel(window.location.href, FOOD_TOOL);
  assert.equal(session.source, "shared");
  assert.deepEqual(session.wheel, shared);
  persistWheelSession(session, FOOD_TOOL);
  assert.deepEqual(values, before);
  session.wheel.title = "Our takeout";
  persistWheelSession(adoptWheel(session.wheel), FOOD_TOOL);
  clearSharedWheelUrl();
  assert.equal(window.location.href, "https://sparkywheel.com/food-wheel?keep=1#options");
  assert.equal(loadWheel(FOOD_TOOL).title, "Our takeout");
  assert.equal(values.get(HOME_TOOL.storageKey), before.get(HOME_TOOL.storageKey));
});

test("invalid Food shares and records fall back within the Food namespace", context => {
  browser(context, [[FOOD_TOOL.storageKey, "{broken"], [HOME_TOOL.storageKey, JSON.stringify({ version: 2, title: "Home", options: ["A", "B"] })]]);
  assert.deepEqual(initializeWheel("https://sparkywheel.com/food-wheel?wheel=invalid", FOOD_TOOL).wheel, wheelFromPreset(FOOD_TOOL.defaults));
  persistWheelSession(adoptWheel(wheelFromPreset(FOOD_TOOL.presets[2])), FOOD_TOOL);
  const saved = loadWheel(FOOD_TOOL);
  saveWheel([{ id: 0, label: "" }, { id: 1, label: "B" }], "Draft", FOOD_TOOL);
  assert.deepEqual(loadWheel(FOOD_TOOL), saved);
  assert.equal(loadWheel().title, "Home");
});

test("Food still loads and can be edited when browser storage is blocked", context => {
  browser(context);
  Object.defineProperty(window, "localStorage", { get() { throw new Error("Denied"); } });
  const food = loadWheel(FOOD_TOOL);
  assert.deepEqual(food, wheelFromPreset(FOOD_TOOL.defaults));
  food.options[0].label = "My meal";
  assert.doesNotThrow(() => persistWheelSession(adoptWheel(food), FOOD_TOOL));
});
