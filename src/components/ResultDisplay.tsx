import { SparkAccent, StatusIcon } from "@/components/Brand";
import { Mascot } from "@/components/Mascot";

export function ResultDisplay({ result, spinning, validationMessage, statusId, answerSequence }: {
  result: string | null;
  spinning: boolean;
  validationMessage: string | null;
  statusId: string;
  answerSequence?: number;
}) {
  return (
    <div id={statusId} role="status" aria-live="polite" aria-atomic="true" className="status-wrap">
      {validationMessage ? <><Mascot state="confused" /><p className="status-message status-warning"><StatusIcon warning />{validationMessage}</p></> : spinning ? <p className="status-message text-brand-muted">A little suspense… choosing your option.</p> : result !== null ? (
        <div className="result-panel">
          {answerSequence !== undefined && <span className="sr-only">Answer {answerSequence}. </span>}
          <Mascot state="celebrating" />
          <SparkAccent className="result-sparks h-7 w-7" />
          <p className="result-label">Sparky picked...</p>
          <p className="result-winner">{result}</p>
        </div>
      ) : <p className="status-message status-ready"><StatusIcon />Ready when you are!</p>}
    </div>
  );
}
