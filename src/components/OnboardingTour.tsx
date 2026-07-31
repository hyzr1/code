import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { Mark } from "./Brand";

const STORAGE_KEY = "unwashed.onboarding.v1";

interface TourStep {
  eyebrow: string;
  title: string;
  body: string;
  selector?: string;
}

const STEPS: TourStep[] = [
  {
    eyebrow: "Welcome to Hyzr Code",
    title: "Build the skill AI cannot perform for you",
    body: "You will learn one idea, retrieve it without rereading, then produce working code. The app adapts the sequence from what you can actually recall—not what you merely watched.",
  },
  {
    eyebrow: "Your language",
    title: "Choose the language you will interview in",
    body: "Python and JavaScript keep separate paths and progress. Switch from Course, Algo Problems, or Settings → Learning at any time without losing work.",
  },
  {
    eyebrow: "Two kinds of work",
    title: "Learn the language, then train interview patterns",
    body: "Learn builds the mental model and production fluency. Algo turns that knowledge into pattern recognition under interview constraints.",
    selector: '[data-tour="modes"]',
  },
  {
    eyebrow: "Your daily plan",
    title: "Do what is due, not whatever feels familiar",
    body: "Daily session mixes new material with spaced retrieval. Its badge only counts concepts you have already encountered and genuinely need to review.",
    selector: '[data-tour="daily"]',
  },
  {
    eyebrow: "Tailored preparation",
    title: "Tell Hyzr Code what job you are preparing for",
    body: "Settings can tailor the curriculum for FAANG-style SWE, practical software engineering, ML engineering, or quant work—plus your level, deadline, and weekly capacity.",
    selector: '[data-tour="settings"]',
  },
  {
    eyebrow: "Move quickly",
    title: "Find anything without digging through menus",
    body: "Open Quick find or press Ctrl K from anywhere. Search lessons, problems, concepts, settings, and your next recommended action.",
    selector: '[data-tour="search"]',
  },
  {
    eyebrow: "You are ready",
    title: "Start small. Produce it cold.",
    body: "Begin with the first lesson. The course will handle ordering, reviews, and difficulty. You can replay this tour later from the sidebar or Settings → About.",
  },
];

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "complete";
  } catch {
    return false;
  }
}

function rememberOnboarding() {
  try {
    localStorage.setItem(STORAGE_KEY, "complete");
  } catch {
    // Private browsing can reject storage. Finishing the tour should still
    // work for the current session.
  }
}

export default function OnboardingTour({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const step = STEPS[index];

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step.selector) {
      setTarget(null);
      return;
    }

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = document.querySelector<HTMLElement>(step.selector!);
        if (!element) {
          setTarget(null);
          return;
        }
        element.scrollIntoView({ block: "nearest", inline: "nearest" });
        const rect = element.getBoundingClientRect();
        setTarget(rect.width && rect.height ? rect : null);
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    const element = document.querySelector<HTMLElement>(step.selector);
    if (element) observer.observe(element);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step.selector]);

  useEffect(() => {
    if (!open) return;
    nextRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".tour-card button:not(:disabled)"));
        if (!buttons.length) return;
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.shiftKey
          ? current <= 0 ? buttons.length - 1 : current - 1
          : current === buttons.length - 1 ? 0 : current + 1;
        event.preventDefault();
        buttons[next].focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        rememberOnboarding();
        onClose();
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        if ((event.target as HTMLElement)?.matches("button")) return;
        event.preventDefault();
        if (index === STEPS.length - 1) {
          rememberOnboarding();
          onClose();
        } else setIndex((value) => value + 1);
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        setIndex((value) => value - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, open]);

  if (!open) return null;

  const padding = 7;
  const spotlight = target
    ? {
        left: Math.max(6, target.left - padding),
        top: Math.max(6, target.top - padding),
        width: target.width + padding * 2,
        height: target.height + padding * 2,
      }
    : null;
  const showBelow = !target || target.bottom + 300 < window.innerHeight;
  const tooltipStyle = target
    ? {
        left: Math.min(
          Math.max(16, target.left),
          Math.max(16, window.innerWidth - 376),
        ),
        ...(showBelow
          ? { top: target.bottom + 18 }
          : { bottom: Math.max(16, window.innerHeight - target.top + 18) }),
      }
    : undefined;

  const finish = () => {
    rememberOnboarding();
    onClose();
  };

  return (
    <div className="tour-layer" role="presentation">
      {spotlight ? <div className="tour-spotlight" style={spotlight} /> : <div className="tour-dimmer" />}
      <section
        className={`tour-card ${target ? "anchored" : "centered"}`}
        style={tooltipStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
      >
        <div className="tour-topline">
          <div className="tour-mark"><Mark size={18} /></div>
          <span>{step.eyebrow}</span>
          <button className="ghost tiny" onClick={finish}>Skip tour</button>
        </div>
        <h2 id="tour-title">{step.title}</h2>
        <p id="tour-body">{step.body}</p>

        <div className="tour-footer">
          <div className="tour-dots" aria-label={`Step ${index + 1} of ${STEPS.length}`}>
            {STEPS.map((_, dot) => <i key={dot} className={dot === index ? "active" : dot < index ? "done" : ""} />)}
          </div>
          <div className="row" style={{ gap: 7 }}>
            {index > 0 ? (
              <button className="small" onClick={() => setIndex((value) => value - 1)}>
                <Icon name="arrowLeft" size={14} /> Back
              </button>
            ) : null}
            <button
              ref={nextRef}
              className="primary small"
              onClick={() => index === STEPS.length - 1 ? finish() : setIndex((value) => value + 1)}
            >
              {index === STEPS.length - 1 ? "Start learning" : "Next"}
              {index < STEPS.length - 1 ? <Icon name="arrowRight" size={14} /> : null}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
