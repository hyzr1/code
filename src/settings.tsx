import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CareerStage,
  CareerTrack,
  Course,
  CourseLanguage,
  ExperienceLevel,
} from "./types";

export type ThemeChoice = "light" | "dark" | "system";
export type AccentName =
  | "ochre"
  | "coral"
  | "blue"
  | "violet"
  | "emerald"
  | "rose";

export interface Settings {
  profile: {
    track: CareerTrack;
    stage: CareerStage;
    experience: ExperienceLevel;
    preferredLanguages: CourseLanguage[];
    weeklyHours: number;
    interviewDate: string;
  };
  appearance: {
    theme: ThemeChoice;
    accent: AccentName;
    /** Which section of the app the sidebar is showing. */
    mode: "learn" | "algo" | "type";
    density: "comfortable" | "compact";
    fontScale: number;
    readingFont: "sans" | "serif";
    reducedMotion: boolean;
    sidebarCollapsed: boolean;
  };
  editor: {
    assists: boolean;
    closeBrackets: boolean;
    lineNumbers: boolean;
    wordWrap: boolean;
    highlightActiveLine: boolean;
    tabSize: 2 | 4;
    fontSize: number;
    runShortcut: "ctrl-enter" | "shift-enter";
  };
  learning: {
    language: CourseLanguage;
    /** The active product. Mastery catalogs remain coming soon. */
    course: Course;
    /** Company whose interview bar shapes the adaptive SWE path. */
    targetCompany: string;
    coldByDefault: boolean;
    askCalibration: boolean;
    showReferenceSolution: boolean;
    hintsAfterAttempts: number;
    dailyMinutes: number;
    autoAdvanceReps: boolean;
  };
  watch: {
    defaultMode: "watch" | "read";
    autoplay: boolean;
    rate: number;
    muted: boolean;
    /** "system" = the OS voices; "natural" = Kokoro, downloaded once. */
    engine: "system" | "natural";
    voiceURI: string | null;
    neuralVoice: string;
    holdScale: number;
    animateCode: boolean;
    /** AI tutor model: "auto" picks on-device by device, fast/smart force a
     * size, "cloud" uses a hosted model (works on any device). */
    tutorTier: "auto" | "fast" | "smart" | "cloud";
  };
  scheduler: {
    interleave: boolean;
    newPerDay: number;
    reviewCap: number;
    recallMinutes: number;
    patternMinutes: number;
  };
}

export const ACCENTS: { id: AccentName; label: string; swatch: string }[] = [
  { id: "ochre", label: "Ochre", swatch: "#a86a12" },
  { id: "coral", label: "Coral", swatch: "#c96442" },
  { id: "blue", label: "Blue", swatch: "#3b76d9" },
  { id: "violet", label: "Violet", swatch: "#7c5cd6" },
  { id: "emerald", label: "Emerald", swatch: "#2f9668" },
  { id: "rose", label: "Rose", swatch: "#c2456b" },
];

export const DEFAULTS: Settings = {
  profile: {
    track: "faang",
    stage: "internship",
    experience: "restarting",
    preferredLanguages: ["python"],
    weeklyHours: 8,
    interviewDate: "",
  },
  appearance: {
    theme: "dark",
    accent: "violet",
    mode: "learn",
    density: "comfortable",
    fontScale: 1,
    readingFont: "sans",
    reducedMotion: false,
    sidebarCollapsed: false,
  },
  editor: {
    assists: true,
    closeBrackets: true,
    lineNumbers: true,
    wordWrap: true,
    highlightActiveLine: true,
    tabSize: 2,
    fontSize: 13.5,
    runShortcut: "ctrl-enter",
  },
  learning: {
    language: "python",
    course: "swe",
    // Preserved for the saved company-map experiment. The live curriculum is
    // fixed at the maximum preparation level regardless of this legacy value.
    targetCompany: "openai",
    coldByDefault: false,
    askCalibration: true,
    showReferenceSolution: true,
    hintsAfterAttempts: 2,
    dailyMinutes: 50,
    autoAdvanceReps: true,
  },
  watch: {
    defaultMode: "watch",
    autoplay: true,
    rate: 1,
    muted: false,
    // Default to the prerecorded narrator. The `af_heart` voice pack ships as
    // small audio clips (see voicePack.ts) covering the whole course, so a
    // lesson plays real recorded narration with no model download. Only a line
    // with no matching clip falls through to on-device Kokoro synthesis.
    engine: "natural",
    voiceURI: null,
    neuralVoice: "af_heart",
    holdScale: 1,
    animateCode: true,
    tutorTier: "cloud",
  },
  scheduler: {
    interleave: true,
    newPerDay: 12,
    reviewCap: 60,
    recallMinutes: 8,
    patternMinutes: 6,
  },
};

const KEY = "forge.settings.v1";

/** Deep-merges stored settings over defaults so new keys appear on upgrade. */
function hydrate(raw: string | null): Settings {
  if (!raw) return structuredClone(DEFAULTS);
  try {
    const saved = JSON.parse(raw) as Partial<Settings>;
    const merged = structuredClone(DEFAULTS);
    for (const group of Object.keys(merged) as (keyof Settings)[]) {
      Object.assign(merged[group], saved[group] ?? {});
    }
    // The old app could leave a learner inside one of the now-unreleased
    // mastery catalogs. Keep every existing learner on the released path.
    if (merged.learning.course !== "swe") merged.learning.course = "swe";
    // Keep the archived company-map preference deterministic while the live
    // experience uses the single fixed frontier path.
    merged.learning.targetCompany = "openai";
    return merged;
  } catch {
    return structuredClone(DEFAULTS);
  }
}

interface Store {
  settings: Settings;
  update: <G extends keyof Settings>(
    group: G,
    patch: Partial<Settings[G]>,
  ) => void;
  resetGroup: (group: keyof Settings) => void;
  resetAll: () => void;
  /** Resolved light/dark after applying the system preference. */
  resolvedTheme: "light" | "dark";
}

const SettingsContext = createContext<Store | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    hydrate(localStorage.getItem(KEY)),
  );
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof matchMedia === "function" &&
      matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const resolvedTheme =
    settings.appearance.theme === "system"
      ? systemDark
        ? "dark"
        : "light"
      : settings.appearance.theme;

  // Everything visual is driven by attributes and custom properties on <html>,
  // so a theme change is one repaint rather than a re-render of the tree.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const { accent, density, fontScale, readingFont, reducedMotion } =
      settings.appearance;

    root.dataset.theme = resolvedTheme;
    root.dataset.accent = accent;
    root.dataset.density = density;
    root.dataset.reading = readingFont;
    root.dataset.motion = reducedMotion ? "reduced" : "full";
    root.style.setProperty("--font-scale", String(fontScale));
    root.style.setProperty("--editor-size", `${settings.editor.fontSize}px`);
    root.style.colorScheme = resolvedTheme;
  }, [settings, resolvedTheme]);

  const value = useMemo<Store>(
    () => ({
      settings,
      resolvedTheme,
      update: (group, patch) =>
        setSettings((current) => ({
          ...current,
          [group]: { ...current[group], ...patch },
        })),
      resetGroup: (group) =>
        setSettings((current) => ({
          ...current,
          [group]: structuredClone(DEFAULTS[group]),
        })),
      resetAll: () => setSettings(structuredClone(DEFAULTS)),
    }),
    [settings, resolvedTheme],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): Store {
  const store = useContext(SettingsContext);
  if (!store) throw new Error("useSettings used outside SettingsProvider");
  return store;
}
