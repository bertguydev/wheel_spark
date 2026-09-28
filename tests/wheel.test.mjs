import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateRotation, selectWinnerIndex } from "../src/lib/wheel.ts";

test("every segment lands at the top after at least five turns", () => {
  for (let count = 2; count <= 20; count++) {
    for (let winner = 0; winner < count; winner++) {
      for (const current of [0, 1927.5, 12543.25]) {
        const rotation = calculateRotation(current, winner, count);
        assert.ok(rotation - current >= 1800);
        assert.ok(rotation - current < 2160);
        const center = (winner + 0.5) * (360 / count);
        const landing = (center + rotation) % 360;
        assert.ok(Math.min(landing, 360 - landing) < 1e-8);
      }
    }
  }
});

test("random selection rejects the biased tail before mapping a sample", (context) => {
  const samples = [0xffffffff, 8];
  const random = context.mock.method(globalThis.crypto, "getRandomValues", (buffer) => {
    buffer[0] = samples.shift();
    return buffer;
  });
  assert.equal(selectWinnerIndex(6), 2);
  assert.equal(random.mock.callCount(), 2);
});

test("random selection can reach each option for all supported counts", (context) => {
  let sample = 0;
  context.mock.method(globalThis.crypto, "getRandomValues", (buffer) => {
    buffer[0] = sample;
    return buffer;
  });
  for (let count = 2; count <= 20; count++) {
    for (sample = 0; sample < count; sample++) {
      assert.equal(selectWinnerIndex(count), sample);
    }
  }
});

test("invalid option counts are rejected", () => {
  for (const count of [0, 1, 21, 2.5, NaN]) {
    assert.throws(() => selectWinnerIndex(count), RangeError);
  }
});
