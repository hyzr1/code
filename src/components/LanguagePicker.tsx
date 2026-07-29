import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { LANGUAGES } from "../content/language";
import { useSettings } from "../settings";
import type { CourseLanguage } from "../types";
import Icon from "./Icon";

export default function LanguagePicker({
  compact = false,
  onChange,
}: {
  compact?: boolean;
  onChange?: (language: CourseLanguage) => void;
}) {
  const { settings, update } = useSettings();
  const selected = LANGUAGES.find(
    (item) => item.id === settings.learning.language,
  )!;
  const selectedIndex = LANGUAGES.findIndex((item) => item.id === selected.id);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const positionMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(310, window.innerWidth - 24);
    const left = compact
      ? Math.min(rect.right + 14, window.innerWidth - width - 12)
      : Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    const menuHeight = menuRef.current?.getBoundingClientRect().height || 210;
    const below = rect.bottom + menuHeight + 10 <= window.innerHeight;
    setMenuStyle({
      width,
      left: Math.max(12, left),
      top: compact
        ? Math.min(Math.max(12, rect.top), window.innerHeight - menuHeight - 12)
        : below
          ? rect.bottom + 7
          : Math.max(12, rect.top - menuHeight - 7),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [compact, open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const node = event.target as Node;
      if (!rootRef.current?.contains(node) && !menuRef.current?.contains(node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const choose = (language: CourseLanguage) => {
    update("learning", { language });
    onChange?.(language);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const focusOption = (index: number) => {
    const next = (index + LANGUAGES.length) % LANGUAGES.length;
    optionRefs.current[next]?.focus();
  };

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() =>
        focusOption(event.key === "ArrowUp" ? selectedIndex - 1 : selectedIndex),
      );
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const onOptionKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(LANGUAGES.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`language-picker ${compact ? "compact" : ""}`}
    >
      {!compact ? <span className="language-label">Learning language</span> : null}
      <button
        ref={triggerRef}
        type="button"
        className={`language-trigger ${open ? "open" : ""}`}
        aria-label={`Learning language: ${selected.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={compact ? `Learning language: ${selected.label}` : selected.detail}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKey}
      >
        <span
          className="language-monogram"
          style={{ "--language-color": selected.accent } as CSSProperties}
        >
          {compact ? selected.shortLabel : selected.shortLabel.slice(0, 1)}
        </span>
        {!compact ? <span className="language-name">{selected.label}</span> : null}
        {!compact ? <Icon name="chevronDown" size={15} /> : null}
      </button>

      {open
        ? createPortal(
            <div
              id={menuId}
              ref={menuRef}
              className="language-menu"
              role="listbox"
              aria-label="Choose learning language"
              style={menuStyle}
            >
              <div className="language-menu-head">Switch language</div>
              {LANGUAGES.map((language, index) => {
                const active = language.id === selected.id;
                return (
                  <button
                    key={language.id}
                    ref={(node) => { optionRefs.current[index] = node; }}
                    className={`language-option ${active ? "active" : ""}`}
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(language.id)}
                    onKeyDown={(event) => onOptionKey(event, index)}
                  >
                    <span
                      className="language-monogram"
                      style={{ "--language-color": language.accent } as CSSProperties}
                    >
                      {language.shortLabel}
                    </span>
                    <span className="language-option-copy">
                      <strong>{language.label}</strong>
                      <small>{language.detail}</small>
                    </span>
                    {active ? <Icon name="check" size={16} /> : null}
                  </button>
                );
              })}
              <p>Progress is saved separately for each language.</p>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
