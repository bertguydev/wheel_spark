import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createShareUrl, decodeWheel, encodeWheel, fromSharePayload, isSharePayload,
  MAX_ENCODED_SHARE_LENGTH, MAX_SHARE_TITLE_LENGTH, sharedWheelFromUrl, toSharePayload, withoutSharedWheel,
} from "../src/lib/wheel-sharing.ts";
import { adoptWheel, clearSharedWheelUrl, initializeWheel, persistWheelSession } from "../src/lib/wheel-session.ts";
import { WHEEL_STORAGE_KEY } from "../src/lib/wheel-storage.ts";
import { calculateRotation, selectWinnerIndex } from "../src/lib/wheel.ts";
import { copyWheelLink, shareWheelLink } from "../src/lib/share-actions.ts";

const state = (title = "What should we eat?", labels = ["Pizza", "Tacos", "Sushi"]) => ({ title, options: labels.map((label, id) => ({ id, label })) });
const packed = (payload) => Buffer.from(JSON.stringify(payload)).toString("base64url");
const linked = (wheel, base = "https://preview.example/") => {
  const result = createShareUrl(wheel, base);
  assert.equal(result.ok, true);
  return result.url;
};

function mockBrowser(context, saved = null) {
  const values = new Map(saved === null ? [] : [[WHEEL_STORAGE_KEY, saved]]);
  const writes = [];
  const replacements = [];
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  const browser = {
    location: { href: linked(state()) + "#options" },
    history: { state: { preserved: true }, replaceState(...args) { replacements.push(args); browser.location.href = args[2]; } },
    localStorage: {
      getItem(key) { return values.get(key) ?? null; },
      setItem(key, value) { writes.push(value); values.set(key, value); },
    },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, "window", descriptor);
    else delete globalThis.window;
  });
  return { values, writes, replacements, browser };
}

test("round trip explicitly keeps durable configuration only, with fresh session IDs", () => {
  const original = { ...state(), version: 2, winner: "Pizza", rotation: 900, spinning: true };
  original.options[0].id = 42;
  const payload = toSharePayload(original);
  assert.deepEqual(payload, { v: 1, t: "What should we eat?", o: ["Pizza", "Tacos", "Sushi"] });
  assert.deepEqual(fromSharePayload(payload), state());
  const encoded = encodeWheel(original);
  assert.equal(encoded.ok, true);
  assert.match(encoded.data, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeWheel(encoded.data), state());
});

test("Unicode, emoji, punctuation, duplicates and exact whitespace round trip", () => {
  for (const wheel of [
    state("Movie Night 🎬", ["Spirited Away", "Wall-E 🤖", "Amélie", "千と千尋", "🍕 Pizza"]),
    state("  Who's first? & + / # % =  ", [" A ", "A", "A", "<b>plain text</b>"]),
    state("", ["Yes", "No"]),
    state("\ud800", ["\udfff", "OK"]),
  ]) assert.deepEqual(sharedWheelFromUrl(linked(wheel)), wheel);
});

test("generation uses development, preview or deployment origin and path", () => {
  for (const base of ["http://localhost:3000/", "https://preview.example/app/", "https://sparkywheel.com/"]) {
    const url = new URL(linked(state(), base + "?wheel=old&tracking=remove#options"));
    assert.equal(url.origin + url.pathname, base.replace(/\/$/, "") + "/");
    assert.deepEqual([...url.searchParams.keys()], ["wheel"]);
    assert.equal(url.hash, "");
  }
  assert.equal(createShareUrl(state(), "bad URL").ok, false);
  assert.equal(createShareUrl(state(), "javascript:alert(1)").ok, false);
});

test("malformed encoding, JSON, invalid UTF-8 and oversized input are rejected", () => {
  for (const value of ["", "a", "!!!!", "%zz", "a+b/", "e30=", "Zh", "_w", Buffer.from("{bad").toString("base64url"), "A".repeat(MAX_ENCODED_SHARE_LENGTH + 1)]) {
    assert.equal(decodeWheel(value), null, value.slice(0, 40));
  }
});

