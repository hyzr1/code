import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PYTHON_REELS, type PythonReel, type ReelBeat } from "../content/reels";
import {
  loadReelHistory,
  rankReels,
  saveReelHistory,
  withView,
  type ReelHistory,
} from "../engine/reelFeed";
import {
  loadReelAudio,
  reelAudioUrl,
  type ReelAudioAsset,
  type ReelAudioManifest,
} from "../engine/reelAudio";
import { useSettings } from "../settings";
import { highlightLine } from "./highlight";
import Icon from "./Icon";
import "./reels.css";

const MUTED_KEY = "hyzr.python-reels.muted";
const difficultyLabel = ["", "Quick win", "Beginner", "Interview", "Advanced", "Hard mode"];

interface Props {
  mobile: boolean;
  onMenu: () => void;
  onOpenLesson: (id: string) => void;
}

interface FeedItem {
  key: string;
  reel: PythonReel;
}

function cycle(reels: PythonReel[], round: number): FeedItem[] {
  if (!reels.length) return [];
  const shift = (round * 7) % reels.length;
  const rotated = [...reels.slice(shift), ...reels.slice(0, shift)];
  return rotated.map((reel, index) => ({ key: `${round}-${index}-${reel.id}`, reel }));
}

function activeBeatFor(asset: ReelAudioAsset | undefined, time: number, count: number) {
  if (!asset?.beats.length) return { index: 0, progress: 0 };
  let index = asset.beats.findIndex((beat) => time < beat.start + beat.duration);
  if (index < 0) index = Math.max(0, Math.min(count - 1, asset.beats.length - 1));
  const beat = asset.beats[index];
  return {
    index: Math.min(index, Math.max(0, count - 1)),
    progress: Math.max(0, Math.min(1, (time - beat.start) / Math.max(0.01, beat.duration))),
  };
}

