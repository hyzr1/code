import { useMemo, useState } from "react";
import {
  LESSONS,
  LESSON_BY_ID,
  SHIFT_BASE,
  allowedKeysFor,
  generateDrill,
  lessonIndex,
  type Char,
} from "../../content/typing";
import {
  type Keystroke,
  statsFor,
  recordRun,
  weakestKeys,
} from "../../engine/typing";
import { useTyping } from "./store";
import TypingArena from "./TypingArena";
import Keyboard, { nextFingerColor } from "./Keyboard";
import Results from "./Results";
import Icon from "../Icon";

function baseAllowed(lessonId: string): Set<Char> {
  const set = new Set<Char>();
  for (const c of allowedKeysFor(lessonId)) {
    set.add(SHIFT_BASE[c] ?? c.toLowerCase());
  }
  for (const h of ["a", "s", "d", "f", "j", "k", "l", ";"]) set.add(h);
  return set;
}

function starsFor(accuracy: number, wpm: number, targetAcc: number, targetWpm: number): number {
  let s = 1;
  if (accuracy >= targetAcc) s = 2;
  if (accuracy >= targetAcc && wpm >= targetWpm) s = 3;
  return s;
}

export default function TypeLesson({
  lessonId,
  onExit,
  onOpenLesson,
}: {
  lessonId: string;
  onExit: () => void;
  onOpenLesson: (id: string) => void;
}) {
  const { typing, commit } = useTyping();
  const lesson = LESSON_BY_ID.get(lessonId);

  const [nonce, setNonce] = useState(0);
  const lines = useMemo(
    () => (lesson ? generateDrill(lesson, typing) : []),
    // Regenerate only on explicit retry (nonce) or lesson change, not on every
    // keystroke-driven typing update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lessonId, nonce],
  );

  const [lineIdx, setLineIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [current, setCurrent] = useState<Keystroke[]>([]);
  const [done, setDone] = useState<Keystroke[][]>([]);
  const [finished, setFinished] = useState(false);

  if (!lesson) return <div className="empty">No such lesson.</div>;

  const allStrokes = [...done.flat(), ...current];
  const live = statsFor(allStrokes);
  const currentLine = lines[lineIdx] ?? "";
  const nextChar = finished ? null : (currentLine[pos] ?? null);
  const allowed = baseAllowed(lessonId);
  const fingerColor = nextFingerColor(nextChar);

  const restart = () => {
    setNonce((n) => n + 1);
    setLineIdx(0);
    setPos(0);
    setCurrent([]);
    setDone([]);
    setFinished(false);
  };

  const onLineComplete = (strokes: Keystroke[]) => {
    const nextDone = [...done, strokes];
    if (lineIdx + 1 < lines.length) {
      setDone(nextDone);
      setCurrent([]);
      setPos(0);
      setLineIdx(lineIdx + 1);
    } else {
      const all = nextDone.flat();
      const stats = statsFor(all);
      const stars = starsFor(stats.accuracy, stats.wpm, lesson.targetAccuracy, lesson.targetWpm);
      commit((draft) => {
        recordRun(draft, all);
        const rec = (draft.lessons[lessonId] ??= {
          bestWpm: 0,
          bestAccuracy: 0,
          stars: 0,
          completedAt: null,
          attempts: 0,
        });
        rec.attempts += 1;
        rec.bestWpm = Math.max(rec.bestWpm, stats.wpm);
        rec.bestAccuracy = Math.max(rec.bestAccuracy, stats.accuracy);
        rec.stars = Math.max(rec.stars, stars);
        rec.completedAt = rec.completedAt ?? Date.now();
      });
      setDone(nextDone);
      setCurrent([]);
      setFinished(true);
    }
  };

  const idx = lessonIndex(lessonId);
  const nextLesson = LESSONS[idx + 1];
  const finalStats = statsFor(done.flat());
  const weak = weakestKeys(typing, allowedKeysFor(lessonId), 5);

  return (
    <div className="type-page">
      <div className="type-lesson-head">
        <button className="ghost small" onClick={onExit}>
          <Icon name="arrowLeft" size={15} /> Course
        </button>
        <div className="type-lesson-title">
          <h1>{lesson.title}</h1>
          <p className="dim">{lesson.goal}</p>
        </div>
        <div className="type-live" aria-live="polite">
          <span><b>{Math.round(live.wpm)}</b> wpm</span>
          <span><b>{Math.round(live.accuracy * 100)}</b>% acc</span>
        </div>
      </div>

      {!finished ? (
        <>
          <div className="type-tip">
            <Icon name="info" size={15} />
            <span>{lesson.tip}</span>
          </div>

          <div className="type-progress-dots">
            {lines.map((_, i) => (
              <i key={i} className={i < lineIdx ? "on" : i === lineIdx ? "cur" : ""} />
            ))}
          </div>

          <TypingArena
            key={`${lessonId}-${nonce}-${lineIdx}`}
            text={currentLine}
            onStart={() => setPos(0)}
            onStroke={(_, p) => setPos(p)}
            onComplete={onLineComplete}
            onRestart={restart}
          />

          <div className="type-hint-strip">
            {fingerColor ? (
              <span className="type-finger-hint">
                <i style={{ background: fingerColor }} /> next finger
              </span>
            ) : null}
            <span className="dim tiny">Tab restarts · don't look down · accuracy first</span>
          </div>

          <Keyboard nextChar={nextChar} allowed={allowed} />
        </>
      ) : (
        <Results stats={finalStats}>
          <button className="ghost" onClick={restart}>
            <Icon name="refresh" size={15} /> Again
          </button>
          {weak.length ? (
            <span className="type-weak">
              Focus keys:{" "}
              {weak.map((k) => (
                <kbd key={k}>{k === " " ? "␣" : k}</kbd>
              ))}
            </span>
          ) : null}
          {nextLesson ? (
            <button className="primary" onClick={() => onOpenLesson(nextLesson.id)}>
              Next: {nextLesson.title} <Icon name="arrowRight" size={15} />
            </button>
          ) : (
            <button className="primary" onClick={onExit}>
              Finish <Icon name="check" size={15} />
            </button>
          )}
        </Results>
      )}
    </div>
  );
}
