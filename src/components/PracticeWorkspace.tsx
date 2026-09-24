import TestCaseFields, { inputFields } from "./TestCaseFields";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Problem, RunResult } from "../types";
import { runTests } from "../engine/runner";
import { INTERVIEW_VIDEOS } from "../content/python/interviewVideos";
import Whiteboard from "./Whiteboard";
import { interviewCases } from "../engine/interviewCases";
import SubmissionDetails, { submissionStatus, type Submission } from "./SubmissionDetails";
import ExecutionResults from "./ExecutionResults";
import Editor from "./Editor";
import Markdown from "./Markdown";
import Icon from "./Icon";

export interface PracticeOutcome { hintsUsed: number; seconds: number; attempts: number; timeToFirstKeystroke?: number }

function complexityNotation(value: string) {
  const notation = value.match(/\$([^$]+)\$/)?.[1];
  return notation?.replace(/\\log/g, "log").replace(/[{}]/g, "") ?? value.replace(/^Time complexity:\s*/i, "");
}

function descriptionSource(problem: Problem) {
  const names = new Set((problem.examples ?? []).flatMap(example => inputFields(example.input).map(field => field.name)).filter(Boolean));
  // Preserve authored Markdown; mark only known arguments and Python literals.
  return problem.prompt.split(/(```[\s\S]*?```|`[^`]+`)/g).map((part, i) => i % 2 ? part :
    part.replace(/\b[A-Za-z_]\w*\b/g, word => names.has(word) || ['True', 'False', 'None'].includes(word) ? '`' + word + '`' : word)
  ).join('');
}

/** Shared by lecture exercises and the problem library. Run never records a solve. */
export default function PracticeWorkspace({ problem, starter, onComplete, onReviewLesson, label }: {
  problem: Problem; starter?: string; label?: string;
  onComplete: (outcome: PracticeOutcome, passed: boolean) => void;
  onReviewLesson?: () => void;
}) {
  const initial = starter || problem.scaffolds.L2 || problem.scaffolds.L3 || "";
  const draftKey = `hyzr.draft.v2.${problem.id}`;
  const [code, setCode] = useState(() => { try { return localStorage.getItem(draftKey) ?? initial; } catch { return initial; } });
  const [whiteboard, setWhiteboard] = useState(false);
  const [tab, setTab] = useState("Description");
  const [bottomTab, setBottomTab] = useState("Test cases");
  const [selectedCase, setSelectedCase] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [acceptedCode, setAcceptedCode] = useState<string | null>(null);
  const [hints, setHints] = useState(0);
  const [solutionSeen, setSolutionSeen] = useState(false);
  const [custom, setCustom] = useState("");
  const [split, setSplit] = useState(36);
  const [editorHeight, setEditorHeight] = useState(60);
  const historyKey = `hyzr.submissions.v1.${problem.id}`;
  const [history, setHistory] = useState<Submission[]>(() => { try { const saved=JSON.parse(localStorage.getItem(historyKey)||"[]");return Array.isArray(saved)?saved.filter(s=>s?.result&&Array.isArray(s.result.results)&&typeof s.code==="string").slice(0,30):[]; } catch {return [];} });
  const [selectedSubmission,setSelectedSubmission] = useState<Submission|null>(null);
  const [historySaved,setHistorySaved] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [saved, setSaved] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [mobilePane, setMobilePane] = useState<"description" | "code" | "tests">("code");
  const [focusPane, setFocusPane] = useState<"description" | "code" | "tests" | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wrap, setWrap] = useState(false);
  const start = useRef(Date.now());
  const firstKey = useRef<number | undefined>(undefined);
  const attempts = useRef(0);
  const busy = useRef(false);
  const mounted = useRef(true);
  const container = useRef<HTMLDivElement>(null);
  const [commandBar, setCommandBar] = useState<HTMLElement | null>(null);
  useEffect(() => { setCommandBar(document.getElementById("practice-command-bar")); }, []);
  const visibleTests = problem.tests.filter(test => !test.hidden);
  const examples = problem.examples ?? visibleTests.map(test => ({ input: test.code, output: "Run to verify" }));
  const runCases = problem.tests.slice(0, Math.max(2, Math.min(3, examples.length))).map(test => ({ ...test, hidden: false }));
  const submitTests = useMemo(() => [...problem.tests, ...interviewCases(problem)], [problem]);
  const totalChecks = submitTests.reduce((sum, test) => sum + (test.checks ?? 1), 0);
  const difficulty = problem.displayDifficulty ?? (["Easy", "Easy", "Medium", "Hard", "Hard"][Math.max(0, Math.round((problem.difficulty.concept + problem.difficulty.implementation) / 2) - 1)]);

  useEffect(() => { mounted.current = true; const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000); return () => { mounted.current = false; clearInterval(timer); }; }, []);
  useEffect(() => { try { localStorage.setItem(draftKey, code); setSaved(true); } catch { setSaved(false); } }, [code, draftKey]);
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const run = async (submit: boolean) => {
    if (busy.current) return;
    const tests = submit ? submitTests : [...runCases, ...(custom.trim() ? [{ name: "Custom test", code: custom }] : [])];
    if (!tests.length) return;
    busy.current = true; setRunning(true); setSubmitted(submit); setBottomTab("Test result"); setMobilePane("tests"); setResult(null);
    const source = code;
    try {
      const outcome = await runTests(source, problem.exportName, tests, problem.language);
      if (!mounted.current) return;
      attempts.current += 1; setResult(outcome);
      if (submit) {
        setAcceptedCode(outcome.ok ? source : null);
        const entry:Submission={id:Date.now(),date:new Date().toISOString(),code:source,language:problem.language,result:outcome,suiteSize:submitTests.length};
        const next=[entry,...history].slice(0,30);setHistory(next);setSelectedSubmission(entry);setTab("Submission");
        try {localStorage.setItem(historyKey,JSON.stringify(next));setHistorySaved(true);}catch{setHistorySaved(false);}
      }
    } catch (error) {
      if (mounted.current) setResult({ ok: false, fatal: String(error), results: [], logs: [], ms: 0 });
    } finally { busy.current = false; if (mounted.current) setRunning(false); }
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void run(event.shiftKey); } };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });
  const complete = (passed: boolean) => onComplete({ hintsUsed: hints + Number(solutionSeen), seconds: Math.max(1, elapsed), attempts: attempts.current, timeToFirstKeystroke: firstKey.current }, passed);
  const chooseTab = (value: string) => { setTab(value); if (value === "Solution") setSolutionSeen(true); };
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await container.current?.requestFullscreen();
  };
  const toggleFocus = (pane: "description" | "code" | "tests") => setFocusPane(value => value === pane ? null : pane);

  const toolbar = <div className="practice-toolbar" role="toolbar" aria-label={label ?? "Problem actions"}>
      <div className="practice-run-actions">
        <button disabled={running} onClick={() => void run(false)} title="Ctrl+Enter"><Icon name="play" size={15} /> Run</button>
        <button className="submit-button" disabled={running} onClick={() => void run(true)} title="Ctrl+Shift+Enter"><Icon name="upload" size={15} />{running ? "Running…" : "Submit"}</button>
      </div>
      <div className="practice-toolbar-tools"><button className="whiteboard-launch" aria-label="Open whiteboard" title="Whiteboard" onClick={event => { event.currentTarget.focus(); setWhiteboard(true); }}><Icon name="board" size={16} /><span>Whiteboard</span></button><span className="practice-clock"><Icon name="clock" size={13} />{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span><button className="icon-button" aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => void toggleFullscreen()}><Icon name={fullscreen ? "minimize" : "maximize"} size={16} /></button></div>
    </div>;
  return <div className={`practice-workspace ${wrap ? "editor-wrap" : ""}`} data-mobile-pane={mobilePane} data-focus-pane={focusPane ?? "all"} ref={container} style={{ "--practice-split": `${split}%`, "--editor-font-size": `${fontSize}px`, "--editor-height": `${editorHeight}%` } as CSSProperties}>
    {commandBar && !fullscreen ? createPortal(toolbar, commandBar) : toolbar}
    <div className="practice-mobile-nav" role="tablist" aria-label="Workspace panels">
      <button role="tab" aria-selected={mobilePane === "description"} onClick={() => { setMobilePane("description"); setFocusPane(null); }}><Icon name="book" size={15} />Problem</button>
      <button role="tab" aria-selected={mobilePane === "code"} onClick={() => { setMobilePane("code"); setFocusPane(null); }}><Icon name="code" size={15} />Code</button>
      <button role="tab" aria-selected={mobilePane === "tests"} onClick={() => { setMobilePane("tests"); setFocusPane(null); }}><Icon name="checkCircle" size={15} />Tests</button>
    </div>
    <div className="practice-panels">
      <section className="practice-description">
        <div className="practice-tabs" role="tablist" aria-label="Problem information">{["Description", "Hints", "Solution", "Submissions", ...(selectedSubmission ? ["Submission"] : [])].map((name, index) => <button role="tab" aria-selected={tab === name} key={name} onClick={() => chooseTab(name)}>{index === 0 && <Icon name="book" size={14} />}{index === 1 && <Icon name="info" size={14} />}{index === 2 && <Icon name="code" size={14} />}{index >= 3 && <Icon name="history" size={14} />}{name}</button>)}<button className="panel-action" aria-label={focusPane === "description" ? "Restore panels" : "Expand problem"} onClick={() => toggleFocus("description")}><Icon name={focusPane === "description" ? "minimize" : "maximize"} size={15} /></button></div>
        <div className={`practice-prose practice-prose-${tab.toLowerCase()}`} role="tabpanel">
          {!["Submissions","Submission"].includes(tab) && <h1>{problem.title}</h1>}
          {!["Submissions","Submission"].includes(tab) && <div className="practice-badges"><span className={`difficulty difficulty-${difficulty.toLowerCase()}`}>{difficulty}</span><span>{problem.pattern}</span>{onReviewLesson && <button className="ghost small" onClick={onReviewLesson}>Review lecture</button>}</div>}
          {tab === "Description" && <><Markdown source={descriptionSource(problem)} language={problem.language} />
            <div className="practice-contract"><Icon name="info" size={14} /><span>Use the starter signature and return your answer.</span></div>
            {examples.map((example, index) => <div className="practice-example" key={index}><h3>Example {index + 1}</h3><dl className="example-values"><dt>Input</dt><dd><code>{example.input}</code></dd><dt>Output</dt><dd><code>{example.output}</code></dd></dl></div>)}
            {problem.source && <p className="tiny muted">Reference material: <a href={problem.source} target="_blank" rel="noreferrer">NeetCode</a> · MIT license</p>}
          </>}
          {tab === "Submissions" && <div className="submission-list"><h2>Your submissions</h2><p>{historySaved?"Saved on this device":"Storage is full. This session’s submissions could not be saved."}</p>{history.length?<table><thead><tr><th>Status</th><th>Runtime</th><th>Date</th></tr></thead><tbody>{history.map(entry=><tr key={entry.id}><td><button className={entry.result.ok?'result-pass':'result-fail'} onClick={()=>{setSelectedSubmission(entry);setTab("Submission");}}>{submissionStatus(entry.result)}</button></td><td>{entry.result.ms} ms</td><td>{new Date(entry.date).toLocaleDateString()}</td></tr>)}</tbody></table>:<p>Submit your solution to see its results here.</p>}</div>}
          {tab === "Submission" && selectedSubmission && <SubmissionDetails submission={selectedSubmission} history={history}/>}
          {tab === "Hints" && <><p>Reveal a little help at a time. Try the idea before opening the next hint.</p>{problem.hints.slice(0, hints).map((hint, index) => <div className="practice-example" key={index}><h3>Hint {index + 1}</h3><Markdown source={hint.text} /></div>)}<button disabled={hints >= problem.hints.length} onClick={() => setHints(count => count + 1)}>{hints >= problem.hints.length ? "All hints revealed" : "Reveal next hint"}</button>{hints >= problem.hints.length && <button className="ghost" onClick={() => chooseTab("Solution")}>Read the solution</button>}</>}
          {tab === "Solution" && <>{INTERVIEW_VIDEOS[problem.id] && <a className="video-walkthrough" href={`https://www.youtube.com/watch?v=${INTERVIEW_VIDEOS[problem.id]}`} target="_blank" rel="noreferrer"><Icon name="play" size={18}/><span>NeetCode video walkthrough<small>Watch the explanation on YouTube</small></span><span aria-hidden="true">↗</span></a>}{problem.analysis && <><h2>Approach</h2><Markdown source={problem.analysis.approach} /><section className="solution-invariant"><span>Key idea</span><p>{problem.analysis.invariant}</p></section><div className="solution-complexity"><span>Time</span><strong>{complexityNotation(problem.analysis.time)}</strong></div></>}<h2>Reference solution</h2>{problem.source && <p className="community-reference"><a href={problem.source} target="_blank" rel="noreferrer">Explore NeetCode explanations ↗</a></p>}<Markdown source={`\`\`\`${problem.language ?? "python"}\n${problem.solution}\n\`\`\``} language={problem.language} />{problem.walkthrough?.map((step, index) => <Markdown key={index} source={step} language={problem.language} />)}</>}
        </div>
      </section>
      <div className="practice-splitter" role="separator" aria-label="Resize description and code" aria-orientation="vertical" aria-valuemin={28} aria-valuemax={65} aria-valuenow={split} tabIndex={0}
        onKeyDown={event => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); setSplit(value => Math.max(28, Math.min(65, value + (event.key === "ArrowLeft" ? -2 : 2)))); } }}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const rect = container.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(28, Math.min(65, (event.clientX - rect.left) / rect.width * 100))); }}
        onPointerUp={event => { event.currentTarget.releasePointerCapture(event.pointerId); }} />
      <section className="practice-coding">
        <div className="practice-code-panel">
          <div className="practice-panel-title"><strong><Icon name="code" size={16} /> Code</strong><div className="editor-tools"><select aria-label="Editor font size" value={fontSize} onChange={event => setFontSize(Number(event.target.value))}><option value={12}>12px</option><option value={14}>14px</option><option value={16}>16px</option><option value={18}>18px</option></select><button className={wrap ? "on" : ""} aria-pressed={wrap} title="Toggle line wrap" aria-label="Toggle line wrap" onClick={() => setWrap(value => !value)}><Icon name="wrap" size={15} /></button><button aria-label="Reset code" title="Reset code" disabled={running} onClick={() => setResetting(true)}><Icon name="refresh" size={15} /></button><button aria-label={focusPane === "code" ? "Restore panels" : "Expand editor"} title="Expand editor" onClick={() => toggleFocus("code")}><Icon name={focusPane === "code" ? "minimize" : "maximize"} size={15} /></button></div></div>
          <div className="practice-editor-meta"><span>{problem.exportName}.py</span><span>Python 3</span></div>
          {resetting && <div className="practice-reset">Replace your draft with starter code? <button onClick={() => { setCode(initial); setAcceptedCode(null); setResetting(false); }}>Reset code</button><button onClick={() => setResetting(false)}>Cancel</button></div>}
          <Editor value={code} onChange={value => { firstKey.current ??= Math.floor((Date.now() - start.current) / 1000); setCode(value); }} cold={false} language={problem.language} wordWrap={wrap} />
          <div className="practice-editor-footer"><span>{saved ? "Draft saved on this device" : "Draft could not be saved"}</span><span>Ctrl + Enter to run</span></div>
        </div>
        <div className="practice-horizontal-splitter" role="separator" aria-label="Resize editor and tests" aria-orientation="horizontal" aria-valuemin={25} aria-valuemax={80} aria-valuenow={editorHeight} tabIndex={0} onKeyDown={event=>{if(["ArrowUp","ArrowDown"].includes(event.key)){event.preventDefault();setEditorHeight(n=>Math.max(25,Math.min(80,n+(event.key==="ArrowUp"?-3:3))));}}} onPointerDown={event=>event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId)){const rect=event.currentTarget.parentElement!.getBoundingClientRect();setEditorHeight(Math.max(25,Math.min(80,(event.clientY-rect.top)/rect.height*100)));}}} onPointerUp={event=>event.currentTarget.releasePointerCapture(event.pointerId)}/>
        <div className="practice-test-panel">
          <div className="practice-tabs" role="tablist" aria-label="Execution">{["Test cases", "Test result"].map((name, index) => <button key={name} role="tab" aria-selected={bottomTab === name} onClick={() => setBottomTab(name)}><Icon name={index === 0 ? "checkCircle" : "chart"} size={14} />{name}</button>)}<button className="panel-action" aria-label={focusPane === "tests" ? "Restore panels" : "Expand tests"} onClick={() => toggleFocus("tests")}><Icon name={focusPane === "tests" ? "minimize" : "maximize"} size={15} /></button></div>
          <div className="practice-tests" role="tabpanel" aria-live="polite">
            {bottomTab === "Test cases" ? <><div className="practice-case-tabs">{examples.slice(0, runCases.length).map((_, index) => <button className={selectedCase === index ? "on" : ""} key={index} onClick={() => setSelectedCase(index)}>Case {index + 1}</button>)}<button className={selectedCase === -1 ? "on" : ""} onClick={() => setSelectedCase(-1)}>+ Custom</button></div>{selectedCase === -1 ? <><label htmlFor="custom-test">Custom assertion using <code>fn</code></label><textarea id="custom-test" value={custom} onChange={event => setCustom(event.target.value)} placeholder={problem.language === "python" ? "assert fn(...) == expected" : "expect(fn(...)).toEqual(expected)"} /><p className="tiny muted">Custom tests run locally with Run. Submit uses the Hyzr test suite.</p></> : (examples[selectedCase] ? <TestCaseFields input={examples[selectedCase].input} output={examples[selectedCase].output} /> : <p>Submit to run the test suite.</p>)}</> : running ? <p className="practice-running"><span className="spinner" /> Running {submitted ? `${totalChecks} checks` : `${runCases.length} examples`}…</p> : result ? <ExecutionResults key={`${submitted}-${result.ms}-${attempts.current}`} result={result} submitted={submitted} onContinue={acceptedCode === code ? () => complete(true) : undefined}/> : <p className="muted empty-result">Run your code to see input, expected output, and actual output.</p>}
          </div>
        </div>
      </section>
    </div>
    {whiteboard && <Whiteboard problemId={problem.id} title={problem.title} onClose={() => setWhiteboard(false)} />}
    <div className="practice-footer"><span><strong>{runCases.length}</strong> visible cases · <strong>{totalChecks}</strong> submit checks</span><button className="ghost small" onClick={() => complete(false)}>Skip for now</button></div>
  </div>;
}