export default function ReelsView({ mobile, onMenu, onOpenLesson }: Props) {
  const { settings } = useSettings();
  const [history, setHistory] = useState<ReelHistory>(() => loadReelHistory());
  const ranked = useMemo(
    () => rankReels(PYTHON_REELS, history, settings.profile.experience),
    // A feed should not reorder underneath the thumb. Re-rank next time it is
    // opened; interactions still persist immediately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.profile.experience],
  );
  const [items, setItems] = useState<FeedItem[]>(() => cycle(ranked, 0));
  const [activeIndex, setActiveIndex] = useState(0);
  const [manifest, setManifest] = useState<ReelAudioManifest | null>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTED_KEY) === "true");
  const [time, setTime] = useState(0);
  const [needsTap, setNeedsTap] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playingRef = useRef(playing);
  const rafRef = useRef(0);
  const scrollRaf = useRef(0);
  const viewedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = items[activeIndex]?.reel ?? ranked[0];
  const asset = active ? manifest?.reels[active.id] : undefined;
  const beatState = active ? activeBeatFor(asset, time, active.beats.length) : { index: 0, progress: 0 };

  useEffect(() => {
    void loadReelAudio().then(setManifest);
  }, []);

  useEffect(() => {
    saveReelHistory(history);
  }, [history]);

  useEffect(() => {
    localStorage.setItem(MUTED_KEY, String(muted));
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    playingRef.current = playing;
    const audio = audioRef.current;
    if (!audio?.src) return;
    if (!playing) {
      audio.pause();
      return;
    }
    void audio.play().then(
      () => setNeedsTap(false),
      () => setNeedsTap(true),
    );
  }, [playing]);

  useEffect(() => {
    if (activeIndex < items.length - 6) return;
    setItems((current) => [...current, ...cycle(ranked, Math.ceil(current.length / ranked.length))]);
  }, [activeIndex, items.length, ranked]);

  useEffect(() => {
    setTime(0);
    if (viewedTimer.current) clearTimeout(viewedTimer.current);
    if (!active) return;
    viewedTimer.current = setTimeout(() => {
      setHistory((current) => withView(current, active));
    }, 1400);
    return () => {
      if (viewedTimer.current) clearTimeout(viewedTimer.current);
    };
  }, [active]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !asset) return;
    audio.pause();
    audio.src = reelAudioUrl(asset);
    audio.currentTime = 0;
    audio.muted = muted;
    audio.load();
    const start = window.setTimeout(() => {
      if (!playingRef.current) return;
      void audio.play().then(
        () => setNeedsTap(false),
        () => setNeedsTap(true),
      );
    }, 110);

    const nextItem = items[activeIndex + 1]?.reel;
    const nextAsset = nextItem ? manifest?.reels[nextItem.id] : undefined;
    if (nextAsset) {
      const preload = new Audio(reelAudioUrl(nextAsset));
      preload.preload = "metadata";
    }
    return () => window.clearTimeout(start);
  // Changing mute or extending the infinite list must never reload the active
  // file. Only a genuinely different reel/audio asset owns the source.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, asset]);

  // requestAnimationFrame gives captions the fluid word-level movement that a
  // four-times-per-second `timeupdate` event cannot.
  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) setTime(audio.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (playingRef.current) void audio.play().catch(() => setNeedsTap(true));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const scrollTo = useCallback((index: number) => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollTo({ top: Math.max(0, index) * feed.clientHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        scrollTo(activeIndex + 1);
      } else if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        scrollTo(activeIndex - 1);
      } else if (event.key === " ") {
        event.preventDefault();
        togglePlayback(audioRef, playing, setPlaying, setNeedsTap);
      } else if (event.key.toLowerCase() === "m") {
        setMuted((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, playing, scrollTo]);

  if (!active) return null;
  return (
    <section className="reels" aria-label="Python Reels">
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        onPlay={() => setNeedsTap(false)}
        onEnded={() => {
          const audio = audioRef.current;
          if (!audio) return;
          audio.currentTime = 0;
          setTime(0);
          if (playingRef.current) void audio.play().catch(() => setNeedsTap(true));
        }}
      />

      <div className="reels-chrome" aria-hidden="true">
        <span className="reels-glow one" />
        <span className="reels-glow two" />
      </div>

      <div className="reels-topbar">
        {mobile ? (
          <button className="reel-round" onClick={onMenu} aria-label="Open menu">
            <Icon name="menu" size={19} />
          </button>
        ) : <span />}
        <button
          className="reel-round"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? "Unmute reels" : "Mute reels"}
        >
          <Icon name={muted ? "volumeOff" : "volume"} size={18} />
        </button>
      </div>

      <div
        className="reels-feed"
        ref={feedRef}
        onScroll={() => {
          cancelAnimationFrame(scrollRaf.current);
          scrollRaf.current = requestAnimationFrame(() => {
            const feed = feedRef.current;
            if (!feed?.clientHeight) return;
            setActiveIndex(Math.max(0, Math.min(items.length - 1, Math.round(feed.scrollTop / feed.clientHeight))));
          });
        }}
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const reel = item.reel;
          // Real iPhones have a much tighter WebKit graphics budget than
          // desktop Safari. Keep scroll geometry for the full feed, but only
          // mount the three cards that can actually be seen next. Otherwise
          // dozens of gradients, filters, code blocks, and animations become
          // compositor layers before the first frame and can crash the tab.
          if (Math.abs(index - activeIndex) > 1) {
            return (
              <article
                className="reel-card reel-placeholder"
                key={item.key}
                aria-hidden="true"
                inert
              />
            );
          }
          const shownBeat = isActive ? reel.beats[beatState.index] : reel.beats[0];
          const reelAsset = manifest?.reels[reel.id];
          return (
            <article
              className={`reel-card palette-${reel.palette} format-${reel.format} ${reel.lessonId ? "has-lesson" : ""} ${isActive ? "active" : ""}`}
              key={item.key}
              aria-label={`${reel.title}. ${difficultyLabel[reel.difficulty]}`}
              aria-hidden={!isActive}
              inert={!isActive ? true : undefined}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("button, a")) return;
                togglePlayback(audioRef, playing, setPlaying, setNeedsTap);
              }}
            >
              <div className="reel-backdrop" aria-hidden="true">
                <span className="orb orb-a" />
                <span className="orb orb-b" />
                <span className="reel-grid" />
              </div>

              <ReelProgress asset={reelAsset} time={isActive ? time : 0} count={reel.beats.length} />

              <div className="reel-canvas" key={`${item.key}-${isActive ? beatState.index : 0}`}>
                <ReelScene reel={reel} beat={shownBeat} beatIndex={isActive ? beatState.index : 0} />
              </div>

              <div className="reel-caption-wrap" aria-live={isActive ? "polite" : "off"}>
                <KineticCaption beat={shownBeat} progress={isActive ? beatState.progress : 0} />
              </div>

              {reel.lessonId ? (
                <button className="reel-learn" onClick={() => onOpenLesson(reel.lessonId!)}>
                  <Icon name="book" size={14} /> Learn the full concept
                </button>
              ) : null}

              {!playing && isActive && !needsTap ? (
                <div className="reel-paused" aria-hidden="true"><Icon name="play" size={29} /></div>
              ) : null}
              {needsTap && isActive ? (
                <button
                  className="reel-unlock"
                  onClick={() => togglePlayback(audioRef, false, setPlaying, setNeedsTap)}
                >
                  <span><Icon name="volume" size={22} /></span>
                  Tap for sound
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="reels-key-help">↑ ↓ scroll · space pause · M mute</div>
    </section>
  );
}

function togglePlayback(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  playing: boolean,
  setPlaying: (value: boolean) => void,
  setNeedsTap: (value: boolean) => void,
) {
  const audio = audioRef.current;
  if (!audio) return;
  if (playing && !audio.paused) {
    audio.pause();
    setPlaying(false);
  } else {
    void audio.play().then(
      () => { setPlaying(true); setNeedsTap(false); },
      () => setNeedsTap(true),
    );
  }
}

function ReelProgress({ asset, time, count }: { asset?: ReelAudioAsset; time: number; count: number }) {
  return (
    <div className="reel-progress" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const beat = asset?.beats[index];
        const progress = !beat ? 0 : Math.max(0, Math.min(1, (time - beat.start) / beat.duration));
        return <i key={index}><span style={{ transform: `scaleX(${progress})` }} /></i>;
      })}
    </div>
  );
}

