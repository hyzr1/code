# Python Mastery Course — Expansion Roadmap

**Goal:** extend the completed first-principles, Fluent Python, and Production Python spine into full professional mastery without repeating it. Parts 1–3 already exist as authored lectures in `src/content/python/index.ts`; this file defines only the dependency-ordered material still to be produced.

**Ordering principle:** language semantics before framework habits, trustworthy boundaries before networking, and single-threaded correctness before concurrency. Every listed lesson needs an authored atom, retrieval checks, practice where appropriate, and rendered narration before it is playable.

## Part 4 — Language depth & the standard library
*Complete the language model and the standard-library tools that serious Python programs rely on.*

### Module 4.1 — Precise data representations
Choose representations that preserve the meaning of text, numbers, identifiers, and time.
- Bytes, text, and encodings — cross the Unicode/byte boundary explicitly and diagnose decoding failures.
- Decimal, Fraction, and complex numbers — choose arithmetic whose precision and domain match the problem.
- Dates, times, and time zones — represent instants and local civil time without naive-datetime ambiguity.
- Regular expressions — build readable, bounded patterns and know when ordinary string methods are safer.
- Enums and symbolic constants — model a closed set of states without scattering magic strings.
- UUIDs, secrets, and hashing — distinguish identifiers, unpredictable tokens, and one-way digests.

### Module 4.2 — The object model in depth
Understand Python’s lookup and inheritance machinery well enough to design predictable APIs.
- Class, static, and instance methods — choose the receiver and override behavior deliberately.
- Properties and managed attributes — preserve an attribute-shaped API while validating or deriving values.
- Inheritance, MRO, and super — trace cooperative method lookup across multiple inheritance.
- Abstract base classes and protocols — express behavioral contracts without unnecessary inheritance.
- Descriptors — explain the mechanism behind methods, properties, slots, and many framework fields.
- Metaclasses and class creation — customize type construction only when simpler hooks cannot solve the problem.

### Module 4.3 — Functions and dispatch at scale
Compose reusable behavior without hiding control flow or state.
- Lambdas and callable objects — choose the smallest readable representation for behavior passed as data.
- Partial application and operators — bind stable arguments and reuse standard callable adapters.
- Single dispatch — extend behavior by input type without a growing conditional ladder.
- Structural pattern matching — destructure stable data shapes with guarded, exhaustive cases.
- Introspection and signatures — inspect callables safely without coupling business logic to implementation details.

### Module 4.4 — Collections, copying, and memory semantics
Predict identity, equality, lifetime, and storage costs beyond the beginner mental model.
- Equality, hashing, and immutable keys — preserve the contract required by dictionaries and sets.
- Shallow and deep copying — choose which object graph boundaries should remain shared.
- Reference counting and cyclic garbage collection — explain when objects die and why cycles need separate handling.
- Weak references and caches — observe objects without accidentally extending their lifetime.
- Slots and object layout — reduce instance overhead while understanding compatibility trade-offs.

## Part 5 — Building real programs
*Turn correct Python code into installable, observable tools with trustworthy external boundaries.*

### Module 5.1 — Environments, dependencies, and packaging
Make an application reproducible on a clean machine and a library safe to publish.
- Virtual environments and interpreters — isolate projects and verify which Python actually runs a command.
- Dependency resolution and lock files — separate declared constraints from a reproducible environment.
- pyproject.toml and build backends — define metadata, dependencies, tools, and package builds in one standard home.
- Package layouts and resources — import code and bundled data without depending on the working directory.
- Wheels, source distributions, and publishing — build, inspect, and release artifacts through a test index safely.
- Semantic versions and deprecation — evolve a public API without surprising downstream users.

### Module 5.2 — Command-line applications & observability
Give programs stable interfaces and enough evidence to diagnose production behavior.
- Command-line parsing — design subcommands, options, validation, help, and exit codes with argparse.
- Configuration layers — combine defaults, files, environment variables, and flags with explicit precedence.
- Structured logging — emit actionable events with levels, context, handlers, and safe redaction.
- Warnings and deprecation paths — alert callers without turning recoverable migration work into failure.
- Signals and graceful shutdown — stop long-running processes without corrupting in-flight work.

### Module 5.3 — Data formats, databases, and networks
Move data across process boundaries without losing validation, atomicity, or security.
- CSV, TOML, and binary serialization — select a format by interoperability, fidelity, and trust boundary.
- SQLite and SQL parameters — query and update relational data without injection or string-built SQL.
- Transactions and migrations — preserve invariants across multi-step writes and schema evolution.
- HTTP clients — set timeouts, validate status and payloads, retry selectively, and reuse connections.
- Sockets and protocol framing — understand the byte streams underneath higher-level clients.
- Subprocesses — pass arguments without a shell, capture failures, and avoid deadlocks or injection.

