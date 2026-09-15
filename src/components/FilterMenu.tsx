import { useEffect, useId, useRef, useState } from "react";
import Icon, { type IconName } from "./Icon";

export default function FilterMenu({ label, icon, value, options, onChange }: {
  label: string; icon: IconName; value: string;
  options: { value: string; label: string }[]; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    root.current?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')?.focus();
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return <div className="filter-menu" ref={root} onKeyDown={event => {
    if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    if (open && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const items = [...root.current!.querySelectorAll<HTMLButtonElement>('[role="option"]')];
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      items[event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    }
  }}>
    <button ref={trigger} className="filter-trigger" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} onKeyDown={event => { if (!open && ["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); } }}>
      <Icon name={icon} size={15} /><span>{options.find(option => option.value === value)?.label}</span><Icon name="chevronDown" size={14} />
    </button>
    {open && <div className="filter-popover" id={id} role="listbox" aria-label={label} onBlur={event => { if (!root.current?.contains(event.relatedTarget)) setOpen(false); }}>
      <div className="filter-caption">{label}</div>
      {options.map(option => <button role="option" aria-selected={option.value === value} tabIndex={-1} key={option.value} onClick={() => { onChange(option.value); setOpen(false); trigger.current?.focus(); }}><span>{option.label}</span>{option.value === value && <Icon name="check" size={14} />}</button>)}
    </div>}
  </div>;
}
