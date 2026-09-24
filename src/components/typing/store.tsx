import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type TypingProgress,
  loadTyping,
  saveTyping,
} from "../../engine/typing";

interface Store {
  typing: TypingProgress;
  /** Mutate a fresh draft; persistence and re-render are handled for you. */
  commit: (mutate: (draft: TypingProgress) => void) => void;
  reset: () => void;
}

const TypingContext = createContext<Store | null>(null);

function clone(p: TypingProgress): TypingProgress {
  return {
    keys: { ...p.keys },
    lessons: { ...p.lessons },
    tests: p.tests.slice(),
    totalSeconds: p.totalSeconds,
    days: { ...p.days },
  };
}

export function TypingProvider({ children }: { children: ReactNode }) {
  const [typing, setTyping] = useState<TypingProgress>(() => loadTyping());

  useEffect(() => {
    saveTyping(typing);
  }, [typing]);

  const commit = useCallback((mutate: (draft: TypingProgress) => void) => {
    setTyping((current) => {
      const draft = clone(current);
      mutate(draft);
      return draft;
    });
  }, []);

  const reset = useCallback(() => {
    setTyping({ keys: {}, lessons: {}, tests: [], totalSeconds: 0, days: {} });
  }, []);

  const value = useMemo<Store>(() => ({ typing, commit, reset }), [typing, commit, reset]);
  return <TypingContext.Provider value={value}>{children}</TypingContext.Provider>;
}

export function useTyping(): Store {
  const store = useContext(TypingContext);
  if (!store) throw new Error("useTyping used outside TypingProvider");
  return store;
}
