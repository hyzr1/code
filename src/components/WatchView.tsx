import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Atom } from "../types";
import {
  buildScenes,
  focusedLinesAt,
  holdSeconds,
  revealedLineCount,
  revealSeconds,
  speechSeconds,
} from "../engine/scenes";
import * as narrator from "../engine/narrator";
import * as neural from "../engine/neural";
import { useSettings } from "../settings";
import CodeStage from "./CodeStage";
import Markdown from "./Markdown";
import GuidedVisual from "./GuidedVisual";
import Icon from "./Icon";
import RatePicker from "./RatePicker";
import AskTutor from "./AskTutor";

interface PlaybackRun {
  cancelled: boolean;
  phase: "waiting" | "loading" | "speech" | "silent" | "hold";
  lastTick: number;
  totalElapsed: number;
  speechElapsed: number;
  phaseElapsed: number;
  holdTarget: number;
  stallTarget: number;
  ticker?: ReturnType<typeof setInterval>;
}

/**
 * The lecture as something you watch instead of read.
 *
 * Built for a short attention span on purpose: one idea on screen at a time,
 * roughly ten seconds a scene, auto-advancing, with the words on screen *and*
 * spoken. Seeing and hearing the same thing is dual coding, and it's one of
 * the few study techniques that reliably beats reading alone.
 */
