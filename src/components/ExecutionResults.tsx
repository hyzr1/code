import { InputFields } from "./TestCaseFields";
import { useState } from 'react';
import type { RunResult } from '../types';
import {submissionStatus} from './SubmissionDetails';
export default function ExecutionResults({result,submitted,onContinue}:{result:RunResult;submitted:boolean;onContinue?:()=>void}) {
 const [selected,setSelected]=useState(() => Math.max(0, result.results.findIndex(test => !test.passed)));
 const test=result.results[selected];
 return <div className="execution-results"><div className="execution-verdict"><h2 className={result.ok?'result-pass':'result-fail'}>{result.ok&&!submitted?'Examples passed':submissionStatus(result)}</h2><span>{result.ms} ms</span><span>{result.results.filter(t=>t.passed).length}/{result.results.length} passed</span></div>
 {result.fatal&&<pre className="fatal">{result.fatal}</pre>}
 <div className="result-case-tabs">{result.results.map((t,i)=><button key={i} aria-pressed={selected===i} onClick={()=>setSelected(i)} className={t.passed?'pass':'fail'}><i/>{i+1}</button>)}</div>
 {test&&<div className="case-observation"><div className="case-status">{test.name}<span>{test.passed?'Passed':'Failed'}{test.ms!=null?` · ${test.ms} ms`:''}</span></div>{test.input&&<InputFields input={test.input} />}<label>Output<pre>{test.actual??(test.message?'No return value captured':'This test uses assertions; no return value was captured.')}</pre></label>{test.expected&&<label>Expected<pre>{test.expected}</pre></label>}{test.message&&<pre className="fatal">{test.message}</pre>}{test.logs.length>0&&<label>Console<pre>{test.logs.join('\n')}</pre></label>}</div>}
 {result.logs.length>0&&<label>Console<pre>{result.logs.join('\n')}</pre></label>}
 {onContinue&&<button className="submit-button accepted-continue" onClick={onContinue}>Save solve & continue</button>}
 </div>;
}
