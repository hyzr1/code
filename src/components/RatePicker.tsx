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
import Icon from "./Icon";

const RATES = [0.8, 1, 1.25, 1.5, 1.75, 2];

export default function RatePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rate: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();
  const selectedIndex = Math.max(0, RATES.indexOf(value));

  const positionMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(Math.max(116, rect.width), window.innerWidth - 16);
    const menuHeight = menuRef.current?.getBoundingClientRect().height || 260;
    const left = Math.min(
      Math.max(8, rect.right - width),
      window.innerWidth - width - 8,
    );
    const below = rect.bottom + menuHeight + 8 <= window.innerHeight;
    setMenuStyle({
      width,
      left,
      top: below
        ? rect.bottom + 7
        : Math.max(8, rect.top - menuHeight - 7),
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
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      const node = event.target as Node;
      if (!rootRef.current?.contains(node) && !menuRef.current?.contains(node)) {
        setOpen(false);
      }
    };
    const closeForFullscreenChange = () => setOpen(false);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("fullscreenchange", closeForFullscreenChange);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("fullscreenchange", closeForFullscreenChange);
    };
  }, [open]);

  const focusOption = (index: number) => {
    const wrapped = (index + RATES.length) % RATES.length;
    optionRefs.current[wrapped]?.focus();
  };

  const openFromKeyboard = (index: number) => {
    setOpen(true);
    requestAnimationFrame(() => focusOption(index));
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openFromKeyboard(selectedIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openFromKeyboard(selectedIndex - 1);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const onOptionKeyDown = (
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
      focusOption(RATES.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const choose = (rate: number) => {
    onChange(rate);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const portalTarget = document.fullscreenElement ?? document.body;

  return (
    <div className="rate-picker rate control-rate" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`rate-trigger ${open ? "open" : ""}`}
        aria-label={`Playback speed: ${value} times`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{value}×</span>
        <Icon name="chevronDown" size={14} />
      </button>

      {open
        ? createPortal(
            <div
              id={menuId}
              ref={menuRef}
              className="rate-menu"
              role="listbox"
              aria-label="Playback speed"
              style={menuStyle}
            >
              <div className="rate-menu-label">Playback speed</div>
              {RATES.map((rate, index) => {
                const active = rate === value;
                return (
                  <button
                    key={rate}
                    ref={(node) => { optionRefs.current[index] = node; }}
                    className={`rate-option ${active ? "active" : ""}`}
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(rate)}
                    onKeyDown={(event) => onOptionKeyDown(event, index)}
                  >
                    <span>{rate}×</span>
                    {active ? <Icon name="check" size={15} /> : null}
                  </button>
                );
              })}
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
}
