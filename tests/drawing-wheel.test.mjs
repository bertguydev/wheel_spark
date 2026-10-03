import assert from "node:assert/strict";
import { test } from "node:test";
import { HOME_TOOL, FOOD_TOOL, YES_NO_TOOL, DRAWING_TOOL, wheelFromPreset } from "../src/lib/wheel-tools.ts";
import { loadWheel, saveWheel } from "../src/lib/wheel-storage.ts";
import { initializeWheel, adoptWheel, persistWheelSession, clearSharedWheelUrl } from "../src/lib/wheel-session.ts";
import { createShareUrl } from "../src/lib/wheel-sharing.ts";
import { needsPresetConfirmation } from "../src/lib/preset-confirmation.ts";
import { validLabels } from "../src/lib/wheel.ts";
import { readFile } from "node:fs/promises";

const otherTools = [HOME_TOOL, FOOD_TOOL, YES_NO_TOOL];
const labels = wheel => wheel.options.map(option => option.label);
function browser(context) {
  const values = new Map();
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    location: { href: "https://sparkywheel.com/drawing-ideas-wheel" },
    history: { state: null, replaceState: (_state, _unused, href) => { window.location.href = href; } },
  } });
  context.after(() => { if (original) Object.defineProperty(globalThis, "window", original); else delete globalThis.window; });
  for (const tool of otherTools) persistWheelSession(adoptWheel({ ...wheelFromPreset(tool.defaults), title: `Saved ${tool.storageKey}` }), tool);
  return values;
}

function assertOtherSaves(values, before) {
  for (const tool of otherTools) assert.equal(values.get(tool.storageKey), before.get(tool.storageKey));
}

test("Drawing starts with 14 curated prompts and its own storage key", context => {
  const values = browser(context);
  const before = new Map(values);
  assert.equal(DRAWING_TOOL.storageKey, "sparkywheel:wheel:drawing-ideas-wheel");
  const session = initializeWheel(window.location.href, DRAWING_TOOL);
  assert.deepEqual(session.wheel, wheelFromPreset(DRAWING_TOOL.defaults));
  assert.equal(session.wheel.options.length, 14);
  assert.ok(labels(session.wheel).includes("Frog wearing a crown"));
  assert.ok(labels(session.wheel).includes("Robot cooking dinner"));
  assert.equal(new Set(labels(session.wheel)).size, 14);
  persistWheelSession(session, DRAWING_TOOL);
  assertOtherSaves(values, before);
});

test("all Drawing collections load and persist; Restore defaults restores only Drawing", context => {
  const values = browser(context);
  const before = new Map(values);
  assert.deepEqual(DRAWING_TOOL.presets.map(preset => preset.name), ["Creative Mix", "Easy Ideas", "Animals", "Imagination"]);
  for (const preset of [...DRAWING_TOOL.presets, DRAWING_TOOL.defaults]) {
    assert.ok(validLabels(preset.labels));
    assert.equal(new Set(preset.labels).size, preset.labels.length);
    const replacement = wheelFromPreset(preset);
    assert.equal(needsPresetConfirmation(replacement, DRAWING_TOOL), false);
    persistWheelSession(adoptWheel(replacement), DRAWING_TOOL);
    assert.deepEqual(loadWheel(DRAWING_TOOL), replacement);
    assertOtherSaves(values, before);
    replacement.options[0].label = "Custom prompt";
    assert.notEqual(wheelFromPreset(preset).options[0].label, "Custom prompt");
  }
  assert.deepEqual(loadWheel(DRAWING_TOOL), wheelFromPreset(DRAWING_TOOL.defaults));
});

test("custom prompts and titles persist with four-way isolation and replacement protection", context => {
  const values = browser(context);
  const before = new Map(values);
  const wheel = wheelFromPreset(DRAWING_TOOL.presets[3]);
  wheel.title = "Sketchbook challenge";
  wheel.options[0].label = "A dragon running a tiny cafe on the moon";
  assert.equal(needsPresetConfirmation(wheel, DRAWING_TOOL), true);
  persistWheelSession(adoptWheel(wheel), DRAWING_TOOL);
  assert.deepEqual(loadWheel(DRAWING_TOOL), wheel);
  // Requesting/cancelling replacement must leave the persisted wheel untouched.
  const saved = values.get(DRAWING_TOOL.storageKey);
  needsPresetConfirmation(wheel, DRAWING_TOOL);
  assert.equal(values.get(DRAWING_TOOL.storageKey), saved);
  assertOtherSaves(values, before);
  for (const tool of otherTools) saveWheel(wheelFromPreset(tool.defaults).options, "Changed elsewhere", tool);
  assert.deepEqual(loadWheel(DRAWING_TOOL), wheel);
});

