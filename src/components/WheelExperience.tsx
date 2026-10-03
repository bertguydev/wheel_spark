"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Mascot } from "@/components/Mascot";
import { Wheel } from "@/components/Wheel";
import { WheelEditor } from "@/components/WheelEditor";
import { SpinButton } from "@/components/SpinButton";
import { ResultDisplay } from "@/components/ResultDisplay";
import { ShareControls } from "@/components/ShareControls";
import { WheelPresets } from "@/components/WheelPresets";
import { HOME_TOOL, wheelFromPreset, type WheelPreset, type WheelTool } from "@/lib/wheel-tools";
import { calculateRotation, selectWinnerIndex, MAX_OPTIONS, MIN_OPTIONS, type SpinAnimation, type WheelState } from "@/lib/wheel";
import { adoptWheel, clearSharedWheelUrl, initializeWheel, persistWheelSession } from "@/lib/wheel-session";

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function WheelExperience({ tool = HOME_TOOL }: { tool?: WheelTool }) {
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  // The server and first client render agree. Only the working area waits for
  // browser storage; the surrounding page remains server-rendered.
  if (!hydrated) {
    return <div className="min-h-[570px]" aria-busy="true"><p role="status" className="status-message text-brand-muted">Loading your wheel…</p></div>;
  }
  return <RestoredWheelExperience key={tool.storageKey} tool={tool} />;
}

function RestoredWheelExperience({ tool }: { tool: WheelTool }) {
  const [session, setSession] = useState(() => initializeWheel(window.location.href, tool));
  const { options, title } = session.wheel;
  const [shareRevision, setShareRevision] = useState(0);
  useEffect(() => { persistWheelSession(session, tool); }, [session, tool]);
  const [spin, setSpin] = useState<SpinAnimation | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const validationId = useId();
  const hasBlank = options.some((option) => !option.label.trim());
  const validationMessage = hasBlank
    ? "Enter a name for every option before spinning. Names cannot be blank or contain only spaces."
    : null;
  const locked = useRef(false);
  const nextId = useRef(options.length);
  const pendingWinner = useRef<string | null>(null);
  const wheelArea = useRef<HTMLElement>(null);
  const editorArea = useRef<HTMLElement>(null);

  function changeWheel(wheel: WheelState) {
    setSession(adoptWheel(wheel));
    setShareRevision((revision) => revision + 1);
    clearSharedWheelUrl();
  }

  function editTitle(value: string) {
    if (locked.current || value === title) return;
    changeWheel({ title: value, options });
  }

  function replaceWithPreset(preset: WheelPreset) {
    if (locked.current) return;
    const wheel = wheelFromPreset(preset);
    nextId.current = wheel.options.length;
    pendingWinner.current = null;
    setSpin(null);
    setResult(null);
    setError(null);
    changeWheel(wheel);
  }

  function navigateTo(area: HTMLElement | null) {
    if (!area) return;
    // Explicit navigation moves the reading/tab position without opening a
    // mobile keyboard. Focus itself must not interrupt the controlled scroll.
    area.focus({ preventScroll: true });
    area.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }

  const finishSpin = useCallback(() => {
    setResult(pendingWinner.current);
    setSpinning(false);
    locked.current = false;
  }, []);

  function spinWheel() {
    if (locked.current || hasBlank) return;
    locked.current = true;
    try {
      const winner = selectWinnerIndex(options.length);
      const from = spin?.to ?? 0;
      pendingWinner.current = options[winner].label.trim();
      setResult(null);
      setError(null);
      setSpinning(true);
      setSpin({
        from,
        to: calculateRotation(from, winner, options.length),
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 4800,
      });
    } catch {
      locked.current = false;
      setError("Unable to start a secure random spin. Please try again in a modern browser.");
    }
  }

  function editOption(id: number, label: string) {
    if (locked.current || !options.some((option) => option.id === id && option.label !== label)) return;
    changeWheel({ title, options: options.map((option) => option.id === id ? { ...option, label } : option) });
    setResult(null);
  }

  function addOption() {
    if (locked.current || options.length >= MAX_OPTIONS) return null;
    const id = nextId.current++;
    changeWheel({ title, options: [...options, { id, label: `Option ${options.length + 1}` }] });
    setResult(null);
    return id;
  }

  function deleteOption(id: number) {
    if (locked.current || options.length <= MIN_OPTIONS) return;
    changeWheel({ title, options: options.filter((option) => option.id !== id) });
    setResult(null);
  }

  return (
    <div className="experience">
      <section id="wheel" ref={wheelArea} tabIndex={-1} aria-label="Spin the decision wheel" className="wheel-stage navigation-target">
        <Mascot state="default" />
        {title.trim() && <h2 className="wheel-title">{title.trim()}</h2>}
        <Wheel options={options} spin={spin} onFinish={finishSpin} />
        <div className={`wheel-feedback${result !== null ? " has-result" : ""}`}>
          <ResultDisplay result={result} spinning={spinning} validationMessage={validationMessage} statusId={validationId} />
          <div className="spin-actions">
            <SpinButton hasResult={result !== null} spinning={spinning} disabled={spinning || hasBlank} describedBy={hasBlank ? validationId : undefined} onSpin={spinWheel} />
            {result !== null && <button className="button button-secondary" type="button" onClick={() => navigateTo(editorArea.current)}>Edit options</button>}
            <ShareControls key={shareRevision} wheel={session.wheel} disabled={spinning || hasBlank} describedBy={hasBlank ? validationId : undefined} />
          </div>
        </div>
        {error && <p role="alert" className="status-message status-warning mt-3">{error}</p>}
      </section>
      <WheelEditor titlePlaceholder={tool.modeControls ? "What should I decide?" : undefined} presets={tool.presets && <WheelPresets tool={tool} wheel={session.wheel} disabled={spinning} onReplace={replaceWithPreset} />} title={title} onTitleChange={editTitle} areaRef={editorArea} onDone={() => navigateTo(wheelArea.current)} validationId={validationId} options={options} disabled={spinning} onEdit={editOption} onAdd={addOption} onDelete={deleteOption} />
    </div>
  );
}
