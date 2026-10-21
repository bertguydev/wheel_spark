import assert from "node:assert/strict";
import { test } from "node:test";
import { createYesNoDecision, QUICK_ANSWER_DELAY, YES_NO_WHEEL } from "../src/lib/yes-no-decision.ts";
import { createShareUrl, sharedWheelFromUrl } from "../src/lib/wheel-sharing.ts";

function setup(context, samples) {
  const random = context.mock.method(globalThis.crypto, "getRandomValues", buffer => {
    assert.ok(samples.length, "unexpected extra random selection");
    buffer[0] = samples.shift();
    return buffer;
  });
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const starts = [], results = [];
  const decision = createYesNoDecision({ onStart: (kind, spin) => starts.push({ kind, spin }), onResult: answer => results.push(answer) });
  return { decision, starts, results, random };
}

test("Quick Answer waits 300ms, blocks conflicting clicks, and samples exactly once", context => {
  const { decision, starts, results, random } = setup(context, [0]);
  assert.equal(decision.choose("quick", false), true);
  assert.deepEqual(starts, [{ kind: "quick", spin: null }]);
  assert.equal(decision.choose("quick", false), false);
  assert.equal(decision.choose("spin", false), false);
  decision.finishSpin(); // An old wheel callback cannot finish a pending quick answer.
  context.mock.timers.tick(QUICK_ANSWER_DELAY - 1);
  assert.deepEqual(results, []);
  context.mock.timers.tick(1);
  assert.deepEqual(results, ["Yes"]);
  assert.equal(random.mock.callCount(), 1);
});

test("consecutive identical answers complete independently, including reduced motion", context => {
  const { decision, results, random } = setup(context, [1, 1]);
  for (let i = 0; i < 2; i++) {
    decision.choose("quick", true);
    context.mock.timers.tick(QUICK_ANSWER_DELAY);
  }
  assert.deepEqual(results, ["No", "No"]);
  assert.equal(random.mock.callCount(), 2);
});

test("animated spin locks Quick Answer and reveals the answer under the pointer", context => {
  const { decision, starts, results, random } = setup(context, [0, 1]);
  for (const [index, reduced] of [[0, false], [1, true]]) {
    assert.equal(decision.choose("spin", reduced), true);
    assert.equal(decision.choose("quick", reduced), false);
    context.mock.timers.tick(6000); // Spin completion belongs to the animation, not a timer.
    assert.equal(results.length, index);
    const spin = starts[index].spin;
    assert.equal(spin.duration, reduced ? 0 : 4800);
    assert.equal((spin.to + (index + .5) * 180) % 360, 0);
    if (index) assert.equal(spin.from, starts[index - 1].spin.to);
    decision.finishSpin();
    decision.finishSpin(); // Duplicate completion must not publish a second result.
    assert.equal(results.length, index + 1);
  }
  assert.deepEqual(results, ["Yes", "No"]);
  assert.equal(random.mock.callCount(), 2);
});

test("unmount cancellation prevents a delayed result", context => {
  const { decision, results } = setup(context, [0]);
  decision.choose("quick", false);
  decision.cancel();
  context.mock.timers.tick(1000);
  decision.finishSpin();
  assert.deepEqual(results, []);
});

test("random-source failure does not lock out a retry", context => {
  let calls = 0;
  context.mock.method(globalThis.crypto, "getRandomValues", buffer => {
    if (calls++ === 0) throw Error("Denied");
    buffer[0] = 1;
    return buffer;
  });
  const results = [];
  const decision = createYesNoDecision({ onStart() {}, onResult: answer => results.push(answer) });
  assert.throws(() => decision.choose("spin", false), /Denied/);
  assert.equal(decision.choose("spin", false), true);
  decision.finishSpin();
  assert.deepEqual(results, ["No"]);
});

test("fixed-wheel sharing retains the route, contains only Yes/No and never includes a result", () => {
  const share = createShareUrl(YES_NO_WHEEL, "https://sparkywheel.com/yes-or-no-wheel?wheel=old#result");
  assert.ok(share.ok);
  assert.equal(new URL(share.url).pathname, "/yes-or-no-wheel");
  assert.deepEqual(sharedWheelFromUrl(share.url), YES_NO_WHEEL);
  assert.equal(new URL(share.url).hash, "");
  assert.deepEqual(YES_NO_WHEEL.options.map(option => option.label), ["Yes", "No"]);
});