test("untrusted share payload schema is strictly validated", () => {
  for (const value of [null, [], true, 42, "text", {},
    { v: 2, t: "Title", o: ["A", "B"] }, { v: "1", t: "Title", o: ["A", "B"] },
    { v: 1, o: ["A", "B"] }, { v: 1, t: null, o: ["A", "B"] },
    { v: 1, t: 42, o: ["A", "B"] }, { v: 1, t: [], o: ["A", "B"] },
    { v: 1, t: "T".repeat(MAX_SHARE_TITLE_LENGTH + 1), o: ["A", "B"] },
    { v: 1, t: "Title" }, { v: 1, t: "Title", o: "A,B" },
    ...[[], ["A"], Array(21).fill("A"), ["A", 2], ["A", null], ["A", {}], ["A", ""], ["A", " \t\n"]].map((o) => ({ v: 1, t: "Title", o })),
  ]) {
    assert.equal(isSharePayload(value), false);
    assert.equal(decodeWheel(packed(value)), null);
  }
});

test("title, option count and exact encoded size boundaries", () => {
  for (const count of [2, 20]) assert.deepEqual(sharedWheelFromUrl(linked(state("T".repeat(200), Array(count).fill("A")))), state("T".repeat(200), Array(count).fill("A")));
  assert.equal(encodeWheel(state("T".repeat(201))).ok, false);
  assert.equal(encodeWheel(state("", ["A", " "])).ok, false);
  const overhead = JSON.stringify({ v: 1, t: "", o: ["", "B"] }).length;
  const boundary = state("", ["A".repeat(MAX_ENCODED_SHARE_LENGTH * 3 / 4 - overhead), "B"]);
  const encoded = encodeWheel(boundary);
  assert.equal(encoded.ok, true);
  assert.equal(encoded.data.length, MAX_ENCODED_SHARE_LENGTH);
  assert.deepEqual(decodeWheel(encoded.data), boundary);
  boundary.options[0].label += "A";
  assert.equal(encodeWheel(boundary).ok, false);
  assert.equal(encodeWheel(state("", ["🍕".repeat(5000), "B"])).ok, false);
});

test("URL parser rejects empty, duplicate, corrupt and huge query parameters", () => {
  for (const url of ["bad", "https://example/", "https://example/?wheel=", "https://example/?wheel=%ZZ", "https://example/?wheel=" + "A".repeat(20_000), linked(state()) + "&wheel=" + encodeWheel(state()).data]) {
    assert.equal(sharedWheelFromUrl(url), null);
  }
});

test("valid URL takes precedence without reading or writing recipient storage", (context) => {
  const { browser, writes } = mockBrowser(context);
  browser.localStorage.getItem = () => { throw new Error("must not read storage for shared wheel"); };
  const session = initializeWheel(linked(state()));
  assert.equal(session.source, "shared");
  assert.deepEqual(session.wheel, state());
  persistWheelSession(session);
  assert.deepEqual(writes, []);
});

test("missing or invalid URL restores local wheel; missing or invalid storage uses defaults", (context) => {
  const local = { version: 2, title: "My Dinner Wheel", options: ["Thai", "Soup"] };
  const { values } = mockBrowser(context, JSON.stringify(local));
  for (const href of ["https://example/", "https://example/?wheel=bad"]) {
    assert.deepEqual(initializeWheel(href), { source: "local", wheel: state(local.title, local.options) });
    for (const stored of [null, "{bad"]) {
      if (stored === null) values.delete(WHEEL_STORAGE_KEY);
      else values.set(WHEEL_STORAGE_KEY, stored);
      const session = initializeWheel(href);
      assert.equal(session.source, "local");
      assert.equal(session.wheel.title, "");
      assert.deepEqual(session.wheel.options.map((option) => option.label), ["Pizza", "Tacos", "Burgers", "Sushi", "Thai", "Pasta"]);
    }
    values.set(WHEEL_STORAGE_KEY, JSON.stringify(local));
  }
});

test("view, repeated spins and resharing do not overwrite recipient V1 storage", (context) => {
  const saved = JSON.stringify({ version: 1, options: ["Thai", "Soup"] });
  const { values, writes } = mockBrowser(context, saved);
  const session = initializeWheel(linked(state()));
  persistWheelSession(session);
  for (let spin = 0; spin < 3; spin++) {
    calculateRotation(0, selectWinnerIndex(session.wheel.options.length), session.wheel.options.length);
    persistWheelSession(session);
  }
  assert.deepEqual(sharedWheelFromUrl(linked(session.wheel)), session.wheel);
  assert.equal(values.get(WHEEL_STORAGE_KEY), saved);
  assert.deepEqual(writes, []);
  assert.deepEqual(initializeWheel("https://example/").wheel, state("", ["Thai", "Soup"]));
});

