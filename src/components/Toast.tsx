import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import Icon from "./Icon";

interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  title: string;
  detail?: string;
  leaving?: boolean;
}

interface Store {
  toast: (kind: Toast["kind"], title: string, detail?: string) => void;
}

const ToastContext = createContext<Store | null>(null);

/**
 * Corner toasts rather than an inline banner.
 *
 * An inline notice pushes the page down as it appears and again as it leaves,
 * which moves whatever the reader was looking at. A toast occupies its own
 * layer and costs the layout nothing.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (kind: Toast["kind"], title: string, detail?: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { id, kind, title, detail }]);

      // Mark leaving first so the exit animation can run, then drop it.
      setTimeout(() => {
        setToasts((current) =>
          current.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
        );
        setTimeout(
          () => setToasts((current) => current.filter((t) => t.id !== id)),
          180,
        );
      }, 3200);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind} ${t.leaving ? "leaving" : ""}`}>
            <Icon
              name={t.kind === "error" ? "info" : "checkCircle"}
              size={17}
            />
            <div className="body">
              <div className="title">{t.title}</div>
              {t.detail ? <div className="detail">{t.detail}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Store {
  const store = useContext(ToastContext);
  if (!store) throw new Error("useToast used outside ToastProvider");
  return store;
}
