import { useEffect, useMemo, useRef, useState } from "react";
import { CODE_SNIPPETS, QUOTES, WORDS } from "../../content/typing";
import { type Keystroke, statsFor, recordTest, bestTestWpm } from "../../engine/typing";
import { useTyping } from "./store";
import TypingArena from "./TypingArena";
import Results from "./Results";
import Icon from "../Icon";

type Mode = "time" | "words" | "quote" | "code";
interface Config {
  mode: Mode;
  amount: number; // seconds for time, word count for words
  punctuation: boolean;
  numbers: boolean;
  codeLang: "python" | "javascript";
}

const TIME_OPTS = [15, 30, 60, 120];
const WORD_OPTS = [10, 25, 50, 100];
const COMMON = WORDS.filter((w) => w.length <= 7 && /^[a-z]+$/.test(w));

function randWord(): string {
  return COMMON[Math.floor(Math.random() * COMMON.length)];
}

function buildWords(count: number, punctuation: boolean, numbers: boolean): string {
  const out: string[] = [];
  let capitaliseNext = punctuation;
  for (let i = 0; i < count; i++) {
    let w = randWord();
    if (numbers && Math.random() < 0.12) w = String(Math.floor(Math.random() * 900) + 10);
    if (capitaliseNext) {
      w = w.charAt(0).toUpperCase() + w.slice(1);
      capitaliseNext = false;
    }
    if (punctuation && Math.random() < 0.18) {
      const mark = [",", ".", ".", "?", "!", ";"][Math.floor(Math.random() * 6)];
      w += mark;
      if (mark === "." || mark === "?" || mark === "!") capitaliseNext = true;
    }
    out.push(w);
  }
  return out.join(" ");
}

function makeText(cfg: Config): string {
  if (cfg.mode === "quote") return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  if (cfg.mode === "code") {
    const bank = CODE_SNIPPETS[cfg.codeLang];
    return Array.from({ length: 4 }, () => bank[Math.floor(Math.random() * bank.length)]).join(" ");
  }
  // time mode gets a generous buffer; the clock ends it, not the text.
  const count = cfg.mode === "words" ? cfg.amount : 80;
  return buildWords(count, cfg.punctuation, cfg.numbers);
}

/** Running WPM sampled once per second, for the results graph. */
function wpmSeries(strokes: Keystroke[]): number[] {
  if (strokes.length < 2) return [];
  const series: number[] = [];
  let t = 0;
  let correct = 0;
  let nextMark = 1000;
  for (const s of strokes) {
    t += s.dt;
    if (s.correct) correct += 1;
    while (t >= nextMark) {
      series.push((correct / 5) / (nextMark / 60000));
      nextMark += 1000;
    }
  }
  return series;
}

export default function SpeedTest() {
  const { typing, commit } = useTyping();
  const [cfg, setCfg] = useState<Config>({
    mode: "time",
    amount: 30,
    punctuation: false,
    numbers: false,
    codeLang: "python",
  });
  const [nonce, setNonce] = useState(0);
  const text = useMemo(() => makeText(cfg), [cfg, nonce]);

  const [live, setLive] = useState<Keystroke[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<Keystroke[] | null>(null);
  const liveRef = useRef<Keystroke[]>([]);
  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => stopTimer(), []);

  const restart = () => {
    stopTimer();
    setNonce((n) => n + 1);
    setLive([]);
    liveRef.current = [];
    setRemaining(cfg.mode === "time" ? cfg.amount : null);
    setFinished(false);
    setResult(null);
  };

  const finish = (strokes: Keystroke[]) => {
    stopTimer();
    setResult(strokes);
    setFinished(true);
    const stats = statsFor(strokes);
    commit((draft) => {
      recordTest(draft, {
        mode: cfg.mode === "time" ? `time-${cfg.amount}` : cfg.mode === "words" ? `words-${cfg.amount}` : cfg.mode,
        wpm: stats.wpm,
        raw: stats.raw,
        accuracy: stats.accuracy,
        consistency: stats.consistency,
        at: Date.now(),
      });
    });
  };

  const onStart = () => {
    if (cfg.mode !== "time") return;
    setRemaining(cfg.amount);
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r === null) return r;
        if (r <= 1) {
          stopTimer();
          finish(liveRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const setMode = (mode: Mode) => {
    const amount = mode === "time" ? 30 : mode === "words" ? 25 : 0;
    setCfg((c) => ({ ...c, mode, amount }));
    setNonce((n) => n + 1);
    setFinished(false);
    setResult(null);
    setLive([]);
    liveRef.current = [];
  };

  const stats = statsFor(finished && result ? result : live);
  const best = bestTestWpm(typing);

  return (
    <div className="type-page">
      <div className="type-test-head">
        <h1>Speed test</h1>
        {best > 0 ? <span className="type-best">Best {Math.round(best)} wpm</span> : null}
      </div>

      <div className="type-test-bar">
        <div className="seg">
          {(["time", "words", "quote", "code"] as Mode[]).map((m) => (
            <button key={m} className={cfg.mode === m ? "on" : ""} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>

        {cfg.mode === "time" || cfg.mode === "words" ? (
          <>
            <div className="seg">
              {(cfg.mode === "time" ? TIME_OPTS : WORD_OPTS).map((n) => (
                <button
                  key={n}
                  className={cfg.amount === n ? "on" : ""}
                  onClick={() => {
                    setCfg((c) => ({ ...c, amount: n }));
                    restart();
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="seg">
              <button className={cfg.punctuation ? "on" : ""} onClick={() => { setCfg((c) => ({ ...c, punctuation: !c.punctuation })); restart(); }}>
                punctuation
              </button>
              <button className={cfg.numbers ? "on" : ""} onClick={() => { setCfg((c) => ({ ...c, numbers: !c.numbers })); restart(); }}>
                numbers
              </button>
            </div>
          </>
        ) : null}

        {cfg.mode === "code" ? (
          <div className="seg">
            {(["python", "javascript"] as const).map((l) => (
              <button key={l} className={cfg.codeLang === l ? "on" : ""} onClick={() => { setCfg((c) => ({ ...c, codeLang: l })); restart(); }}>
                {l}
              </button>
            ))}
          </div>
        ) : null}

        <button className="ghost small type-restart" onClick={restart} title="Restart (Tab)">
          <Icon name="refresh" size={15} /> Restart
        </button>
      </div>

      {!finished ? (
        <>
          <div className="type-test-live">
            {cfg.mode === "time" ? (
              <span className="type-count">{remaining ?? cfg.amount}</span>
            ) : (
              <span className="type-count">{Math.round(stats.wpm)}<i>wpm</i></span>
            )}
          </div>
          <TypingArena
            key={`test-${nonce}-${cfg.mode}-${cfg.amount}`}
            text={text}
            onStart={onStart}
            onStroke={(s) => { liveRef.current = s; setLive(s); }}
            onComplete={(s) => finish(s)}
            onRestart={restart}
          />
          <div className="type-hint-strip">
            <span className="dim tiny">Tab restarts · space between words · errors count even if fixed</span>
          </div>
        </>
      ) : (
        <Results stats={stats} series={wpmSeries(result ?? [])}>
          <button className="primary" onClick={restart}>
            <Icon name="refresh" size={15} /> Next test
          </button>
        </Results>
      )}
    </div>
  );
}
