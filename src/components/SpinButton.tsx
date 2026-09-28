export function SpinButton({ spinning, disabled, describedBy, onSpin, hasResult }: {
  spinning: boolean;
  disabled: boolean;
  describedBy?: string;
  onSpin: () => void;
  hasResult: boolean;
}) {
  return (
    <button type="button" onClick={onSpin} disabled={disabled} aria-describedby={describedBy} className="button button-primary">
      {spinning ? "Spinning…" : hasResult ? "Spin again" : "Spin the Wheel"}
      {!spinning && <span aria-hidden="true">→</span>}
    </button>
  );
}
