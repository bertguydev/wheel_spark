export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 20;

export type WheelOption = { id: number; label: string };
export type WheelState = { title: string; options: WheelOption[] };
export type SpinAnimation = { from: number; to: number; duration: number };

export function validLabels(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length >= MIN_OPTIONS
    && value.length <= MAX_OPTIONS
    && value.every((label) => typeof label === "string" && label.trim().length > 0);
}

export function selectWinnerIndex(count: number): number {
  if (!Number.isInteger(count) || count < MIN_OPTIONS || count > MAX_OPTIONS) {
    throw new RangeError("The wheel requires between 2 and 20 options.");
  }
  // Reject the uneven tail of the uint32 range to avoid modulo bias.
  const range = 2 ** 32;
  const limit = range - (range % count);
  const sample = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(sample);
  } while (sample[0] >= limit);
  return sample[0] % count;
}

export function calculateRotation(current: number, winner: number, count: number) {
  const segmentAngle = 360 / count;
  // Segment zero starts at the top; the pointer must meet the winner's center.
  const target = (360 - (winner + 0.5) * segmentAngle) % 360;
  const normalized = ((current % 360) + 360) % 360;
  const remaining = (target - normalized + 360) % 360;
  return current + 5 * 360 + remaining;
}
