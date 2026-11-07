"use client";

import { useId, useRef } from "react";
import { DRAWING_AGES, DRAWING_DURATIONS, type DrawingAge, type DrawingMinutes, type DrawingSettings, type getDrawingChallenge } from "@/lib/drawing-challenges";
import styles from "./DrawingClassroom.module.css";

export function DrawingClassroomSettings({ settings, onChange }: {
  settings: DrawingSettings;
  onChange: (settings: DrawingSettings) => void;
}) {
  return (
    <fieldset className={styles.settings}>
      <legend>Classroom settings</legend>
      <div className={styles.fields}>
        <label>
          Age group
          <select className="option-input" value={settings.age} onChange={(event) => onChange({ ...settings, age: event.target.value as DrawingAge })}>
            {DRAWING_AGES.map((age) => <option key={age} value={age}>Ages {age}</option>)}
          </select>
        </label>
        <label>
          Suggested activity duration
          <select className="option-input" value={settings.minutes} onChange={(event) => onChange({ ...settings, minutes: Number(event.target.value) as DrawingMinutes })}>
            {DRAWING_DURATIONS.map(({ minutes, name }) => <option key={minutes} value={minutes}>{minutes} minutes · {name}</option>)}
          </select>
        </label>
      </div>
      <p>Age and time only change the drawing directions.</p>
    </fieldset>
  );
}

type Challenge = ReturnType<typeof getDrawingChallenge>;

export function DrawingChallengeDetails({ challenge, id }: { challenge: Challenge; id?: string }) {
  return (
    <div id={id} className={styles.details}>
      <p className={styles.instructions}>{challenge.instructions}</p>
      <p className={styles.duration}>Suggested activity duration: {challenge.duration.minutes} minutes · {challenge.duration.name}</p>
      <p className={styles.timeTip}>{challenge.timeTip}</p>
    </div>
  );
}

export function DrawingClassroomDisplay({ prompt, challenge }: { prompt: string; challenge: Challenge }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);

  function openDisplay() {
    dialog.current?.showModal();
    if (content.current) content.current.scrollTop = 0;
    exit.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <button ref={trigger} type="button" className="button button-secondary" aria-haspopup="dialog" onClick={openDisplay}>Classroom display</button>
      <dialog
        ref={dialog}
        className={styles.display}
        aria-labelledby={`${id}-label ${id}-prompt`}
        aria-describedby={`${id}-details`}
        onClose={() => trigger.current?.focus({ preventScroll: true })}
      >
        <div className={styles.displayHeader}>
          <p id={`${id}-label`}>Classroom display</p>
          <button ref={exit} type="button" className="button button-secondary" onClick={() => dialog.current?.close()}>Exit classroom display</button>
        </div>
        <div ref={content} className={styles.displayContent} tabIndex={0} role="region" aria-label="Drawing challenge">
          <div className={styles.displayCard}>
            <h2 id={`${id}-prompt`}>{prompt}</h2>
            <DrawingChallengeDetails challenge={challenge} id={`${id}-details`} />
          </div>
        </div>
      </dialog>
    </>
  );
}
