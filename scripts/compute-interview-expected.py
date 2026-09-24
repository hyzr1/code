import contextlib
import io
import json
import sys

payload = json.load(sys.stdin)
scope = {"__name__": "__solution__"}
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(payload["support"], "interview_support.py", "exec"), scope, scope)
    exec(compile(payload["solution"], "solution.py", "exec"), scope, scope)
    subject = scope[payload["exportName"]]
    results = [scope["_hyzr_invoke"](subject, payload["slug"], payload["meta"], values) for values in payload["inputs"]]
print(json.dumps(results, separators=(",", ":")))
