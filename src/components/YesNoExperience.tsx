"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Wheel } from "@/components/Wheel";
import { ShareControls } from "@/components/ShareControls";
import { selectWinnerIndex, type SpinAnimation } from "@/lib/wheel";
import { createYesNoDecision, SPARKY_QUOTES, YES_NO_WHEEL, type Answer, type DecisionKind } from "@/lib/yes-no-decision";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function RandomQuote() {
  const [quote] = useState(() => {
    try { return SPARKY_QUOTES[selectWinnerIndex(SPARKY_QUOTES.length)]; }
    catch { return SPARKY_QUOTES[0]; }
  });
  return <>{quote}</>;
}

function DecisionQuote({ ready }: { ready: boolean }) {
  return <blockquote className="decision-quote"><p>“{ready ? <RandomQuote /> : SPARKY_QUOTES[0]}”</p><footer>— Sparky</footer></blockquote>;
}

export function YesNoExperience({ classroom }: { classroom: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [phase, setPhase] = useState<DecisionKind | null>(null);
  const [result, setResult] = useState<{ answer: Answer; sequence: number } | null>(null);
  const [spin, setSpin] = useState<SpinAnimation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const [decision] = useState(() => createYesNoDecision({
    onStart(kind, animation) {
      setPhase(kind);
      setError(null);
      if (animation) setSpin(animation);
    },
    onResult(answer) {
      setResult((previous) => ({ answer, sequence: (previous?.sequence ?? 0) + 1 }));
      setPhase(null);
    },
  }));
  useEffect(() => () => decision.cancel(), [decision]);
  const finishSpin = useCallback(() => decision.finishSpin(), [decision]);

  useEffect(() => {
    if (!result || !window.matchMedia("(max-width: 1023px)").matches) return;
    bubble.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [result]);

  function choose(kind: DecisionKind) {
    try { decision.choose(kind, window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch { setError("Unable to choose a secure random answer. Please try again."); }
  }

  const state = result?.answer.toLowerCase() ?? "init";
  const busy = phase !== null;
  // Enable interaction in the same render that selects this visit's quote.
  const disabled = busy || !hydrated;
  return (
    <div className="yes-no-experience">
      <section id="wheel" aria-label="Yes or No decision wheel" className="decision-wheel">
        <Wheel options={YES_NO_WHEEL.options} spin={spin} onFinish={finishSpin} />
        <div className="decision-actions">
          <button className="button button-primary" type="button" disabled={disabled} onClick={() => choose("spin")}>
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M6 3 17 10 6 17Z" fill="currentColor" /></svg>
            {phase === "spin" ? "Spinning…" : "Spin the Wheel"}<span className="spin-arrow" aria-hidden="true">→</span>
          </button>
          <button className="button button-secondary" type="button" disabled={disabled} onClick={() => choose("quick")}>
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m11 1-8 11h6l-1 7 9-11h-6Z" fill="currentColor" /></svg>
            Quick Answer
          </button>
        </div>
        {error && <p role="alert" className="status-message status-warning">{error}</p>}
      </section>
      <section className="sparky-card" aria-label="Sparky’s answer">
        <div className="sparky-response">
          <div ref={bubble} className="sparky-bubble" role="status" aria-live="polite" aria-atomic="true">
            <svg className="bubble-outline" aria-hidden="true" viewBox="0 0 300 145" preserveAspectRatio="none">
              <path className="bubble-outline-wide" d="M148 5C65 3 7 16 6 63C5 104 48 123 158 123H182L181 141Q204 136 211 120C263 110 291 93 292 62C293 21 248 4 148 5Z" />
              <path className="bubble-outline-compact" d="M150 6C65 3 15 15 14 59L5 83L25 81C43 110 86 127 158 126C253 127 292 109 293 65C296 22 248 6 150 6Z" />
            </svg>
            <span className="sr-only">{result ? `Answer ${result.sequence}. Sparky picked... ${result.answer.toUpperCase()}!` : "Ready when you are!"}</span>
            <div aria-hidden="true" className="bubble-content">
              {busy ? <><span className="answer-dots"><i /><i /><i /></span><span className="bubble-wait">{phase === "spin" ? "A little suspense…" : "A little spark…"}</span></> : result ? <><span className="bubble-label">Sparky picked...</span><strong className={`bubble-answer answer-${state}`}>{result.answer.toUpperCase()}!</strong></> : <strong className="bubble-ready">Ready when<br />you are!</strong>}
            </div>
          </div>
          <div className="sparky-art" aria-hidden="true">
            {(["init", "yes", "no"] as const).map((asset) => <Image key={asset} src={`/mascots/yes-no/sparky-${asset}.webp`} width={600} height={500} alt="" unoptimized loading="eager" className={asset === state ? "is-current" : ""} />)}
          </div>
        </div>
        <div className="sparky-share">
          <ShareControls wheel={YES_NO_WHEEL} disabled={disabled} label="Share This Wheel" />
          <p className="share-explanation">Share the wheel page. Every visit starts fresh.</p>
        </div>
        {classroom}
      </section>
      <DecisionQuote ready={hydrated} />
    </div>
  );
}
