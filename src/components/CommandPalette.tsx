import { useEffect, useMemo, useRef, useState } from "react";
import type { Progress } from "../types";
import {
  CONCEPT_BY_ID,
  PROBLEMS,
  lessonsForCourse,
  currentLessonForCourse,
  lessonProgress,
} from "../content";
import { useSettings } from "../settings";
import { contentLanguage } from "../content/language";
import type { Route } from "./Sidebar";
import Icon, { type IconName } from "./Icon";
import { ACTIVE_SWE_PREPARATION_LEVEL } from "../content/courses";

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: IconName;
  /** Extra text matched against the query but never shown — concept names,
   *  patterns, synonyms. Searching "closure" should find `once`. */
  keywords?: string;
  run: () => void;
}

/**
 * ⌘K.
 *
 * The difference between a tool and a demo is whether you can drive it without
 * the mouse. Everything reachable by clicking is reachable here: lessons,
 * problems, navigation, theme, and the settings panes.
 */
export default function CommandPalette({
  progress,
  go,
  onSettings,
  onClose,
}: {
  progress: Progress;
  go: (route: Route) => void;
  onSettings: () => void;
  onClose: () => void;
}) {
  const { settings, update } = useSettings();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const preparationLevel = settings.learning.course === "swe"
      ? ACTIVE_SWE_PREPARATION_LEVEL
      : undefined;
    const next = currentLessonForCourse(progress, settings.learning.course, preparationLevel);
    const out: Command[] = [];

    if (next) {
      out.push({
        id: "continue",
        group: "Actions",
        label: `Continue — ${next.title}`,
        icon: "play",
        run: () => go({ name: "lesson", id: next.id }),
      });
    }
    out.push(
      {
        id: "go-course",
        group: "Actions",
        label: "Go to course",
        icon: "layers",
        run: () => go({ name: "course" }),
      },
      {
        id: "go-problems",
        group: "Actions",
        label: "Go to problems",
        icon: "target",
        run: () => go({ name: "problems" }),
      },
      {
        id: "go-session",
        group: "Actions",
        label: "Start today's session",
        icon: "zap",
        run: () => go({ name: "session" }),
      },
      {
        id: "go-progress",
        group: "Actions",
        label: "Go to progress",
        icon: "chart",
        run: () => go({ name: "progress" }),
      },
      {
        id: "settings",
        group: "Actions",
        label: "Open settings",
        icon: "settings",
        run: onSettings,
      },
      {
        id: "theme",
        group: "Actions",
        label:
          settings.appearance.theme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme",
        icon: settings.appearance.theme === "dark" ? "sun" : "moon",
        run: () =>
          update("appearance", {
            theme: settings.appearance.theme === "dark" ? "light" : "dark",
          }),
      },
      {
        id: "cold",
        group: "Actions",
        label: settings.learning.coldByDefault
          ? "Turn off Cold Mode by default"
          : "Turn on Cold Mode by default",
        icon: "shield",
        run: () =>
          update("learning", {
            coldByDefault: !settings.learning.coldByDefault,
          }),
      },
    );

    const names = (ids: string[]) =>
      ids.map((id) => `${id} ${CONCEPT_BY_ID.get(id)?.title ?? ""}`).join(" ");

    for (const lesson of lessonsForCourse(settings.learning.course, preparationLevel)) {
      const state = lessonProgress(lesson, progress);
      out.push({
        id: `lesson:${lesson.id}`,
        group: "Lessons",
        label: lesson.title,
        hint: state.complete ? "done" : `${state.done}/${state.total}`,
        icon: "book",
        keywords: lesson.goal,
        run: () => go({ name: "lesson", id: lesson.id }),
      });
    }

    for (const problem of PROBLEMS.filter(
      (p) => p.tier !== "rep" && contentLanguage(p) === settings.learning.language,
    )) {
      out.push({
        id: `problem:${problem.id}`,
        group: "Problems",
        label: problem.title,
        hint: progress.cleared[problem.id] ? "cleared" : `${problem.estimatedMinutes} min`,
        icon: "code",
        keywords: `${problem.pattern ?? ""} ${names(problem.teaches)}`,
        run: () => go({ name: "problem", id: problem.id }),
      });
    }

    return out;
  }, [progress, go, onSettings, settings, update]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 40);
    return commands
      .filter((c) =>
        `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [commands, query]);

  useEffect(() => setCursor(0), [query]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const choose = (command: Command) => {
    command.run();
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(c + 1, matches.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = matches[cursor];
      if (command) choose(command);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  let lastGroup = "";

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-input">
          <Icon name="search" size={17} />
          <input
            autoFocus
            value={query}
            placeholder="Jump to a lesson, problem or action…"
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search commands"
          />
          <kbd>Esc</kbd>
        </div>

        <div className="palette-list" ref={listRef}>
          {matches.length === 0 ? (
            <div style={{ padding: "28px 12px", textAlign: "center" }}>
              <div className="small muted">Nothing matches “{query}”.</div>
            </div>
          ) : (
            matches.map((command, i) => {
              const header = command.group !== lastGroup ? command.group : null;
              lastGroup = command.group;
              return (
                <div key={command.id}>
                  {header ? <div className="palette-group">{header}</div> : null}
                  <button
                    className="palette-item"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => choose(command)}
                  >
                    <Icon name={command.icon} size={16} />
                    <span>{command.label}</span>
                    {command.hint ? (
                      <span className="sub">{command.hint}</span>
                    ) : null}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="palette-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span style={{ marginLeft: "auto" }}>
            {matches.length} result{matches.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