export default function WatchView({
  atom,
  onDone,
  onRead,
  isFullscreen,
  onToggleFullscreen,
  reviewMode = false,
}: {
  atom: Atom;
  onDone: () => void;
  onRead?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
  reviewMode?: boolean;
}) {
  const scenes = useMemo(() => buildScenes(atom), [atom]);

  const { settings, update } = useSettings();
  const { rate, muted, holdScale, animateCode, voiceURI, engine, neuralVoice } =
    settings.watch;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(settings.watch.autoplay);
  const [preparing, setPreparing] = useState(false);
  const [showPreparing, setShowPreparing] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [tutorClosing, setTutorClosing] = useState(false);
  const [narrationProgress, setNarrationProgress] = useState({ index: 0, value: 0 });
  const [playRequest, setPlayRequest] = useState(0);
  const playingRef = useRef(playing);
  const runRef = useRef<PlaybackRun | null>(null);
  const setRate = (next: number) => update("watch", { rate: next });
  const setMuted = (next: boolean) => update("watch", { muted: next });
  /**
   * A ref, not state, and that matters.
   *
   * Voices load asynchronously — up to a second after the player starts. As
   * state it lands in the playback effect's dependencies, so the effect tears
   * down and re-runs mid-scene, and the narration starts again from the top of
   * the sentence. Nothing on screen depends on the voice, so it never needs to
   * trigger a render.
   */
  const voice = useRef<SpeechSynthesisVoice | null>(null);

  const scene = scenes[index];
  const atEnd = index >= scenes.length - 1;
  const advancing = useRef(false);

  useEffect(() => {
    narrator.loadVoices().then((all) => {
      voice.current =
        all.find((v) => v.voiceURI === voiceURI) ?? narrator.pickVoice(all);
    });
  }, [voiceURI]);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, scenes.length - 1));
  }, [scenes.length]);

  // A learner can scrub away and return to a slide. Never reuse that slide's
  // old progress value: it would reveal the finished code and highlight its
  // last cue for a beat before narration restarts from the beginning.
  useEffect(() => {
    setNarrationProgress({ index, value: 0 });
  }, [index]);

  /**
   * Warm the opening scenes as soon as the lecture is on screen.
   *
   * Playback keeps two scenes ahead, which covers everything except the
   * very first — and that is the one the listener is waiting on with their
   * finger on Play. Starting here buys the couple of seconds it takes while
   * they are still reading the title.
   */
  useEffect(() => {
    if (engine !== "natural" || muted) return;

    const warm = () => {
      for (const [distance, scene] of scenes.slice(0, 3).entries()) {
        if (scene.narration) {
          neural.prefetch(
            narrator.forSpeech(scene.narration),
            neuralVoice,
            rate,
            distance,
          );
        }
      }
    };

    // Packed voices only fetch and decode the small lecture asset. Live voices
    // initialise Kokoro only when its model is already cached, so opening a
    // lecture never starts a surprise model download or blocks the interface.
    void (async () => {
      if (neural.hasPackedVoice(neuralVoice)) {
        warm();
        return;
      }
      if (neural.getStatus() === "ready") {
        warm();
        return;
      }
      if (await neural.hasCachedWeights()) {
        await neural.load().then(warm, () => undefined);
      }
    })();
  }, [scenes, engine, muted, neuralVoice, rate]);

  /**
   * Own one complete scene playback run. Pause freezes this run instead of
   * destroying and rebuilding it. Every callback checks object identity, so a
   * stale clip can never update or advance a newer scene.
   */
  useEffect(() => {
    narrator.cancel();
    if (!playingRef.current || !scene) return;

    advancing.current = false;
    const expected =
      Math.max(speechSeconds(scene.narration, rate), revealSeconds(scene)) +
      holdSeconds(scene, rate);
    const run: PlaybackRun = {
      cancelled: false,
      phase: "waiting",
      lastTick: performance.now(),
      totalElapsed: 0,
      speechElapsed: 0,
      phaseElapsed: 0,
      holdTarget: 0,
      stallTarget: (expected * 2 + 8) * 1000,
    };
    runRef.current = run;

    const ownsRun = () => !run.cancelled && runRef.current === run;
    const finish = () => {
      if (!ownsRun() || advancing.current) return;
      advancing.current = true;
      run.cancelled = true;
      if (run.ticker) clearInterval(run.ticker);
      runRef.current = null;
      narrator.cancel();
      if (index < scenes.length - 1) next();
      else {
        playingRef.current = false;
        setPlaying(false);
      }
    };

    const beginHold = () => {
      if (!ownsRun()) return;
      const revealLeft = Math.max(0, revealSeconds(scene) - run.speechElapsed / 1000);
      run.phase = "hold";
      run.phaseElapsed = 0;
      run.holdTarget =
        (revealLeft + holdSeconds(scene, rate) * holdScale) * 1000;
    };

    run.ticker = setInterval(() => {
      if (!ownsRun()) return;
      const now = performance.now();
      const elapsed = Math.max(0, now - run.lastTick);
      run.lastTick = now;
      if (!playingRef.current) return;

      run.totalElapsed += elapsed;
      if (run.phase === "speech" || run.phase === "silent") {
        run.speechElapsed += elapsed;
      }
      if (run.phase === "silent") {
        const silentTarget = Math.max(100, speechSeconds(scene.narration, rate) * 1000);
        setNarrationProgress({ index, value: Math.min(1, run.speechElapsed / silentTarget) });
        if (run.speechElapsed >= silentTarget) beginHold();
      } else if (run.phase === "hold") {
        run.phaseElapsed += elapsed;
        if (run.phaseElapsed >= run.holdTarget) {
          finish();
          return;
        }
      }

      // Count only active time: a learner may leave playback paused forever.
      if (run.totalElapsed >= run.stallTarget) finish();
    }, 60);

    if (
      engine === "natural" &&
      (neural.hasPackedVoice(neuralVoice) || neural.getStatus() === "ready")
    ) {
      for (const distance of [1, 2]) {
        const upcoming = scenes[index + distance];
        if (upcoming?.narration) {
          neural.prefetch(
            narrator.forSpeech(upcoming.narration),
            neuralVoice,
            rate,
            distance,
          );
        }
      }
    }

    // React can flush an effect before the browser paints the committed DOM.
    // A cached next clip then speaks its first word over the previous slide.
    // Two frames guarantee that the new visual is actually on screen first.
    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (!ownsRun() || !playingRef.current) return;
        setNarrationProgress({ index, value: 0 });
        if (muted || !scene.narration) {
          run.phase = "silent";
          run.speechElapsed = 0;
          return;
        }

        run.phase = "loading";
        setPreparing(engine === "natural" && !neural.hasPackedVoice(neuralVoice));
        narrator.speak(scene.narration, {
          rate,
          voice: voice.current,
          engine,
          neuralVoice,
          onStart: () => {
            if (!ownsRun()) return;
            run.phase = "speech";
            run.speechElapsed = 0;
            setPreparing(false);
          },
          onProgress: (value) => {
            if (ownsRun()) setNarrationProgress({ index, value });
          },
          onEnd: () => {
            if (ownsRun()) beginHold();
          },
        });
      });
    });

    return () => {
      run.cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      if (run.ticker) clearInterval(run.ticker);
      if (runRef.current === run) runRef.current = null;
      narrator.cancel();
      setPreparing(false);
    };
  }, [
    index,
    muted,
    rate,
    holdScale,
    scene,
    scenes,
    scenes.length,
    next,
    engine,
    neuralVoice,
    playRequest,
  ]);

  // Pause and resume the current clip and its timing clock. No restart, no
  // shared AudioContext suspension, and no timers expiring behind the pause.
  useEffect(() => {
    playingRef.current = playing;
    const run = runRef.current;
    if (!playing) {
      if (run) run.lastTick = performance.now();
      narrator.pause();
      return;
    }
    if (run && !run.cancelled && run.phase !== "waiting") {
      run.lastTick = performance.now();
      narrator.resume();
    } else {
      setPlayRequest((value) => value + 1);
    }
  }, [playing]);

  useEffect(() => () => narrator.cancel(), []);

  // Only surface "preparing natural voice" when the wait is actually long. A
  // packed voice starts almost instantly, so showing it on every load just
  // flashes a scary-looking message for no reason.
  useEffect(() => {
    if (!(preparing && playing && !muted)) {
      setShowPreparing(false);
      return;
    }
    const id = setTimeout(() => setShowPreparing(true), 1200);
    return () => clearTimeout(id);
  }, [preparing, playing, muted]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // The tutor owns the keyboard while its panel is open.
      if (document.querySelector(".tutor-overlay")) return;
      const target = event.target;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;
      if (editing) return;
      if (event.key === " ") {
        event.preventDefault();
        setPlaying((p) => !p);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next]);

  if (!scene) return null;

  const supported = narrator.isSupported();
  const sceneProgress = narrationProgress.index === index ? narrationProgress.value : 0;
  const activeFocusLines = focusedLinesAt(scene, sceneProgress);

  return (
    <div
      className={`watch ${isFullscreen ? "watch-fullscreen" : ""}`}
    >
      <div className="row spread watch-toolbar">
        <span className="step-kind">
          Watch · {index + 1} of {scenes.length}
        </span>
        <div className="row watch-toolbar-actions">
          <button
            className="ask-tutor-btn"
            onClick={() => {
              playingRef.current = false;
              setPlaying(false);
              const run = runRef.current;
              if (run) {
                run.cancelled = true;
                if (run.ticker) clearInterval(run.ticker);
                runRef.current = null;
              }
              narrator.cancel();
              setAskOpen(true);
            }}
            title="Ask the AI tutor about this slide"
          >
            <Icon name="cap" size={15} />
            <span>Ask</span>
          </button>
          {onRead ? (
            <button className="ghost tiny read-instead-btn" onClick={onRead}>
              Read it instead
            </button>
          ) : null}
          {onToggleFullscreen ? (
            <button
              className="ghost tiny fullscreen-toggle"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-pressed={isFullscreen}
              title={`${isFullscreen ? "Exit" : "Enter"} fullscreen (F)`}
            >
              <Icon name={isFullscreen ? "minimize" : "maximize"} size={16} />
              <span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
            </button>
          ) : null}
        </div>
      </div>

      {askOpen ? (
        <AskTutor
          atom={atom}
          scene={scene}
          closing={tutorClosing}
          onResume={() => {
            setTutorClosing(true);
            window.setTimeout(() => {
              setAskOpen(false);
              setTutorClosing(false);
            }, 230);
          }}
        />
      ) : (
        <>
      <div className="stage">
        <div className="stage-meta">
          <div className="stage-section">{scene.section}</div>
          <div className="stage-focus">{scene.focusLabel}</div>
        </div>

        <div className={`stage-body ${scene.kind}`} key={index}>
          {scene.kind === "title" ? (
            <h1 className="stage-title">{scene.caption}</h1>
          ) : scene.kind === "section" ? (
            <h2 className="stage-heading">
              <Markdown source={scene.caption} language={atom.language} />
            </h2>
          ) : (
            <div className="stage-text">
              <Markdown source={scene.caption} language={atom.language} />
            </div>
          )}

          {scene.code ? (
            <CodeStage
              code={scene.code}
              animate={animateCode && scene.codeIsNew !== false}
              language={atom.language}
              focusLines={activeFocusLines}
              revealThrough={revealedLineCount(scene, sceneProgress)}
            />
          ) : null}

          {scene.visualKind ? (
            <GuidedVisual
              kind={scene.visualKind}
              variant={scene.visualVariant}
              topic={scene.visualTopic}
            />
          ) : null}

          {scene.traceItems?.length ? (
            <div className="stage-trace">
              <span>Trace</span>
              {scene.traceItems.map((item) => <i key={item}>{item}</i>)}
            </div>
          ) : null}

          {scene.keyTerms?.length ? (
            <div className="stage-terms">
              <span>Keep in view</span>
              {scene.keyTerms.map((term) => <code key={term}>{term}</code>)}
            </div>
          ) : null}
        </div>
      </div>

      <div className="scene-rail">
        {scenes.map((_, i) => (
          <button
            key={i}
            className={`pip ${i === index ? "on" : i < index ? "seen" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Scene ${i + 1}`}
          />
        ))}
      </div>

      <div className="controls">
        <button
          className="ghost control-back"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Back"
        >
          <Icon className="ico control-ico" name="prev" size={18} />
          <span className="control-label">Back</span>
        </button>

        <button
          className="primary play control-play"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
        >
          <Icon className="ico control-ico" name={playing ? "pause" : "play"} size={18} />
          <span className="control-label">
            {playing ? "Pause" : atEnd ? "Replay" : "Play"}
          </span>
        </button>

        <button
          className="ghost control-next"
          onClick={atEnd ? onDone : next}
          aria-label={atEnd ? (reviewMode ? "Return" : "Exercises") : "Next"}
        >
          <span className="control-label">
            {atEnd ? (reviewMode ? "Return" : "Exercises") : "Next"}
          </span>
          <Icon className="ico control-ico" name="next" size={18} />
        </button>

        {showPreparing ? (
          <span className="preparing" aria-live="polite">
            preparing natural voice…
          </span>
        ) : null}

        <span className="control-spacer" />

        <button
          className={`ghost tiny control-voice ${muted ? "on" : ""}`}
          onClick={() => setMuted(!muted)}
          aria-label={muted ? "Turn narration on" : "Mute narration"}
          title={supported ? "Mute narration" : "Speech not available in this browser"}
        >
          <Icon className="ico control-ico" name={muted || !supported ? "volumeOff" : "volume"} size={16} />
          <span className="control-label">{muted || !supported ? "Silent" : "Voice on"}</span>
        </button>

        <RatePicker value={rate} onChange={setRate} />
      </div>

      <div className="tiny dim watch-help">
        Space to play or pause · arrows to move · F for fullscreen
      </div>

      <div className="row watch-actions">
        <button className={atEnd ? "primary" : "ghost"} onClick={onDone}>
          {reviewMode
            ? atEnd ? "Back to my work" : "Close review"
            : atEnd ? "Continue to the exercises" : "Skip to the exercises"}
        </button>
      </div>
        </>
      )}
    </div>
  );
}
