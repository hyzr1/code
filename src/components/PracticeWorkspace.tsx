import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Problem, RunResult } from "../types";
import { runTests } from "../engine/runner";
import Editor from "./Editor";
import Markdown from "./Markdown";
import Icon from "./Icon";

export interface PracticeOutcome { hintsUsed: number; seconds: number; attempts: number; timeToFirstKeystroke?: number }

/** Shared by lecture exercises and the problem library. Run never records a solve. */
export default function PracticeWorkspace({ problem, starter, onComplete, onReviewLesson, label }: {
  problem: Problem; starter?: string; label?: string;
  onComplete: (outcome: PracticeOutcome, passed: boolean) => void;
  onReviewLesson?: () => void;
}) {
  const initial = starter || problem.scaffolds.L2 || problem.scaffolds.L3 || "";
  const draftKey = `hyzr.draft.v2.${problem.id}`;
  const [code, setCode] = useState(() => { try { return localStorage.getItem(draftKey) ?? initial; } catch { return initial; } });
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
  const [split, setSplit] = useState(44);
  const [resetting, setResetting] = useState(false);
  const [saved, setSaved] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(Date.now());
  const firstKey = useRef<number | undefined>(undefined);
  const attempts = useRef(0);
  const busy = useRef(false);
  const mounted = useRef(true);
  const container = useRef<HTMLDivElement>(null);
  const visibleTests = problem.tests.filter(test => !test.hidden);
  const examples = problem.examples ?? visibleTests.map(test => ({ input: test.code, output: "Run to verify" }));
  const runCases = problem.tests.slice(0, Math.max(2, Math.min(3, examples.length))).map(test => ({ ...test, hidden: false }));
  const stressTests = problem.id === "py.nc.two-sum" ? [{
    name: "200 deterministic edge combinations", hidden: true, checks: 200,
    code: `solver = fn()\nfor seed in range(200):\n    left = seed * 17 - 900\n    right = seed * -11 + 307\n    nums = [seed + 5000, left, seed - 7000, right]\n    answer = solver.twoSum(nums, left + right)\n    assert len(answer) == 2 and answer[0] != answer[1]\n    assert nums[answer[0]] + nums[answer[1]] == left + right`,
  }] : problem.id === "py.nc.contains-duplicate" ? [{
    name: "200 deterministic duplicate boundaries", hidden: true, checks: 200,
    code: `solver = fn()\nfor seed in range(200):\n    unique = list(range(seed, seed + 12))\n    assert solver.containsDuplicate(unique) is False\n    unique.insert(seed % 12, unique[(seed * 7) % 12])\n    assert solver.containsDuplicate(unique) is True`,
  }] : [];
  const submitTests = [...problem.tests, ...stressTests];
  const totalChecks = submitTests.reduce((sum, test) => sum + (test.checks ?? 1), 0);
  const difficulty = problem.displayDifficulty ?? (["Easy", "Easy", "Medium", "Hard", "Hard"][Math.max(0, Math.round((problem.difficulty.concept + problem.difficulty.implementation) / 2) - 1)]);

  useEffect(() => { mounted.current = true; const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000); return () => { mounted.current = false; clearInterval(timer); }; }, []);
  useEffect(() => { try { localStorage.setItem(draftKey, code); setSaved(true); } catch { setSaved(false); } }, [code, draftKey]);

  const run = async (submit: boolean) => {
    if (busy.current) return;
    const tests = submit ? submitTests : [...runCases, ...(custom.trim() ? [{ name: "Custom test", code: custom }] : [])];
    if (!tests.length) return;
    busy.current = true; setRunning(true); setSubmitted(submit); setBottomTab("Test result"); setResult(null);
    const source = code;
    try {
      const outcome = await runTests(source, problem.exportName, tests, problem.language);
      if (!mounted.current) return;
      attempts.current += 1; setResult(outcome);
      if (submit) setAcceptedCode(outcome.ok ? source : null);
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

  return <div className="practice-workspace" ref={container} style={{ "--practice-split": `${split}%` } as CSSProperties}>
    <div className="practice-toolbar">
      <span className="practice-context">{label ?? "Algorithm practice"}</span>
      <div className="practice-run-actions">
        <button disabled={running} onClick={() => void run(false)} title="Ctrl+Enter"><Icon name="play" size={15} /> Run</button>
        <button className="submit-button" disabled={running} onClick={() => void run(true)} title="Ctrl+Shift+Enter"><Icon name="upload" size={15} />{running ? "Running…" : "Submit"}</button>
      </div>
      <span className="practice-clock">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
    </div>
    <div className="practice-panels">
      <section className="practice-description">
        <div className="practice-tabs" role="tablist" aria-label="Problem information">{["Description", "Hints", "Solution"].map(name => <button role="tab" aria-selected={tab === name} key={name} onClick={() => chooseTab(name)}>{name}</button>)}</div>
        <div className="practice-prose" role="tabpanel">
          <h1>{problem.title}</h1>
          <div className="practice-badges"><span className={`difficulty difficulty-${difficulty.toLowerCase()}`}>{difficulty}</span><span>{problem.pattern}</span>{onReviewLesson && <button className="ghost small" onClick={onReviewLesson}>Review lecture</button>}</div>
          {tab === "Description" && <><Markdown source={problem.prompt} language={problem.language} />
            <h2>Function contract</h2><p>Implement <code>{problem.exportName}</code> using the starter signature. Return the result; printing alone does not return a value.</p>
            {examples.map((example, index) => <div className="practice-example" key={index}><h3>Example {index + 1}</h3><pre><code>{`Input\n${example.input}\n\nOutput\n${example.output}`}</code></pre></div>)}
            {problem.source && <p className="tiny muted">Reference material: <a href={problem.source} target="_blank" rel="noreferrer">NeetCode</a> · MIT license</p>}
          </>}
          {tab === "Hints" && <><p>Reveal a little help at a time. Try the idea before opening the next hint.</p>{problem.hints.slice(0, hints).map((hint, index) => <div className="practice-example" key={index}><h3>Hint {index + 1}</h3><Markdown source={hint.text} /></div>)}<button disabled={hints >= problem.hints.length} onClick={() => setHints(count => count + 1)}>{hints >= problem.hints.length ? "All hints revealed" : "Reveal next hint"}</button>{hints >= problem.hints.length && <button className="ghost" onClick={() => chooseTab("Solution")}>Read the solution</button>}</>}
          {tab === "Solution" && <>{problem.analysis && <><h2>Approach</h2><Markdown source={problem.analysis.approach} /><p>{problem.analysis.invariant}</p><div className="practice-badges"><span>Time: {problem.analysis.time}</span><span>Space: {problem.analysis.space}</span></div></>}<h2>Reference solution</h2><Markdown source={`\`\`\`${problem.language ?? "javascript"}\n${problem.solution}\n\`\`\``} language={problem.language} />{problem.walkthrough?.map((step, index) => <p key={index}>{step}</p>)}</>}
        </div>
      </section>
      <div className="practice-splitter" role="separator" aria-label="Resize description and code" aria-orientation="vertical" aria-valuemin={28} aria-valuemax={65} aria-valuenow={split} tabIndex={0}
        onKeyDown={event => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); setSplit(value => Math.max(28, Math.min(65, value + (event.key === "ArrowLeft" ? -2 : 2)))); } }}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const rect = container.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(28, Math.min(65, (event.clientX - rect.left) / rect.width * 100))); }}
        onPointerUp={event => { event.currentTarget.releasePointerCapture(event.pointerId); }} />
      <section className="practice-coding">
        <div className="practice-code-panel">
          <div className="practice-panel-title"><strong><Icon name="code" size={16} /> Code</strong><span>{problem.language === "python" ? "Python 3" : "JavaScript"}</span></div>
          <div className="practice-editor-meta"><span>{problem.exportName}.{problem.language === "python" ? "py" : "js"}</span><button className="ghost small" disabled={running} onClick={() => setResetting(true)}>Reset</button></div>
          {resetting && <div className="practice-reset">Replace your draft with starter code? <button onClick={() => { setCode(initial); setAcceptedCode(null); setResetting(false); }}>Reset code</button><button onClick={() => setResetting(false)}>Cancel</button></div>}
          <Editor value={code} onChange={value => { firstKey.current ??= Math.floor((Date.now() - start.current) / 1000); setCode(value); }} cold={false} language={problem.language} />
          <div className="practice-editor-footer"><span>{saved ? "Draft saved on this device" : "Draft could not be saved"}</span><span>Ctrl + Enter to run</span></div>
        </div>
        <div className="practice-test-panel">
          <div className="practice-tabs" role="tablist" aria-label="Execution">{["Test cases", "Test result"].map(name => <button key={name} role="tab" aria-selected={bottomTab === name} onClick={() => setBottomTab(name)}>{name}</button>)}</div>
          <div className="practice-tests" role="tabpanel" aria-live="polite">
            {bottomTab === "Test cases" ? <><div className="practice-case-tabs">{examples.slice(0, runCases.length).map((_, index) => <button className={selectedCase === index ? "on" : ""} key={index} onClick={() => setSelectedCase(index)}>Case {index + 1}</button>)}<button className={selectedCase === -1 ? "on" : ""} onClick={() => setSelectedCase(-1)}>+ Custom</button></div>{selectedCase === -1 ? <><label htmlFor="custom-test">Custom assertion using <code>fn</code></label><textarea id="custom-test" value={custom} onChange={event => setCustom(event.target.value)} placeholder={problem.language === "python" ? "assert fn(...) == expected" : "expect(fn(...)).toEqual(expected)"} /><p className="tiny muted">Custom tests run locally with Run. Submit uses the official suite.</p></> : <pre><code>{examples[selectedCase] ? `Input\n${examples[selectedCase].input}\n\nExpected output\n${examples[selectedCase].output}` : "Submit to run the test suite."}</code></pre>}</> : running ? <p className="practice-running"><span className="spinner" /> Running {submitted ? `${totalChecks} checks` : `${runCases.length} examples`}…</p> : result ? <div className={result.ok && submitted ? "accepted-card" : ""}>{result.ok && submitted ? <div className="accepted-icon"><Icon name="check" size={28} /></div> : null}<h2 className={result.ok ? "result-pass" : "result-fail"}>{result.ok ? (submitted ? "Accepted" : "Examples passed") : result.timedOut ? "Time limit exceeded" : result.fatal ? "Runtime error" : "Wrong answer"}</h2><p className="small muted">{result.results.filter(test => test.passed).length} / {result.results.length} cases passed · {result.ms} ms{!submitted && result.ok ? ` · Submit to run ${totalChecks} checks` : ""}</p>{result.fatal && <pre className="fatal">{result.fatal}</pre>}{result.results.map((test, index) => { const example = !submitted ? examples[index] : undefined; return <details className={`practice-test ${test.passed ? "pass" : "fail"}`} key={index} open={!test.passed}><summary>{test.passed ? "✓" : "✕"} {test.hidden ? `Hidden case ${index + 1}` : test.name}</summary>{!test.hidden && <pre>{example ? `Input\n${example.input}\n\nExpected\n${example.output}\n\nActual\n${test.passed ? example.output : test.message || "Wrong answer"}` : test.message || "Passed"}{test.logs?.length ? `\n\nConsole\n${test.logs.join("\n")}` : ""}</pre>}{test.hidden && <p>{test.passed ? "Passed" : "Failed"} an additional boundary or stress case.</p>}</details>; })}{result.logs.length > 0 && <><h3>Console</h3><pre>{result.logs.join("\n")}</pre></>}{acceptedCode === code && <button className="submit-button accepted-continue" onClick={() => complete(true)}>Save solve & continue <Icon name="arrowRight" size={15} /></button>}</div> : <p className="muted empty-result">Run your code to see input, expected output, and actual output.</p>}
          </div>
        </div>
      </section>
    </div>
    <div className="practice-footer"><span><strong>{runCases.length}</strong> visible cases · <strong>{totalChecks}</strong> submit checks</span><button className="ghost small" onClick={() => complete(false)}>Skip for now</button></div>
  </div>;
}
