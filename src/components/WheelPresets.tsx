"use client";

import { useId, useRef, useState } from "react";
import { needsPresetConfirmation } from "@/lib/preset-confirmation";
import type { WheelState } from "@/lib/wheel";
import type { WheelPreset, WheelTool } from "@/lib/wheel-tools";

export function WheelPresets({ tool, wheel, disabled, onReplace }: {
  tool: WheelTool;
  wheel: WheelState;
  disabled: boolean;
  onReplace: (preset: WheelPreset) => void;
}) {
  const id = useId();
  const presetSelect = useRef<HTMLSelectElement>(null);
  const [selected, setSelected] = useState(tool.defaults.id);
  const [pending, setPending] = useState<WheelPreset | null>(null);
  const [notice, setNotice] = useState("");
  const presets = tool.presets ?? [];

  function apply(preset: WheelPreset) {
    if (disabled) return;
    onReplace(preset);
    setSelected(preset.id);
    setNotice(`${preset.name} loaded. Your wheel is ready to edit or spin.`);
    setPending(null);
    presetSelect.current?.focus();
  }

  function requestReplacement(preset: WheelPreset) {
    if (disabled) return;
    setNotice("");
    if (needsPresetConfirmation(wheel, tool)) setPending(preset);
    else apply(preset);
  }

  return (
    <div className="preset-panel">
      <fieldset disabled={disabled}>
        <legend>Start with a preset</legend>
        <p id={`${id}-help`} className="editor-help">Presets and Restore defaults replace this wheel&apos;s title and all choices. Your general wheel stays separate.</p>
        <label htmlFor={id} className="sr-only">Meal preset</label>
        <select ref={presetSelect} id={id} className="option-input" value={selected} aria-describedby={`${id}-help`} onChange={(event) => { setSelected(event.target.value); setPending(null); setNotice(""); }}>
          {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
        </select>
        <div className="preset-actions">
          <button type="button" className="button button-secondary" onClick={() => { requestReplacement(presets.find((preset) => preset.id === selected) ?? tool.defaults); }}>Use preset</button>
          <button type="button" className="button button-secondary" onClick={() => { requestReplacement(tool.defaults); }}>Restore defaults</button>
        </div>
        {pending && <div className="preset-confirm" role="group" aria-label="Confirm wheel replacement">
          <p>Replace your current title and choices with <strong>{pending.name}</strong>? This also replaces your saved wheel for this page.</p>
          <p className="preset-preview">{pending.labels.join(" · ")}</p>
          <div className="preset-actions">
            <button type="button" className="button button-primary" onClick={() => pending && apply(pending)}>Replace wheel</button>
            <button type="button" className="button button-secondary" onClick={() => { setPending(null); presetSelect.current?.focus(); }}>Cancel</button>
          </div>
        </div>}
      </fieldset>
      <p role="status" className="editor-help">{notice}</p>
    </div>
  );
}