test("configuration adoption persists edits and removes just the share parameter without reload", (context) => {
  const { values, browser, replacements } = mockBrowser(context, JSON.stringify({ version: 2, title: "Original", options: ["A", "B"] }));
  const original = initializeWheel(browser.location.href);
  const modifications = [
    { ...original.wheel, title: "My variation" },
    { ...original.wheel, options: [{ id: 0, label: "Changed" }, ...original.wheel.options.slice(1)] },
    { ...original.wheel, options: [...original.wheel.options, { id: 3, label: "Extra" }] },
    { ...original.wheel, options: original.wheel.options.slice(1) },
  ];
  for (const wheel of modifications) {
    browser.location.href = linked(original.wheel) + "&keep=yes#options";
    const adopted = adoptWheel(wheel);
    assert.equal(adopted.source, "local");
    clearSharedWheelUrl();
    persistWheelSession(adopted);
    assert.deepEqual(JSON.parse(values.get(WHEEL_STORAGE_KEY)), { version: 2, title: wheel.title, options: wheel.options.map((option) => option.label) });
    assert.equal(browser.location.href, "https://preview.example/?keep=yes#options");
    assert.equal(replacements.at(-1)[0], browser.history.state);
    assert.equal(initializeWheel(browser.location.href).wheel.title, wheel.title);
  }
  assert.equal(replacements.length, 4);
  clearSharedWheelUrl();
  assert.equal(replacements.length, 4);
});

test("invalid draft adoption preserves last usable save until corrected", (context) => {
  const saved = JSON.stringify({ version: 2, title: "Original", options: ["A", "B"] });
  const { values } = mockBrowser(context, saved);
  persistWheelSession(adoptWheel(state("Draft", ["A", ""])));
  assert.equal(values.get(WHEEL_STORAGE_KEY), saved);
  persistWheelSession(adoptWheel(state("Draft", ["A", "Fixed"])));
  assert.equal(JSON.parse(values.get(WHEEL_STORAGE_KEY)).title, "Draft");
});

test("History API failure does not block adoption or persistence", (context) => {
  const { browser, values } = mockBrowser(context);
  browser.history.replaceState = () => { throw new Error("Blocked"); };
  assert.doesNotThrow(clearSharedWheelUrl);
  persistWheelSession(adoptWheel(state()));
  assert.equal(JSON.parse(values.get(WHEEL_STORAGE_KEY)).title, state().title);
  assert.equal(withoutSharedWheel("https://example/?x=1&wheel=abc&wheel=def#options"), "https://example/?x=1#options");
  assert.equal(withoutSharedWheel("https://example/?x=hello%20world#options"), "https://example/?x=hello%20world#options");
});

test("native sharing uses current title and URL with sensible untitled fallback", async () => {
  const calls = [];
  const browser = { share: async (data) => { calls.push(data); }, clipboard: { writeText: async () => { throw new Error("must not copy"); } } };
  assert.equal(await shareWheelLink("https://example/?wheel=abc", "Movie Night 🎬", browser), "shared");
  assert.deepEqual(calls[0], { title: "Movie Night 🎬", text: "Give my SparkyWheel a spin!", url: "https://example/?wheel=abc" });
  await shareWheelLink("https://example/", "   ", browser);
  assert.equal(calls[1].title, "SparkyWheel");
});

test("native cancellation is quiet and never silently copies", async () => {
  let copied = false;
  const browser = { share: async () => { throw new DOMException("Cancelled", "AbortError"); }, clipboard: { writeText: async () => { copied = true; } } };
  assert.equal(await shareWheelLink("url", "Title", browser), "cancelled");
  assert.equal(copied, false);
});

test("native unavailability or failure falls back to successful clipboard copy", async () => {
  for (const share of [undefined, async () => { throw new Error("Denied"); }]) {
    let copied;
    assert.equal(await shareWheelLink("current-url", "Title", { share, clipboard: { writeText: async (url) => { copied = url; } } }), "copied");
    assert.equal(copied, "current-url");
  }
});

test("clipboard unavailable, denied or throwing access all allow manual copying", async () => {
  for (const browser of [{}, { clipboard: { writeText: async () => { throw new Error("Denied"); } } }, { get clipboard() { throw new Error("Denied access"); } }]) {
    assert.equal(await copyWheelLink("url", browser), "manual");
    assert.equal(await shareWheelLink("url", "Title", browser), "manual");
  }
});
