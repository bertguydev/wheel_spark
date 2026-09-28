import assert from "node:assert/strict";
import { test } from "node:test";
import { loadWheel, parseStoredWheel, saveWheel, WHEEL_STORAGE_KEY } from "../src/lib/wheel-storage.ts";

const loadWheelOptions = () => loadWheel().options;
const saveWheelOptions = (options) => saveWheel(options, "");
const defaults = ["Pizza", "Tacos", "Burgers", "Sushi", "Thai", "Pasta"];
const record = (options, version = 1) => JSON.stringify({ version, options });
const wheel = (labels) => labels.map((label, id) => ({ id, label }));

test("V1 parsing migrates without changing labels; V2 supports optional titles", () => {
  const options = [" A ", "日本語", " A "];
  assert.deepEqual(parseStoredWheel(record(options)), { version: 2, title: "", options });
  for (const title of ["Movie Night", "  Café 🍕  ", "", "  ", "<script>alert(1)</script>"]) {
    assert.deepEqual(parseStoredWheel(JSON.stringify({ version: 2, title, options })), { version: 2, title: title.trim(), options });
  }
  assert.equal(parseStoredWheel(record(options, 2)).title, "");
  for (const title of [null, 42, [], {}]) {
    assert.equal(parseStoredWheel(JSON.stringify({ version: 2, title, options })), null);
  }
});

test("titles persist, rename and clear independently of wheel options", (context) => {
  const { writes } = browserStorage(context, record(["A", "B"]));
  const restored = loadWheel();
  assert.equal(restored.title, "");
  for (const title of ["Movie Night", "  Team Picker  ", "   "]) {
    saveWheel(restored.options, title);
    assert.deepEqual(loadWheel(), { title: title.trim(), options: restored.options });
  }
  const count = writes.length;
  saveWheel(restored.options, "");
  assert.equal(writes.length, count);
});

test("a failed migration write leaves V1 intact and can be retried", (context) => {
  const original = record(["A", "B"]);
  const { storage, values } = browserStorage(context, original);
  const restored = loadWheel();
  const setItem = storage.setItem;
  storage.setItem = () => { throw new Error("QuotaExceededError"); };
  assert.doesNotThrow(() => saveWheel(restored.options, restored.title));
  assert.equal(values.get(WHEEL_STORAGE_KEY), original);
  storage.setItem = setItem;
  saveWheel(restored.options, restored.title);
  assert.deepEqual(JSON.parse(values.get(WHEEL_STORAGE_KEY)), { version: 2, title: "", options: ["A", "B"] });
});

function browserStorage(context, initial = null) {
  const values = new Map(initial === null ? [] : [[WHEEL_STORAGE_KEY, initial]]);
  const writes = [];
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { writes.push([key, value]); values.set(key, value); },
  };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, "window", descriptor);
    else delete globalThis.window;
  });
  return { storage, writes, values };
}

test("first visit restores the unchanged defaults and saves a versioned record", (context) => {
  const { values } = browserStorage(context);
  const options = loadWheelOptions();
  assert.deepEqual(options, wheel(defaults));
  saveWheelOptions(options);
  assert.deepEqual(JSON.parse(values.get(WHEEL_STORAGE_KEY)), { version: 2, title: "", options: defaults });
});

test("restore preserves labels, order, duplicates, Unicode, and whitespace", (context) => {
  const labels = ["  Café 🍕  ", "日本語", "日本語"];
  const { writes } = browserStorage(context, record(labels));
  const restored = loadWheelOptions();
  assert.deepEqual(restored, wheel(labels));
  saveWheelOptions(restored);
  assert.equal(writes.length, 1, "V1 migrates once");
  saveWheelOptions(restored);
  assert.equal(writes.length, 1);
});

test("parser rejects corrupt, unsupported, out-of-range, and blank configurations", () => {
  for (const raw of [
    null, "{broken", "null", "[]", "{}", "true", "42", '"text"',
    record(["A", "B"], 3), record(["A", "B"], "1"),
    record("A,B"), record(["A", 2]), record(["A", null]),
    record(["A", {}]), record([]), record(["A"]),
    record(Array(21).fill("A")), record(["A", ""]), record(["A", " \t\n"]),
  ]) assert.equal(parseStoredWheel(raw), null, String(raw));
  for (const count of [2, 20]) {
    assert.equal(parseStoredWheel(record(Array(count).fill("A"))).options.length, count);
  }
});

test("invalid saved data falls back safely and can be replaced with defaults", (context) => {
  const { values } = browserStorage(context, "{broken");
  const options = loadWheelOptions();
  assert.deepEqual(options, wheel(defaults));
  saveWheelOptions(options);
  assert.deepEqual(JSON.parse(values.get(WHEEL_STORAGE_KEY)), { version: 2, title: "", options: defaults });
});

test("edits, additions, and deletions survive loading into a new session", (context) => {
  browserStorage(context, record(defaults));
  const edited = loadWheelOptions();
  edited[0].label = "Salad";
  saveWheelOptions(edited);
  assert.equal(loadWheelOptions()[0].label, "Salad");
  edited.push({ id: 91, label: "Soup" });
  saveWheelOptions(edited);
  assert.equal(loadWheelOptions().at(-1).label, "Soup");
  edited.splice(1, 1);
  saveWheelOptions(edited);
  assert.deepEqual(loadWheelOptions(), wheel(edited.map(({ label }) => label)));
});

test("temporary invalid edits retain the last valid record and valid recovery saves", (context) => {
  const saved = record(["A", "B"]);
  const { values, writes } = browserStorage(context, saved);
  for (const labels of [["A", ""], ["A", "   "], ["A"], Array(21).fill("A")]) {
    saveWheelOptions(wheel(labels));
    assert.equal(values.get(WHEEL_STORAGE_KEY), saved);
  }
  assert.equal(writes.length, 0);
  saveWheelOptions(wheel(["A", "Changed"]));
  assert.equal(loadWheelOptions()[1].label, "Changed");
});

test("only labels are persisted and unchanged configurations do not write again", (context) => {
  const { values, writes } = browserStorage(context);
  const options = wheel(["A", "B"]).map((option) => ({ ...option, winner: true, rotation: 500 }));
  saveWheelOptions(options);
  saveWheelOptions(options);
  assert.equal(writes.length, 1);
  assert.deepEqual(JSON.parse(values.get(WHEEL_STORAGE_KEY)), { version: 2, title: "", options: ["A", "B"] });
});

test("denied localStorage property access is harmless", (context) => {
  browserStorage(context);
  Object.defineProperty(window, "localStorage", { get() { throw new Error("SecurityError"); } });
  assert.deepEqual(loadWheelOptions(), wheel(defaults));
  assert.doesNotThrow(() => saveWheelOptions(wheel(["A", "B"])));
});

test("failed storage reads fall back without throwing", (context) => {
  const { storage } = browserStorage(context);
  storage.getItem = () => { throw new Error("Read denied"); };
  assert.deepEqual(loadWheelOptions(), wheel(defaults));
  assert.doesNotThrow(() => saveWheelOptions(wheel(["A", "B"])));
});

test("quota failure does not change in-memory options or prevent a later save", (context) => {
  const { storage } = browserStorage(context);
  const working = wheel(["A", "B"]);
  const setItem = storage.setItem;
  storage.setItem = () => { throw new Error("QuotaExceededError"); };
  assert.doesNotThrow(() => saveWheelOptions(working));
  assert.deepEqual(working, wheel(["A", "B"]));
  storage.setItem = setItem;
  saveWheelOptions(working);
  assert.deepEqual(loadWheelOptions(), working);
});
