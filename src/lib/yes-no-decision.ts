import { calculateRotation, selectWinnerIndex, type SpinAnimation, type WheelState } from "./wheel.ts";

// This page deliberately does not restore custom options, shared payloads or results.
export const YES_NO_WHEEL: WheelState = {
  title: "",
  options: [{ id: 0, label: "Yes" }, { id: 1, label: "No" }],
};
export const QUICK_ANSWER_DELAY = 300;
export const SPARKY_QUOTES = [
  "Sometimes the hardest part of a decision is making one.",
  "Two choices. One wheel. Zero overthinking.",
  "When in doubt, let Sparky sort it out.",
  "Big decisions deserve thought. Little decisions deserve a spin.",
  "Not every decision needs a committee meeting.",
  "A little randomness can break a big stalemate.",
  "When both choices look good, give chance a turn.",
  "The wheel won’t make you wiser, but it might get you moving.",
] as const;
export type Answer = "Yes" | "No";
export type DecisionKind = "spin" | "quick";

// A synchronous lock protects both actions, including clicks before React renders.
// Selection happens once; completion reveals that same answer, never re-rolls it.
export function createYesNoDecision(callbacks: {
  onStart: (kind: DecisionKind, animation: SpinAnimation | null) => void;
  onResult: (answer: Answer) => void;
}) {
  let pending: { kind: DecisionKind; answer: Answer } | null = null;
  let rotation = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function finish() {
    if (!pending) return;
    const { answer } = pending;
    pending = null;
    timer = null;
    callbacks.onResult(answer);
  }

  return {
    choose(kind: DecisionKind, reducedMotion: boolean) {
      if (pending) return false;
      const winner = selectWinnerIndex(2);
      pending = { kind, answer: winner === 0 ? "Yes" : "No" };
      if (kind === "quick") {
        callbacks.onStart(kind, null);
        timer = setTimeout(finish, QUICK_ANSWER_DELAY);
      } else {
        const from = rotation;
        rotation = calculateRotation(from, winner, 2);
        callbacks.onStart(kind, { from, to: rotation, duration: reducedMotion ? 0 : 4800 });
      }
      return true;
    },
    finishSpin() {
      if (pending?.kind === "spin") finish();
    },
    cancel() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      pending = null;
    },
  };
}
