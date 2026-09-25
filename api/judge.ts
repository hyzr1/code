import { loadPyodide } from "pyodide";
import { get } from "@vercel/blob";
import { INTERVIEW_SUPPORT } from "../src/engine/interviewSupport.js";
import type { RunResult } from "../src/types.js";
import { createRequire } from "node:module";
import { dirname } from "node:path";

export const runtime = "nodejs";
export const maxDuration = 20;

interface PyodideApi {
  runPythonAsync: (source: string) => Promise<unknown>;
  globals: { set: (name: string, value: unknown) => void };
}

interface JudgeProblem {
  exportName: string;
  language: "python";
  tests: Array<{ name: string; code: string; hidden?: boolean; checks?: number }>;
}

let pyodideRuntime: Promise<PyodideApi> | null = null;
let catalogRuntime: Promise<Record<string, JudgeProblem>> | null = null;
let queue: Promise<unknown> = Promise.resolve();
const hits = new Map<string, { start: number; count: number }>();

const HARNESS = String.raw`
import ast, builtins, contextlib, io, inspect, json, time

SAFE_MODULES = {'typing','collections','functools','itertools','heapq','math','random','bisect','copy','json','re','string','statistics','decimal','fractions'}
BLOCKED_NAMES = {'eval','exec','compile','open','input','breakpoint','help','globals','locals','vars','getattr','setattr','delattr','__import__'}

def _guard(source):
    if len(source) > 30000: raise ValueError('Submission is too large')
    tree = ast.parse(source, filename='submission.py')
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names = [item.name.split('.')[0] for item in node.names] if isinstance(node, ast.Import) else [(node.module or '').split('.')[0]]
            if any(name not in SAFE_MODULES for name in names): raise ValueError('Only standard interview libraries may be imported')
        if isinstance(node, ast.Name) and (node.id in BLOCKED_NAMES or node.id.startswith('__')): raise ValueError(f'{node.id} is unavailable in the judge')
        if isinstance(node, ast.Attribute) and node.attr.startswith('__'): raise ValueError('Dunder attribute access is unavailable in the judge')
        if isinstance(node, ast.While) and isinstance(node.test, ast.Constant) and node.test.value is True: raise ValueError('Unbounded loops are unavailable in the judge')
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'range':
            for arg in node.args:
                if isinstance(arg, ast.Constant) and isinstance(arg.value, int) and abs(arg.value) > 1000000: raise ValueError('That range is too large for the judge')
    return tree

def _message(error):
    if isinstance(error, AssertionError): return str(error) or 'Assertion failed'
    return f'{type(error).__name__}: {error}'

async def _judge(code, export_name, tests_json, support):
    started = time.perf_counter(); results = []; capture = io.StringIO()
    try:
        tree = _guard(code)
        scope = {'__name__': '__submission__'}
        exec(support, scope, scope)
        safe_builtins = dict(vars(builtins))
        real_import = safe_builtins['__import__']
        def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
            if name.split('.')[0] not in SAFE_MODULES: raise ImportError('Only standard interview libraries may be imported')
            return real_import(name, globals, locals, fromlist, level)
        for name in BLOCKED_NAMES: safe_builtins.pop(name, None)
        safe_builtins['__import__'] = safe_import
        scope['__builtins__'] = safe_builtins
        with contextlib.redirect_stdout(capture): exec(compile(tree, 'submission.py', 'exec'), scope, scope)
        if export_name not in scope or not callable(scope[export_name]): raise ValueError(f'Define {export_name}.')
        subject = scope[export_name]
    except BaseException as error:
        return json.dumps({'ok':False,'fatal':_message(error),'results':[],'logs':capture.getvalue().splitlines(),'ms':round((time.perf_counter()-started)*1000)})
    try:
        import tracemalloc; tracemalloc.start()
    except BaseException: tracemalloc = None
    for test in json.loads(tests_json):
        case_started=time.perf_counter(); case_capture=io.StringIO(); scope['_hyzr_capture']=[]
        try:
            test_scope=dict(scope); test_scope['fn']=subject
            with contextlib.redirect_stdout(case_capture):
                pending=eval(compile(test['code'],'test.py','exec',flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT),test_scope,test_scope)
                if inspect.isawaitable(pending): await pending
            passed=True; message=None
        except BaseException as error: passed=False; message=_message(error)
        details=scope['_hyzr_capture'][-1] if scope['_hyzr_capture'] else {}
        results.append({**details,'ms':round((time.perf_counter()-case_started)*1000,2),'name':test['name'],'hidden':bool(test.get('hidden',False)),'passed':passed,'message':message,'logs':case_capture.getvalue().splitlines()})
        if not passed and test.get('hidden'): break
    memory=None
    if tracemalloc is not None: memory=tracemalloc.get_traced_memory()[1]; tracemalloc.stop()
    return json.dumps({'memoryBytes':memory,'ok':all(item['passed'] for item in results),'results':results,'logs':capture.getvalue().splitlines(),'ms':round((time.perf_counter()-started)*1000)})
`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function limited(ip: string) {
  const now = Date.now(); const entry = hits.get(ip);
  if (!entry || now - entry.start > 60_000) { hits.set(ip, { start: now, count: 1 }); return false; }
  entry.count += 1; return entry.count > 30;
}

async function pyodide(): Promise<PyodideApi> {
  const require = createRequire(import.meta.url);
  const indexURL = dirname(require.resolve("pyodide/pyodide.mjs"));
  pyodideRuntime ??= loadPyodide({ indexURL }) as unknown as Promise<PyodideApi>;
  return pyodideRuntime;
}

async function catalog(): Promise<Record<string, JudgeProblem>> {
  catalogRuntime ??= (async () => {
    const result = await get("judge/v1/catalog.json", { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) throw new Error("Judge catalog is unavailable");
    return await new Response(result.stream).json() as Record<string, JudgeProblem>;
  })();
  return catalogRuntime;
}

async function execute(problemId: string, code: string): Promise<RunResult> {
  const problem = (await catalog())[problemId];
  if (!problem || problem.language !== "python") throw new Error("Unknown Python problem");
  const tests = problem.tests;
  const py = await pyodide();
  py.globals.set("submission_code", code);
  py.globals.set("submission_name", problem.exportName);
  py.globals.set("submission_tests", JSON.stringify(tests));
  py.globals.set("interview_support", INTERVIEW_SUPPORT);
  await py.runPythonAsync(HARNESS);
  const result = await py.runPythonAsync("await _judge(submission_code, submission_name, submission_tests, interview_support)");
  return JSON.parse(String(result)) as RunResult;
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return json({ error: "Too many submissions. Wait a minute and try again." }, 429);
  let body: { problemId?: string; code?: string };
  try { body = await request.json(); } catch { return json({ error: "Bad request" }, 400); }
  if (!body.problemId || typeof body.code !== "string" || body.code.length > 30_000) return json({ error: "Bad submission" }, 400);
  try {
    const task = queue.then(() => execute(body.problemId!, body.code!));
    queue = task.catch(() => undefined);
    return json(await task);
  } catch (error) {
    console.error("Judge failed", error);
    return json({ error: "The server judge is temporarily unavailable" }, 503);
  }
}
