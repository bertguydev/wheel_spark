import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { WheelState } from "@/lib/wheel";
import { createShareUrl } from "@/lib/wheel-sharing";
import { copyWheelLink, shareWheelLink } from "@/lib/share-actions";

export function ShareControls({ wheel, disabled, describedBy }: {
  wheel: WheelState;
  disabled: boolean;
  describedBy?: string;
}) {
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const statusId = useId();
  const linkId = useId();
  const focusLink = useCallback((input: HTMLInputElement | null) => {
    if (input) { input.focus(); input.select(); }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function share(copyOnly = false) {
    if (disabled || inFlight.current) return;
    if (timer.current) clearTimeout(timer.current);
    setMessage("");
    setManualUrl("");
    const generated = createShareUrl(wheel, window.location.href);
    if (!generated.ok) {
      setMessage(generated.message);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    const outcome = await (copyOnly
      ? copyWheelLink(generated.url, navigator)
      : shareWheelLink(generated.url, wheel.title, navigator));
    inFlight.current = false;
    if (!mounted.current) return;
    setBusy(false);
    if (outcome === "copied") {
      setMessage("Link copied!");
      timer.current = setTimeout(() => setMessage(""), 3000);
    } else if (outcome === "manual") {
      setManualUrl(generated.url);
      setMessage("Select the link below and copy it to share your wheel.");
    }
  }

  return (
    <div className="share-controls">
      <button className="button button-secondary share-button" type="button" disabled={disabled || busy} aria-describedby={describedBy ?? statusId} onClick={() => void share()}>
        {busy ? "Sharing…" : "Share"}
      </button>
      <p id={statusId} role="status" aria-live="polite" aria-atomic="true" className="share-status">{message}</p>
      {manualUrl && <div className="manual-share">
        <label htmlFor={linkId}>Share link</label>
        <input ref={focusLink} id={linkId} className="option-input" readOnly value={manualUrl} onFocus={(event) => event.currentTarget.select()} aria-describedby={statusId} />
        <button type="button" className="button button-secondary" disabled={disabled || busy} onClick={() => void share(true)}>Copy link</button>
      </div>}
    </div>
  );
}
