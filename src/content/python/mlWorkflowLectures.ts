import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_WORKFLOW_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m2_4.l1", atomId: "py.atom.ml.experiment-tracking", conceptId: "py.ml.experiment-tracking",
    title: "An experiment result needs a complete identity", requires: ["py.ml.torch-reproducibility"],
    vocabulary: [["configuration", "the explicit parameter values controlling a run"], ["artifact", "a saved output such as a model, metric table, or plot"], ["data version", "an identifier for the exact input snapshot"], ["code version", "an identifier for the exact source revision"], ["run ID", "a unique identifier linking one execution to its records"], ["lineage", "the chain from inputs and settings to produced artifacts"]],
    opening: "A metric without its code, data, and configuration is a rumor. Experiment tracking makes every result traceable enough to reproduce, compare, and audit.",
    outcome: "You will create a canonical configuration, derive a run identity, record environment and input versions, and link metrics and artifacts to one run.",
    why: "When two runs differ, a complete record lets you identify the changed variable instead of guessing from notebook history or filenames.",
    mentalModel: "Every run receives a case file. It names the recipe, ingredients, kitchen, measurements, and outputs. A metric never travels without its case number.",
    firstTitle: "Make configuration explicit and stable", firstIntro: "A frozen dataclass lists run controls. Canonical JSON sorts keys before hashing, so dictionary insertion order cannot change the configuration fingerprint.",
    firstCode: `from dataclasses import asdict, dataclass
from hashlib import sha256
import json

@dataclass(frozen=True)
class TrainConfig:
    learning_rate: float
    batch_size: int
    epochs: int
    seed: int

config = TrainConfig(learning_rate=0.001, batch_size=64, epochs=20, seed=2026)
canonical = json.dumps(asdict(config), sort_keys=True, separators=(",", ":"))
config_id = sha256(canonical.encode()).hexdigest()[:12]
print(canonical)
print("config ID", config_id)`,
    firstTrace: "Every training control has a name and type. The canonical string is deterministic. Changing one value changes the fingerprint, while reordering dictionary keys does not.",
    secondTitle: "Link inputs, outputs, and measurements", secondIntro: "A run record combines code revision, data snapshot, configuration, environment, status, metrics, and artifact locations under one ID.",
    secondCode: `import platform
from datetime import datetime, timezone

run_record = {
    "run_id": f"run-{config_id}",
    "started_at": datetime.now(timezone.utc).isoformat(),
    "code_revision": "git:9e6b1a9",
    "data_version": "customers:sha256:91ac",
    "configuration": asdict(config),
    "environment": {"python": platform.python_version()},
    "status": "completed",
    "metrics": {"validation_loss": 0.284, "validation_accuracy": 0.913},
    "artifacts": {"model": "models/run-model.pt", "report": "reports/run.html"},
}
print(json.dumps(run_record, indent=2, sort_keys=True))`,
    secondTrace: "The record answers which source and data ran, with which settings, in which environment, and what it produced. Real systems should use immutable artifact versions rather than overwrite paths.",
    mistake: "Do not encode important settings only inside a filename such as `best_final_v7`. Store structured fields, record failed runs too, and never log secrets or private raw data inside experiment metadata.",
    checkpoint: "Why is a validation score insufficient without code and data versions?",
    checkpointAnswer: "The score cannot be reproduced or compared fairly if the implementation or evaluated examples changed. Versions identify the exact experiment inputs.",
    remember: "Give every run a unique identity and record configuration, code, data, environment, status, metrics, and immutable artifacts. Tracking turns results into evidence.",
    checks: [q("What should a run record identify?", ["Code, data, configuration, environment, metrics, and artifacts", "Only the best metric", "Only the researcher's name"], 0, "A result needs its full lineage.", ["Correct. Status and timestamps are also useful.", "A lone metric cannot be reproduced.", "Authorship alone does not describe execution."]), q("Why use canonical configuration serialization?", ["Equivalent configurations receive stable fingerprints", "It makes every model accurate", "It hides parameter values"], 0, "Sorted keys and fixed separators remove irrelevant formatting differences.", ["Correct. Meaningful changes still alter the hash.", "Tracking does not guarantee model quality.", "The configuration remains inspectable."])],
  },
  {
    lessonId: "py.mc.m2_4.l2", atomId: "py.atom.ml.profiling-bottlenecks", conceptId: "py.ml.profiling-bottlenecks",
    title: "Profile the whole step before optimizing one line", requires: ["py.ml.experiment-tracking"],
    vocabulary: [["profile", "a measurement of where runtime or memory is spent"], ["bottleneck", "the stage limiting end-to-end throughput"], ["latency", "time for one unit of work"], ["throughput", "units of work completed per time interval"], ["synchronization", "waiting for queued work to finish before continuing"], ["peak memory", "the highest memory use during a measured interval"]],
    opening: "Slow training can come from reading data, Python transforms, tensor copies, model compute, synchronization, or logging. Measure the full step before changing code.",
    outcome: "You will time pipeline stages, calculate throughput, profile function calls and peak memory, and explain why asynchronous GPU timing needs synchronization.",
    why: "Optimizing a small visible loop is wasted work when disk loading or device copies own most of the wall-clock time.",
    mentalModel: "A training step is a relay race. Time every handoff and runner. Speeding up the fastest runner does not change the finish time when another stage blocks the race.",
    firstTitle: "Measure stages and end-to-end throughput", firstIntro: "A small timer records named stages. Repeated measurements matter because one run includes warmup and operating-system noise.",
    firstCode: `from contextlib import contextmanager
from time import perf_counter
import numpy as np

timings = {}
@contextmanager
def timed(name):
    start = perf_counter()
    yield
    timings[name] = perf_counter() - start

with timed("prepare"):
    batch = np.random.default_rng(7).normal(size=(2000, 200))
with timed("compute"):
    result = np.tanh(batch @ np.ones((200, 32)))
with timed("summarize"):
    metric = float(result.mean())

print({name: round(value, 4) for name, value in timings.items()})
print("examples per second", round(len(batch) / sum(timings.values())))`,
    firstTrace: "Each stage receives wall-clock seconds, and total examples divided by total time gives throughput. Repeat the run and report distributions before claiming an improvement.",
    secondTitle: "Find call time and memory peaks", secondIntro: "cProfile identifies cumulative function time. Tracemalloc measures Python-managed allocations. Device memory requires framework-specific tools because it lives outside Python's allocator.",
    secondCode: `import cProfile
import io
import pstats
import tracemalloc

def workload():
    values = [number * number for number in range(50_000)]
    return sum(values)

tracemalloc.start()
profiler = cProfile.Profile()
profiler.enable()
answer = workload()
profiler.disable()
current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()

report = io.StringIO()
pstats.Stats(profiler, stream=report).sort_stats("cumulative").print_stats(5)
print("answer", answer, "peak MB", round(peak / 1_000_000, 3))
print(report.getvalue())`,
    secondTrace: "The call report attributes cumulative CPU time to functions. Peak memory captures the temporary list. On CUDA, synchronize around wall-clock timing or use CUDA events because kernels launch asynchronously.",
    mistake: "Do not benchmark in a different shape, batch size, device, precision, or data path from production. Record the environment and verify that an optimization preserves outputs within an accepted tolerance.",
    checkpoint: "Why can ordinary CPU wall-clock timing understate a CUDA operation's duration?",
    checkpointAnswer: "CUDA calls often queue work and return before the GPU finishes. Synchronize or use device events so the measured interval includes actual kernel execution.",
    remember: "Measure end-to-end latency, throughput, stage time, synchronization, and peak memory under realistic conditions. Optimize the largest verified bottleneck and remeasure correctness and speed.",
    checks: [q("What should be optimized first?", ["The largest measured bottleneck", "The shortest-looking function", "Any line containing a loop"], 0, "End-to-end measurements identify the limiting stage.", ["Correct. Then remeasure the whole workflow.", "Code appearance does not reveal impact.", "A compiled loop may already be fast."]), q("Why repeat benchmarks?", ["Runtime varies because of warmup and system noise", "To guarantee a causal claim", "To change the algorithm secretly"], 0, "A distribution is more reliable than one lucky timing.", ["Correct. Report representative statistics.", "Repeated timing alone does not establish every causal factor.", "The code and conditions should stay controlled."])],
  },
  {
    lessonId: "py.mc.m2_4.l3", atomId: "py.atom.ml.gpu-workflow", conceptId: "py.ml.gpu-workflow",
    title: "GPU speed depends on memory movement and enough parallel work", requires: ["py.ml.profiling-bottlenecks"],
    vocabulary: [["accelerator", "specialized hardware for parallel numerical work"], ["device memory", "memory directly accessible to the accelerator"], ["host memory", "CPU-accessible main memory"], ["kernel", "a function executed in parallel on an accelerator"], ["mixed precision", "using lower-precision formats where safe to reduce memory and increase throughput"], ["out of memory", "failure when required device allocation exceeds available capacity"]],
    opening: "A GPU is fast with enough parallel work and nearby data. Tiny kernels and repeated transfers can be slower than CPU execution.",
    outcome: "You will choose a device safely, estimate tensor memory, keep model and batches colocated, and describe batch-size and mixed-precision tradeoffs.",
    why: "Most first GPU failures are device mismatches or out-of-memory errors. A clear memory budget and transfer plan prevents both.",
    mentalModel: "The GPU is a fast workshop across a toll bridge. Send useful shipments, keep materials inside, and avoid repeated crossings.",
    firstTitle: "Estimate memory before allocating", firstIntro: "A tensor's storage is element count times bytes per element. Training also stores gradients, optimizer state, activations, and temporary workspaces.",
    firstCode: `import torch

def tensor_megabytes(shape, dtype=torch.float32):
    elements = 1
    for length in shape:
        elements *= length
    bytes_per_element = torch.empty((), dtype=dtype).element_size()
    return elements * bytes_per_element / 1_000_000

shape = (64, 3, 224, 224)
print("float32 batch MB", round(tensor_megabytes(shape, torch.float32), 2))
print("float16 batch MB", round(tensor_megabytes(shape, torch.float16), 2))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("selected", device)`,
    firstTrace: "Float sixteen needs half the raw bytes of float thirty-two for this batch. That estimate covers only one tensor, not the complete training memory budget.",
    secondTitle: "Move batches once and keep the step on device", secondIntro: "The training step receives a colocated model and batch. Nonblocking transfer is useful only with supported pinned host memory and independent work to overlap.",
    secondCode: `model = torch.nn.Sequential(torch.nn.Linear(4, 8), torch.nn.ReLU(), torch.nn.Linear(8, 2)).to(device)
cpu_batch = torch.randn(16, 4)
batch = cpu_batch.to(device, non_blocking=device.type == "cuda")

model.train()
prediction = model(batch)
loss = prediction.square().mean()
loss.backward()

print("batch device", batch.device)
print("loss", round(loss.item(), 4))
print("parameter device", next(model.parameters()).device)

if device.type == "cuda":
    print("allocated MB", round(torch.cuda.memory_allocated() / 1_000_000, 2))`,
    secondTrace: "The batch crosses the device boundary once. Forward, loss, and backward remain on device. Calling `loss.item()` synchronizes to produce one CPU number, so avoid doing it for every tiny operation.",
    mistake: "Do not respond to out-of-memory errors only by clearing caches. Reduce batch or activation memory, use gradient accumulation or checkpointing, choose suitable precision, and measure the real peak.",
    checkpoint: "Why is copying intermediate tensors to the CPU inside every model layer usually slow?",
    checkpointAnswer: "Each transfer crosses the device boundary and may force synchronization. Keeping the calculation on one device avoids repeated bridge costs and lost parallelism.",
    remember: "Estimate the whole memory budget, colocate model and data, minimize transfers and synchronization, batch enough work, and validate mixed precision for stability and accuracy.",
    checks: [q("What determines a tensor's raw storage size?", ["Element count times bytes per element", "Its variable-name length", "Only the first axis"], 0, "Shape gives element count and dtype gives storage width.", ["Correct. Training needs additional memory too.", "Python names do not affect tensor storage.", "Every axis contributes to element count."]), q("When can a GPU be slower than a CPU?", ["When work is tiny or transfers dominate", "Never", "Only when code has comments"], 0, "Launch and transfer overhead can exceed saved compute time.", ["Correct. Measure end-to-end performance.", "Acceleration depends on workload and system.", "Comments do not execute."])],
  },
  {
    lessonId: "py.mc.m2_4.l4", atomId: "py.atom.ml.notebooks-pipelines", conceptId: "py.ml.notebooks-pipelines",
    title: "Promote exploration into repeatable pipeline stages", requires: ["py.ml.gpu-workflow"],
    vocabulary: [["notebook", "an interactive document useful for exploration and communication"], ["script", "a source file with a defined entry point and repeatable execution"], ["pipeline", "ordered stages that turn versioned inputs into outputs"], ["pure function", "a function whose result depends only on explicit inputs and causes no hidden mutation"], ["checkpoint", "a saved stage output that allows safe resumption"], ["idempotent", "safe to rerun without creating unintended duplicate effects"]],
    opening: "A notebook is excellent for asking questions. It becomes risky when hidden cell order and manual state are required to reproduce the result. Stable work moves into tested functions and stages.",
    outcome: "You will separate pure transformations from orchestration, define stage contracts, fingerprint inputs, and design a pipeline that can rerun or resume safely.",
    why: "Training that only works after clicking notebook cells in one special order cannot be reviewed, scheduled, recovered, or deployed reliably.",
    mentalModel: "The notebook is a sketchbook. The script is a measured blueprint. The pipeline is an assembly line whose stations label inputs, outputs, and completion receipts.",
    firstTitle: "Move stable logic into pure functions", firstIntro: "Each function receives explicit data and configuration. The orchestrator connects stages and records intermediate values without relying on notebook globals.",
    firstCode: `from dataclasses import dataclass

@dataclass(frozen=True)
class PipelineConfig:
    minimum: float
    scale: float

def clean(values, minimum):
    return [value for value in values if value is not None and value >= minimum]

def transform(values, scale):
    return [value * scale for value in values]

def summarize(values):
    return {"count": len(values), "mean": sum(values) / len(values)}

def run_pipeline(raw, config):
    cleaned = clean(raw, config.minimum)
    transformed = transform(cleaned, config.scale)
    return summarize(transformed)

print(run_pipeline([2, None, -1, 5], PipelineConfig(0, 10)))`,
    firstTrace: "The same explicit raw input and configuration produce the same summary. Functions can be unit tested separately, reused from a notebook, and called by a scheduled script.",
    secondTitle: "Fingerprint stages and resume safely", secondIntro: "A stage key combines its name, version, inputs, and configuration. Matching completed keys can reuse cached outputs; changed inputs create new keys.",
    secondCode: `from hashlib import sha256
import json

cache = {}
def stage_key(name, version, payload):
    encoded = json.dumps(payload, sort_keys=True, default=str).encode()
    return f"{name}:{version}:{sha256(encoded).hexdigest()[:10]}"

def run_stage(name, version, payload, function):
    key = stage_key(name, version, payload)
    if key not in cache:
        cache[key] = function(payload)
    return key, cache[key]

payload = {"raw": [2, None, -1, 5], "config": {"minimum": 0, "scale": 10}}
key, result = run_stage("prepare-and-summarize", 1, payload, lambda item: run_pipeline(
    item["raw"], PipelineConfig(**item["config"]),
))
print(key, result)
print("rerun reuses", run_stage("prepare-and-summarize", 1, payload, lambda _: None)[1])`,
    secondTrace: "The repeated identical stage reuses its completed output. Changing data, configuration, or stage version creates another key. A real cache should write outputs atomically and validate them before marking completion.",
    mistake: "Do not make a pipeline stage depend on current working directory, notebook globals, unversioned remote data, or an output that it also mutates in place. Pass dependencies and use immutable versioned paths.",
    checkpoint: "When should notebook exploration become a script or pipeline stage?",
    checkpointAnswer: "When logic becomes stable, repeated, shared, scheduled, expensive, or required for a result. Keep notebooks as clients of tested functions rather than the only implementation.",
    remember: "Explore interactively, promote stable logic into tested functions, orchestrate explicit stage contracts, fingerprint inputs, write atomically, and make reruns and recovery safe.",
    checks: [q("What is a major notebook reproducibility risk?", ["Hidden state and cell execution order", "Markdown headings", "Using a keyboard"], 0, "Outputs may depend on cells run out of order or stale variables.", ["Correct. Restart-and-run-all is a useful test.", "Headings can improve communication.", "Input hardware is unrelated."]), q("Why include stage version in a cache key?", ["Changed logic should not reuse an incompatible old output", "To make every run slower", "To hide input data"], 0, "Logic changes can alter outputs even with identical data.", ["Correct. Version bumps invalidate stale cache entries.", "Safe reuse can make runs faster.", "A fingerprint identifies state; privacy needs separate controls."])],
  },
];

export const ML_WORKFLOW_ATOMS = ML_WORKFLOW_SPECS.map(guidedMasteryAtom);
export const ML_WORKFLOW_CONCEPTS = ML_WORKFLOW_SPECS.map(guidedMasteryConcept);
export const ML_WORKFLOW_LESSON_CONTENT = guidedLessonContent(ML_WORKFLOW_SPECS);
