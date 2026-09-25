import { useEffect, useState } from "react";
import type { SystemDesignQuestion } from "../content/systemDesign";
import Icon from "./Icon";
import Markdown from "./Markdown";
import Whiteboard from "./Whiteboard";

type Tab = "Prompt" | "Hints" | "Solution";

export default function SystemDesignView({ question, complete, onToggleComplete }: {
  question: SystemDesignQuestion;
  complete: boolean;
  onToggleComplete: () => void;
}) {
  const [tab, setTab] = useState<Tab>("Prompt");
  const [hintCount, setHintCount] = useState(0);
  const [board, setBoard] = useState(false);
  const noteKey = `hyzr.system-design.notes.${question.id}`;
  const [notes, setNotes] = useState(() => localStorage.getItem(noteKey) ?? "");

  useEffect(() => { setTab("Prompt"); setHintCount(0); setNotes(localStorage.getItem(noteKey) ?? ""); }, [question.id, noteKey]);
  useEffect(() => { const timer = setTimeout(() => localStorage.setItem(noteKey, notes), 350); return () => clearTimeout(timer); }, [noteKey, notes]);

  return (
    <div className="system-design-page">
      <header className="system-design-header">
        <div><span className="product-eyebrow">Systems design interview</span><h1>{question.title}</h1></div>
        <div className="system-design-actions">
          <button onClick={() => setBoard(true)}><Icon name="board" size={16}/>Whiteboard</button>
          <button className={complete ? "system-complete done" : "system-complete"} onClick={onToggleComplete}><Icon name={complete ? "checkCircle" : "circle"} size={16}/>{complete ? "Completed" : "Mark complete"}</button>
        </div>
      </header>
      <div className="system-design-meta"><span>{question.difficulty}</span><span>{question.category}</span><span><Icon name="clock" size={14}/>{question.minutes} min interview</span></div>

      <nav className="system-design-tabs" aria-label="Question sections">
        {(["Prompt","Hints","Solution"] as Tab[]).map(item => <button key={item} aria-selected={tab === item} onClick={() => setTab(item)}>{item === "Prompt" ? <Icon name="book" size={15}/> : item === "Hints" ? <Icon name="info" size={15}/> : <Icon name="sparkles" size={15}/>} {item}</button>)}
      </nav>

      <div className="system-design-layout">
        <article className="system-design-content">
          {tab === "Prompt" ? <>
            <section className="system-prompt"><h2>Design brief</h2><p>{question.prompt}</p></section>
            <section><h2>Core requirements</h2><ul className="system-checklist">{question.requirements.map(item => <li key={item}><Icon name="checkCircle" size={15}/>{item}</li>)}</ul></section>
            <section><h2>Clarify before designing</h2><p className="system-guidance">A strong interview starts by reducing ambiguity. Ask these questions before drawing components.</p><ol>{question.clarify.map(item => <li key={item}>{item}</li>)}</ol></section>
            <section className="system-framework"><h2>Your 45-minute structure</h2><div><span><b>1</b> Scope</span><span><b>2</b> Estimate</span><span><b>3</b> High level</span><span><b>4</b> Deep dive</span><span><b>5</b> Failures</span></div></section>
          </> : null}
          {tab === "Hints" ? <>
            <h2>Progressive hints</h2><p className="system-guidance">Reveal one hint only after you have committed to an approach.</p>
            {question.hints.slice(0, hintCount).map((hint, index) => <section className="system-hint" key={hint}><span>Hint {index + 1}</span><p>{hint}</p></section>)}
            <button className="system-reveal" disabled={hintCount >= question.hints.length} onClick={() => setHintCount(count => count + 1)}>{hintCount >= question.hints.length ? "All hints revealed" : "Reveal next hint"}</button>
            {hintCount >= question.hints.length ? <button className="ghost" onClick={() => setTab("Solution")}>Compare with the solution</button> : null}
          </> : null}
          {tab === "Solution" ? <><div className="system-solution-note"><Icon name="info" size={16}/><span>One strong design, not the only correct design. Explain your tradeoffs.</span></div><Markdown source={question.solution}/></> : null}
        </article>

        <aside className="system-notes">
          <div><Icon name="pen" size={15}/><strong>Interview notes</strong><span>Saved on this device</span></div>
          <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Requirements, estimates, APIs, data model, bottlenecks…" aria-label="System design notes" />
          <button onClick={() => setBoard(true)}><Icon name="board" size={15}/>Open architecture whiteboard</button>
        </aside>
      </div>
      {board ? <Whiteboard problemId={question.id} title={question.title} onClose={() => setBoard(false)}/> : null}
    </div>
  );
}