### Module 5.4 — Secure boundary design
Treat every external value and capability as untrusted until proven otherwise.
- Validation and parsing — convert external bytes into typed internal values at one explicit boundary.
- Paths, permissions, and temporary files — avoid traversal, races, and unsafe predictable names.
- Secrets and credentials — load, scope, rotate, and redact sensitive values instead of embedding them.
- Safe serialization — recognize why pickle and dynamic evaluation cannot cross an untrusted boundary.
- Resource limits and defensive timeouts — bound memory, input size, recursion, work, and waiting.

## Part 6 — Engineering large Python systems
*Strengthen contracts, tests, performance, and concurrency for code maintained by teams.*

### Module 6.1 — Advanced static typing
Express relationships that simple parameter annotations cannot capture.
- Type variables and generics — preserve type relationships across containers and functions.
- Protocols and structural subtyping — type behavior without forcing a shared base class.
- Unions, narrowing, and TypeGuard — prove which variant is present before using variant-specific operations.
- Overloads, ParamSpec, and callable typing — describe APIs whose return or wrapper signature depends on inputs.
- TypedDict, dataclass, and validation models — distinguish static record shapes from runtime-validated data.
- Strictness and gradual adoption — raise type safety without blocking incremental migration.

### Module 6.2 — Tests with leverage
Build a suite that finds contract failures while remaining fast and refactor-friendly.
- Fixtures and parametrization — remove setup duplication and cover input partitions systematically.
- Test doubles and mocking — replace only a true boundary and assert observable behavior rather than call trivia.
- Property-based testing — generate broad examples from invariants and shrink failures to minimal cases.
- Integration and end-to-end tests — test contracts between real components at the lowest useful layer.
- Nondeterministic and concurrent tests — control clocks, randomness, scheduling assumptions, and eventual assertions.
- Coverage and mutation testing — use absence of executed or challenged behavior as investigation evidence, not a score target.

### Module 6.3 — API quality and maintainability
Make intent visible to users, tools, reviewers, and future maintainers.
- Public API design — keep interfaces small, unsurprising, composable, and difficult to misuse.
- Documentation and executable examples — explain contracts, edge cases, and examples that stay tested.
- Formatting, linting, and pre-commit checks — automate mechanical consistency so review can focus on behavior.
- Dependency direction and architecture — keep policy independent from I/O and frameworks.
- Refactoring with characterization tests — preserve observed behavior while replacing structure safely.

### Module 6.4 — Performance and memory
Find the real bottleneck and optimize it without changing semantics.
- Time profiles and call graphs — locate expensive paths using representative workloads.
- Allocation and memory profiles — distinguish retained objects, temporary churn, and external buffers.
- Algorithm, data layout, and locality — improve complexity and memory access before micro-optimizing syntax.
- Vectorization and native boundaries — know when NumPy, compiled extensions, or another runtime justify their cost.
- Benchmark design — control warmup, variance, setup, and regression thresholds.

### Module 6.5 — Reliable concurrency
Compose async, thread, and process work with cancellation, backpressure, and clean failure.
- Async tasks and structured concurrency — keep child task lifetimes inside an explicit owner scope.
- Cancellation, timeouts, and cleanup — make interruption a normal control path that cannot leak resources.
- Async queues and backpressure — bound producers when consumers cannot keep up.
- Thread synchronization — protect shared invariants with locks, conditions, events, and ownership.
- Executors and process pools — submit blocking or CPU work while controlling serialization and shutdown costs.
- Concurrent failure handling — collect, propagate, or isolate errors without orphaning work.

## Part 7 — Mastery projects & internals
*Optional depth for developers who need to extend Python itself or prove end-to-end engineering skill.*

### Module 7.1 — Import and runtime internals
Read enough of Python’s execution model to debug behavior that ordinary surface syntax cannot explain.
- Import finders, loaders, and caches — trace how a module name becomes one initialized module object.
- Bytecode and the evaluation loop — disassemble functions and connect instructions to source-level cost.
- The GIL across Python implementations — separate CPython guarantees from language guarantees and evolving runtime modes.
- Audit hooks and runtime instrumentation — observe sensitive events without patching every call site.

### Module 7.2 — Extension and distribution choices
Choose a performance or integration boundary that the team can maintain.
- C APIs, CFFI, and binding generators — compare control, safety, portability, and build complexity.
- Stable ABI and binary compatibility — understand why a wheel may work on one interpreter but not another.
- Plugin systems and entry points — discover extensions without importing arbitrary modules eagerly.
- Reproducible releases and supply-chain integrity — sign, attest, scan, and verify what users install.

### Module 7.3 — Professional capstones
Integrate the language, standard library, testing, packaging, and operations into reviewable systems.
- Production CLI capstone — ship an installable data-processing tool with configuration, logs, tests, and failure-safe writes.
- Concurrent service capstone — build a bounded, cancellable worker service with metrics and graceful shutdown.
- Published library capstone — design a typed API, compatibility policy, documentation, wheels, and release automation.
- Performance capstone — profile a real workload and justify each optimization with correctness and benchmark evidence.
