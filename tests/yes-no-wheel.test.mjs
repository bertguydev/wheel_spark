import assert from "node:assert/strict";
import { test } from "node:test";
import { HOME_TOOL, FOOD_TOOL, YES_NO_TOOL, wheelFromPreset } from "../src/lib/wheel-tools.ts";
import { loadWheel } from "../src/lib/wheel-storage.ts";
import { initializeWheel, adoptWheel, persistWheelSession } from "../src/lib/wheel-session.ts";
import { createShareUrl } from "../src/lib/wheel-sharing.ts";
import { needsPresetConfirmation } from "../src/lib/preset-confirmation.ts";

function browser(context) {
  const values = new Map();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: {
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value),
  } } });
  context.after(() => { if (descriptor) Object.defineProperty(globalThis, "window", descriptor); else delete globalThis.window; });
  return values;
}

test("Yes/No starts with exactly two answers and all three tools persist independently", context => {
  const values = browser(context);
  assert.equal(YES_NO_TOOL.storageKey, "sparkywheel:wheel:yes-or-no-wheel");
  for (const tool of [HOME_TOOL, FOOD_TOOL]) persistWheelSession(adoptWheel(wheelFromPreset(tool.defaults)), tool);
  const before = new Map(values);
  const session = initializeWheel("https://sparkywheel.com/yes-or-no-wheel", YES_NO_TOOL);
  assert.deepEqual(session.wheel.options.map(o => o.label), ["Yes", "No"]);
  assert.equal(session.wheel.title, "");
  session.wheel.title = "Tonight?";
  session.wheel.options[1].label = "Stay home";
  persistWheelSession(adoptWheel(session.wheel), YES_NO_TOOL);
  assert.deepEqual(loadWheel(YES_NO_TOOL), session.wheel);
  for (const tool of [HOME_TOOL, FOOD_TOOL]) assert.equal(values.get(tool.storageKey), before.get(tool.storageKey));
  for (const tool of [HOME_TOOL, FOOD_TOOL]) persistWheelSession(adoptWheel({ ...wheelFromPreset(tool.defaults), title: "Changed" }), tool);
  assert.deepEqual(loadWheel(YES_NO_TOOL), session.wheel);
});

test("Yes/No shares retain route; viewing preserves every save and adoption writes only Yes/No", context => {
  const values = browser(context);
  for (const tool of [HOME_TOOL, FOOD_TOOL, YES_NO_TOOL]) persistWheelSession(adoptWheel(wheelFromPreset(tool.defaults)), tool);
  const before = new Map(values);
  const shared = { title: "Go out?", options: [{ id: 0, label: "Go" }, { id: 1, label: "Stay" }] };
  const link = createShareUrl(shared, "https://sparkywheel.com/yes-or-no-wheel?old=1#options");
  assert.ok(link.ok);
  assert.equal(new URL(link.url).pathname, "/yes-or-no-wheel");
  const session = initializeWheel(link.url, YES_NO_TOOL);
  assert.equal(session.source, "shared");
  assert.deepEqual(session.wheel, shared);
  persistWheelSession(session, YES_NO_TOOL);
  assert.deepEqual(values, before);
  persistWheelSession(adoptWheel({ ...session.wheel, title: "Our decision" }), YES_NO_TOOL);
  assert.equal(loadWheel(YES_NO_TOOL).title, "Our decision");
  for (const tool of [HOME_TOOL, FOOD_TOOL]) assert.equal(values.get(tool.storageKey), before.get(tool.storageKey));
});

test("Maybe mode and returning to Yes/No persist; customized choices require confirmation", context => {
  browser(context);
  const [standard, maybe] = YES_NO_TOOL.presets;
  assert.deepEqual(maybe.labels, ["Yes", "No", "Maybe"]);
  for (const preset of [maybe, standard]) {
    const wheel = wheelFromPreset(preset);
    assert.equal(needsPresetConfirmation(wheel, YES_NO_TOOL), false);
    persistWheelSession(adoptWheel(wheel), YES_NO_TOOL);
    assert.deepEqual(loadWheel(YES_NO_TOOL), wheel);
  }
  assert.equal(needsPresetConfirmation({ ...wheelFromPreset(standard), title: "Custom" }, YES_NO_TOOL), true);
  assert.equal(needsPresetConfirmation({ title: "", options: [{ id: 0, label: "A" }, { id: 1, label: "B" }] }, YES_NO_TOOL), true);
});

test("invalid data and denied storage retain Yes/No defaults", context => {
  const values = browser(context);
  values.set(YES_NO_TOOL.storageKey, "broken");
  assert.deepEqual(initializeWheel("https://sparkywheel.com/yes-or-no-wheel?wheel=invalid", YES_NO_TOOL).wheel, wheelFromPreset(YES_NO_TOOL.defaults));
  Object.defineProperty(window, "localStorage", { get() { throw Error("Denied"); } });
  assert.deepEqual(loadWheel(YES_NO_TOOL), wheelFromPreset(YES_NO_TOOL.defaults));
  assert.doesNotThrow(() => persistWheelSession(adoptWheel(wheelFromPreset(YES_NO_TOOL.defaults)), YES_NO_TOOL));
});

// Run against a built, running preview: SPARKYWHEEL_TEST_URL=http://localhost:3000 npm test
import { readFile } from "node:fs/promises";

test("Yes/No uses the shared experience and both tools remain linked", async () => {
  const page = await readFile(new URL("../src/app/yes-or-no-wheel/page.tsx", import.meta.url), "utf8");
  const navigation = await readFile(new URL("../src/components/ToolsNavigation.tsx", import.meta.url), "utf8");
  assert.match(page, /<WheelExperience tool=\{YES_NO_TOOL\}/);
  assert.match(navigation, /href="\/yes-or-no-wheel"/);
  assert.match(navigation, /href="\/food-wheel"/);
});

test("production HTML has crawlable content, metadata, canonical and tool links", { skip: !process.env.SPARKYWHEEL_TEST_URL }, async () => {
  for (const route of ["/", "/food-wheel", "/yes-or-no-wheel"]) {
    const response = await fetch(new URL(route, process.env.SPARKYWHEEL_TEST_URL));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /href="\/yes-or-no-wheel"/);
    assert.match(html, /href="\/food-wheel"/);
    if (route === "/yes-or-no-wheel") {
      assert.match(html, /<title>Yes or No Wheel – Random Yes or No Picker \| SparkyWheel<\/title>/);
      assert.match(html, /<link rel="canonical" href="https:\/\/sparkywheel.com\/yes-or-no-wheel"/);
      assert.match(html, /<meta property="og:url" content="https:\/\/sparkywheel.com\/yes-or-no-wheel"/);
      assert.match(html, /<meta name="description" content="Can&#x27;t decide\? Spin the SparkyWheel Yes or No Wheel/);
      assert.match(html, /name="twitter:card" content="summary"/);
      assert.match(html, /id="yes-no-random"/);
    }
  }
});
