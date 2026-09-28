import { useRef, type Ref } from "react";
import { MAX_OPTIONS, MIN_OPTIONS, type WheelOption } from "@/lib/wheel";

export function WheelEditor({ title, onTitleChange, options, disabled, onEdit, onAdd, onDelete, validationId, areaRef, onDone }: {
  title: string;
  onTitleChange: (title: string) => void;
  areaRef: Ref<HTMLElement>;
  onDone: () => void;
  options: WheelOption[];
  disabled: boolean;
  onEdit: (id: number, label: string) => void;
  onAdd: () => number | null;
  validationId: string;
  onDelete: (id: number) => void;
}) {
  const pendingFocusId = useRef<number | null>(null);
  return (
    <section id="options" ref={areaRef} tabIndex={-1} className="editor-panel navigation-target" aria-labelledby="options-heading">
      <div className="editor-heading">
        <h2 id="options-heading" >Your options</h2>
        <span className="count-badge">{options.length} / {MAX_OPTIONS} options</span>
      </div>
      <fieldset disabled={disabled} className="min-w-0">
        <legend className="sr-only">Edit wheel options</legend>
        <div className="title-field">
          <label htmlFor="wheel-title" className="title-label">Wheel title <span>(optional)</span></label>
          <input id="wheel-title" className="option-input" value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="What should we eat tonight?" />
        </div>
        <div className="space-y-2.5">
          {options.map((option, index) => (
            <div key={option.id} className="option-row">
              <label htmlFor={`option-${option.id}`} className="option-number">
                <span className="sr-only">Option </span>{index + 1}
              </label>
              <input ref={(input) => {
                if (input && pendingFocusId.current === option.id) {
                  pendingFocusId.current = null;
                  input.focus();
                  input.select();
                }
              }} id={`option-${option.id}`} value={option.label} onChange={(event) => onEdit(option.id, event.target.value)} aria-invalid={!option.label.trim()} aria-describedby={!option.label.trim() ? validationId : "options-help"} className="option-input" />
              <button type="button" onClick={() => onDelete(option.id)} disabled={options.length <= MIN_OPTIONS} aria-label={`Delete option ${index + 1}`} className="button-remove"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m7 7 10 10M17 7 7 17" /></svg></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => { pendingFocusId.current = onAdd(); }} disabled={options.length >= MAX_OPTIONS} className="button button-secondary mt-5 w-full"><span aria-hidden="true">+</span> Add option</button>
      </fieldset>
      <p id="options-help" className="editor-help">
        Add between 2 and 20 options. Each has an equal chance.
      </p>
      <button type="button" className="button button-secondary done-editing" onClick={onDone}>Done editing</button>
    </section>
  );
}
