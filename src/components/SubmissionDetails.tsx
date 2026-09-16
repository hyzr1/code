import type { RunResult } from '../types';
import Markdown from './Markdown';
import Icon from './Icon';
export type Submission = { id:number; code:string; result:RunResult; date:string; suiteSize:number; language?:string };
export function submissionStatus(result:RunResult) { return result.ok?'Accepted':result.timedOut?'Time limit exceeded':result.fatal?'Runtime error':'Wrong answer'; }
export default function SubmissionDetails({submission,history}:{submission:Submission;history:Submission[]}){
 const {result}=submission;
 const comparable=history.filter(s=>s.result.ok&&s.suiteSize===submission.suiteSize);
 const max=Math.max(1,...comparable.map(s=>s.result.ms));
 return <div className="submission-details">
   <div className="submission-verdict"><strong className={result.ok?'result-pass':'result-fail'}>{submissionStatus(result)}</strong><span>{result.results.filter(t=>t.passed).length} / {result.results.length} test cases passed</span></div>
   <p className="submission-date">Submitted {new Date(submission.date).toLocaleString()}</p>
   <div className="submission-metrics"><div><span><Icon name="clock" size={14}/>Runtime</span><strong>{result.ms}<small> ms</small></strong><p>Local suite execution</p></div><div><span><Icon name="database" size={14}/>Memory</span><strong>{result.memoryBytes!=null?(result.memoryBytes/1048576).toFixed(2):'—'}<small>{result.memoryBytes!=null?' MB':''}</small></strong><p>{result.memoryBytes!=null?'Peak Python allocations, including tests':'Not available in this browser runtime'}</p></div></div>
   <section className="submission-comparison"><h3>Your accepted submissions</h3>{comparable.length>1?<><div className="runtime-history" aria-label="Runtime of your accepted submissions">{[...comparable].reverse().slice(-20).map(s=><div key={s.id} title={`${s.result.ms} ms · ${new Date(s.date).toLocaleString()}`}><i style={{height:`${Math.max(3,s.result.ms/max*90)}px`}}/><span>{s.result.ms}</span></div>)}</div><p>Milliseconds · same problem and suite size on this device.</p></>:<p>Submit another accepted solution to compare your local runtime.</p>}</section>
   {result.fatal&&<pre className="fatal">{result.fatal}</pre>}
   <details className="submission-source"><summary>Submitted code</summary><Markdown source={`\`\`\`${submission.language ?? "python"}\n${submission.code}\n\`\`\``}/></details>
 </div>;
}