function ReelScene({ reel, beat, beatIndex }: { reel: PythonReel; beat: ReelBeat; beatIndex: number }) {
  return (
    <div className={`reel-scene tone-${beat.tone ?? "plain"}`}>
      {beat.kicker ? <div className="reel-kicker">{beat.kicker}</div> : null}
      {beatIndex === 0 || (!beat.code && !beat.stat && !beat.labels?.length) ? (
        <h2>{reel.title}</h2>
      ) : null}
      {beat.stat ? <div className="reel-stat">{beat.stat}</div> : null}
      {beat.visual ? <ReelDiagram kind={beat.visual} labels={beat.labels} /> : null}
      {beat.labels?.length && !beat.visual ? (
        <div className="reel-label-cloud">
          {beat.labels.map((label, index) => <span style={{ "--i": index } as React.CSSProperties} key={label}>{label}</span>)}
        </div>
      ) : null}
      {beat.code ? <ReelCode code={beat.code} focus={beat.focusLines} /> : null}
      {beat.output ? (
        <div className="reel-output"><span>OUTPUT</span><pre>{beat.output}</pre></div>
      ) : null}
    </div>
  );
}

function ReelCode({ code, focus = [] }: { code: string; focus?: number[] }) {
  return (
    <div className="reel-code">
      <div className="reel-code-head"><i /><i /><i /><span>main.py</span></div>
      <pre>
        {code.split("\n").map((line, index) => (
          <span className={`reel-code-line ${focus.includes(index + 1) ? "focus" : focus.length ? "dim" : ""}`} key={`${line}-${index}`}>
            <b>{index + 1}</b><code>{line ? highlightLine(line, `reel-${index}`, "python") : " "}</code>
          </span>
        ))}
      </pre>
    </div>
  );
}

function ReelDiagram({ kind, labels = [] }: { kind: NonNullable<ReelBeat["visual"]>; labels?: string[] }) {
  const fallback: Record<typeof kind, string[]> = {
    venn: ["A", "A ∩ B", "B"],
    buckets: ["00", "01", "hash", "11"],
    references: ["name A", "object", "name B"],
    window: ["left", "window", "right"],
    queue: ["OUT", "A", "B", "C", "IN"],
    stack: ["top", "item", "item"],
    heap: ["1", "3", "8", "12"],
    pipeline: ["input", "transform", "answer"],
    memory: ["name", "address", "object"],
  };
  const shown = labels.length ? labels : fallback[kind];
  return (
    <div className={`reel-diagram diagram-${kind}`} aria-hidden="true">
      {shown.map((label, index) => (
        <span key={`${label}-${index}`} style={{ "--i": index } as React.CSSProperties}>{label}</span>
      ))}
    </div>
  );
}

function KineticCaption({ beat, progress }: { beat: ReelBeat; progress: number }) {
  const text = beat.narration;
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((word) => Math.max(1.5, word.replace(/[^\p{L}\p{N}]/gu, "").length ** 0.68));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const position = progress * total;
  let cursor = 0;
  return (
    <div className="reel-caption" data-narration={text}>
      {words.map((word, index) => {
        const start = cursor;
        cursor += weights[index];
        const active = position >= start && position < cursor;
        const past = position >= cursor;
        return <span className={active ? "active" : past ? "past" : ""} key={`${word}-${index}`}>{word} </span>;
      })}
    </div>
  );
}