test("Drawing share retains route and full prompts; viewing never writes, adoption only saves Drawing", context => {
  const values = browser(context);
  persistWheelSession(adoptWheel(wheelFromPreset(DRAWING_TOOL.defaults)), DRAWING_TOOL);
  const before = new Map(values);
  const shared = wheelFromPreset(DRAWING_TOOL.presets[3]);
  shared.title = "Our art night";
  const link = createShareUrl(shared, "https://sparkywheel.com/drawing-ideas-wheel?old=1#options");
  assert.ok(link.ok);
  assert.equal(new URL(link.url).pathname, "/drawing-ideas-wheel");
  window.location.href = link.url + "&keep=1#options";
  const session = initializeWheel(window.location.href, DRAWING_TOOL);
  assert.equal(session.source, "shared");
  assert.deepEqual(session.wheel, shared);
  persistWheelSession(session, DRAWING_TOOL);
  assert.deepEqual(values, before);
  session.wheel.options[0].label = "Robot learning to paint a dragon";
  persistWheelSession(adoptWheel(session.wheel), DRAWING_TOOL);
  clearSharedWheelUrl();
  assert.equal(window.location.href, "https://sparkywheel.com/drawing-ideas-wheel?keep=1#options");
  assert.deepEqual(loadWheel(DRAWING_TOOL), session.wheel);
  assertOtherSaves(values, before);
});

test("Drawing invalid records, invalid shares, blank drafts and denied storage stay safe", context => {
  const values = browser(context);
  values.set(DRAWING_TOOL.storageKey, "{broken");
  assert.deepEqual(initializeWheel(window.location.href + "?wheel=invalid", DRAWING_TOOL).wheel, wheelFromPreset(DRAWING_TOOL.defaults));
  const session = initializeWheel(window.location.href, DRAWING_TOOL);
  persistWheelSession(session, DRAWING_TOOL);
  const saved = loadWheel(DRAWING_TOOL);
  saveWheel([{ id: 0, label: "" }, { id: 1, label: "Valid" }], "Draft", DRAWING_TOOL);
  assert.deepEqual(loadWheel(DRAWING_TOOL), saved);
  Object.defineProperty(window, "localStorage", { get() { throw Error("Denied"); } });
  assert.deepEqual(loadWheel(DRAWING_TOOL), wheelFromPreset(DRAWING_TOOL.defaults));
  assert.doesNotThrow(() => persistWheelSession(session, DRAWING_TOOL));
});

test("Drawing uses the existing wheel experience and Tools links all specialized routes", async () => {
  const page = await readFile(new URL("../src/app/drawing-ideas-wheel/page.tsx", import.meta.url), "utf8");
  const nav = await readFile(new URL("../src/components/ToolsNavigation.tsx", import.meta.url), "utf8");
  assert.match(page, /<WheelExperience tool=\{DRAWING_TOOL\}/);
  for (const route of ["food-wheel", "yes-or-no-wheel", "drawing-ideas-wheel"]) assert.ok(nav.includes(`href="/${route}"`));
});

test("built Drawing route has crawlable content, metadata and canonical; all pages link to it", { skip: !process.env.SPARKYWHEEL_TEST_URL }, async () => {
  for (const route of ["/", "/food-wheel", "/yes-or-no-wheel", "/drawing-ideas-wheel"]) {
    const response = await fetch(new URL(route, process.env.SPARKYWHEEL_TEST_URL));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /href="\/drawing-ideas-wheel"/);
    if (route === "/drawing-ideas-wheel") {
      assert.match(html, /<title>Drawing Ideas Wheel – What Should I Draw\? \| SparkyWheel<\/title>/);
      assert.match(html, /<link rel="canonical" href="https:\/\/sparkywheel.com\/drawing-ideas-wheel"/);
      assert.match(html, /<meta property="og:url" content="https:\/\/sparkywheel.com\/drawing-ideas-wheel"/);
      assert.match(html, /<meta name="description" content="Not sure what to draw\? Spin the SparkyWheel Drawing Ideas Wheel/);
      assert.match(html, /name="twitter:card" content="summary"/);
      assert.match(html, /id="drawing-interpret"/);
      assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    }
  }
});
