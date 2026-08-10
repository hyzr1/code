export interface ProjectMilestone {
  title: string;
  outcome: string;
  tasks: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  resumeSignal: string;
  estimatedHours: string;
  difficulty: "Hard" | "Very hard" | "Capstone";
  stack: string[];
  architecture: string[];
  milestones: ProjectMilestone[];
  acceptanceTests: string[];
  stretchGoals: string[];
  resumeBullet: string;
}

export interface ProjectCheckpoint {
  id: string;
  afterModuleId: string;
  number: string;
  title: string;
  description: string;
  projects: [PortfolioProject, PortfolioProject, PortfolioProject];
}

/**
 * These checkpoints begin only after the learner has files, packages, typing,
 * tests, debugging, performance, async, and parallelism. Before that point a
 * project constrained to already-taught material cannot honestly be
 * portfolio-grade. Each checkpoint offers three deliberately different
 * choices; the detailed shared shipping rubric lives in the project viewer.
 */
export const PROJECT_CHECKPOINTS: ProjectCheckpoint[] = [
  {
    id: "production-python",
    afterModuleId: "py.m7",
    number: "01",
    title: "Ship a production Python tool",
    description: "Turn core Python into a reliable tool with persistence, concurrency, tests, observability, and a real release.",
    projects: [
      {
        id: "pulsegrid",
        title: "PulseGrid",
        tagline: "An asynchronous uptime monitor that detects incidents instead of merely sending requests.",
        summary: "Build a service that checks many HTTP endpoints concurrently, stores measurements, recognizes state changes, and produces a useful incident timeline. It must survive restarts and behave correctly when targets are slow, flaky, or unavailable.",
        resumeSignal: "Shows asynchronous I/O, state machines, persistence, retries, testing, and operational thinking in one understandable system.",
        estimatedHours: "25–35 hours",
        difficulty: "Hard",
        stack: ["Python", "asyncio", "httpx", "SQLite", "Typer", "pytest", "GitHub Actions"],
        architecture: [
          "A scheduler creates checks at a configured interval without launching duplicate checks for the same target.",
          "Async workers enforce a global concurrency limit, per-request timeout, and bounded retry policy with exponential backoff.",
          "A SQLite repository stores targets, raw checks, current state, and incident start/end events.",
          "A CLI exposes add, remove, list, check-now, history, incidents, and export commands.",
        ],
        milestones: [
          { title: "Model and persistence", outcome: "Targets and check history survive a restart.", tasks: ["Define typed Target, CheckResult, and Incident models.", "Create schema migrations and repository methods.", "Reject invalid URLs, intervals, and duplicate target names."] },
          { title: "Concurrent checking", outcome: "At least 50 mock endpoints can be checked safely in one run.", tasks: ["Use a semaphore for concurrency.", "Record DNS/connect/read timeout failures separately.", "Measure latency with a monotonic clock and never block the event loop."] },
          { title: "Incident logic", outcome: "The monitor opens and closes incidents without alert spam.", tasks: ["Require configurable consecutive failures before opening an incident.", "Emit one recovery event when health returns.", "Persist the state transition atomically with its triggering check."] },
          { title: "Operator experience", outcome: "Someone can install and use the tool without reading the source.", tasks: ["Build formatted status and incident commands.", "Add JSON and CSV export.", "Package the CLI and publish a tagged release artifact."] },
        ],
        acceptanceTests: [
          "A test server returning 200, 500, delayed responses, and disconnects produces the correct typed results.",
          "Twenty simultaneous checks never exceed the configured concurrency limit.",
          "Three failures followed by recovery create exactly one closed incident.",
          "Stopping and restarting the process preserves targets, history, and open incidents.",
        ],
        stretchGoals: ["Serve a small read-only dashboard with FastAPI.", "Add webhook notifications with delivery retry and deduplication."],
        resumeBullet: "Built an async uptime-monitoring service with bounded concurrency, persistent incident state, retry/backoff policies, and automated failure-mode tests.",
      },
      {
        id: "repolens",
        title: "RepoLens",
        tagline: "A static-analysis CLI that explains the structure and risk of a Python codebase.",
        summary: "Analyze a real repository without executing it. Parse Python syntax trees, map imports and definitions, calculate maintainability signals, and generate a deterministic report that helps a developer decide where to investigate first.",
        resumeSignal: "Demonstrates AST work, recursive traversal, architecture, performance measurement, caching, packaging, and developer empathy.",
        estimatedHours: "30–40 hours",
        difficulty: "Very hard",
        stack: ["Python", "ast", "pathlib", "SQLite", "Rich", "pytest", "mypy"],
        architecture: [
          "A scanner respects .gitignore-style exclusions and records stable file hashes.",
          "AST visitors extract modules, imports, functions, classes, call sites, branches, and line ranges.",
          "An analysis layer calculates dependency fan-in/fan-out, function length, nesting depth, and approximate cyclomatic complexity.",
          "A report layer renders terminal, JSON, and self-contained HTML outputs from the same result model.",
        ],
        milestones: [
          { title: "Safe repository scan", outcome: "Large repositories are enumerated deterministically.", tasks: ["Normalize paths relative to the repository root.", "Skip virtual environments, generated files, and configured patterns.", "Report unreadable and invalid-syntax files without aborting the scan."] },
          { title: "Semantic extraction", outcome: "Every symbol and import has a source location.", tasks: ["Implement focused AST visitors instead of one giant visitor.", "Distinguish local, standard-library, and third-party imports.", "Preserve nested symbol ownership such as Class.method.inner_function."] },
          { title: "Risk analysis", outcome: "The output identifies concrete review candidates.", tasks: ["Rank files and functions using documented, individually visible metrics.", "Detect dependency cycles and unresolved local imports.", "Explain why each item received its score; never emit an unexplained magic number."] },
          { title: "Incremental operation", outcome: "A second run only analyzes changed files.", tasks: ["Cache parsed results by content hash and tool version.", "Invalidate dependent graph results when imports change.", "Benchmark cold and warm scans on an open-source repository."] },
        ],
        acceptanceTests: [
          "Golden fixture repositories produce stable symbol and dependency snapshots.",
          "Aliased, relative, star, nested, and conditional imports are handled explicitly.",
          "Malformed Python is reported with a path and line without stopping other analysis.",
          "A warm scan of an unchanged repository parses zero source files.",
        ],
        stretchGoals: ["Export a dependency graph in Graphviz DOT format.", "Write a small plugin API for custom rules."],
        resumeBullet: "Created an incremental Python static analyzer using AST visitors, dependency-graph analysis, explainable complexity metrics, and content-addressed caching.",
      },
      {
        id: "dataforge",
        title: "DataForge",
        tagline: "A restart-safe local data pipeline with validation, deduplication, and reproducible manifests.",
        summary: "Process a directory of messy CSV and JSON records into a clean canonical dataset. The pipeline must be idempotent, resumable after failure, parallel where useful, and explicit about every rejected record.",
        resumeSignal: "Looks like real data-engineering work: schemas, lineage, idempotency, parallel execution, failure recovery, and measurable data quality.",
        estimatedHours: "28–38 hours",
        difficulty: "Hard",
        stack: ["Python", "pydantic", "csv/json", "concurrent.futures", "SQLite", "pytest"],
        architecture: [
          "An ingestion layer discovers files and records a content hash, size, source, and processing status in a manifest database.",
          "Typed validators normalize dates, identifiers, currencies, and optional fields into one canonical record.",
          "A transformation pipeline separates pure record transforms from file and database I/O.",
          "A writer uses staging files and atomic rename so partial output is never presented as complete.",
        ],
        milestones: [
          { title: "Dataset contract", outcome: "Valid, repairable, and rejected records are clearly distinguished.", tasks: ["Write a versioned canonical schema.", "Create at least three deliberately different input adapters.", "Emit a rejection file containing source, row, field, value, and reason."] },
          { title: "Reproducible ingestion", outcome: "The same input produces byte-for-byte equivalent normalized output.", tasks: ["Sort discovery and output deterministically.", "Deduplicate records using a documented business key.", "Record source hashes and transform version in the run manifest."] },
          { title: "Parallel pipeline", outcome: "Independent files process concurrently without corrupting shared state.", tasks: ["Choose threads or processes and justify the choice with a benchmark.", "Send database writes through a safe single boundary.", "Support cancellation and mark unfinished files for retry."] },
          { title: "Resume and reporting", outcome: "A failed run resumes instead of starting over.", tasks: ["Skip completed inputs whose content and transform version are unchanged.", "Reprocess changed or previously failed inputs.", "Generate quality totals, rejection rates, duplicates, and runtime per stage."] },
        ],
        acceptanceTests: [
          "Running the same dataset twice creates no duplicate records and skips unchanged work.",
          "Killing the process halfway and restarting yields the same final result as a clean run.",
          "A malformed row is quarantined while valid rows from the same file continue.",
          "Single-worker and multi-worker runs create equivalent normalized output.",
        ],
        stretchGoals: ["Add Parquet output and compare size/read speed.", "Expose pipeline metrics through a tiny local web dashboard."],
        resumeBullet: "Engineered an idempotent, restart-safe data pipeline with typed validation, parallel ingestion, atomic outputs, record-level quarantine, and lineage manifests.",
      },
    ],
  },
  {
    id: "language-tools",
    afterModuleId: "py.m8",
    number: "02",
    title: "Build a language or reasoning engine",
    description: "Use recursion and explicit derivation to build something most students treat as magic: a parser, evaluator, or decision engine.",
    projects: [
      {
        id: "miniql",
        title: "MiniQL",
        tagline: "A query language for JSON and CSV data, implemented from tokenizer to execution plan.",
        summary: "Create a small but coherent language supporting SELECT fields, WHERE expressions, sorting, limits, and aggregate functions. Users should be able to query local data without writing Python.",
        resumeSignal: "A compact database-language project proves parsing, AST design, recursion, error reporting, and execution planning far better than another CRUD application.",
        estimatedHours: "35–50 hours",
        difficulty: "Very hard",
        stack: ["Python", "dataclasses", "typing", "csv/json", "pytest", "Rich"],
        architecture: [
          "A tokenizer converts source text into typed tokens with start/end positions.",
          "A recursive-descent parser produces an AST; it never evaluates while parsing.",
          "A planner resolves field names and turns the AST into filter, project, aggregate, sort, and limit stages.",
          "An executor streams rows where possible and materializes only operations that require it, such as sorting.",
        ],
        milestones: [
          { title: "Lexing and syntax", outcome: "Valid queries produce inspectable ASTs.", tasks: ["Support identifiers, strings, numbers, comparison operators, parentheses, commas, and keywords.", "Implement AND/OR/NOT precedence explicitly.", "Return line, column, offending token, and expected forms in syntax errors."] },
          { title: "Row execution", outcome: "Projection and filtering work for CSV and JSON Lines.", tasks: ["Define one row-source protocol for both formats.", "Implement null/missing-field semantics and document them.", "Keep filter evaluation pure and unit-testable."] },
          { title: "Ordering and aggregation", outcome: "COUNT, SUM, AVG, MIN, MAX, ORDER BY, and LIMIT compose correctly.", tasks: ["Reject invalid aggregate/non-aggregate mixtures.", "Handle empty inputs and nonnumeric values deliberately.", "Explain materializing operations in an EXPLAIN command."] },
          { title: "CLI and documentation", outcome: "A new user can query a sample dataset in five minutes.", tasks: ["Support query text and query-file input.", "Render tables and machine-readable JSON.", "Publish a grammar, examples, limitations, and architecture diagram."] },
        ],
        acceptanceTests: ["A precedence suite proves NOT, comparison, AND, and OR bind correctly.", "CSV and JSONL sources return equivalent results for the same rows.", "Syntax errors identify the exact source span and expected token.", "A 100,000-row filter/limit query runs without loading the full file."],
        stretchGoals: ["Add GROUP BY with multiple keys.", "Add an optimizer that pushes LIMIT or filters toward the source when safe."],
        resumeBullet: "Implemented a SQL-like query engine with a positional tokenizer, recursive-descent parser, typed AST, streaming execution stages, aggregates, and explainable query plans.",
      },
      {
        id: "policytrace",
        title: "PolicyTrace",
        tagline: "An explainable authorization engine with composable rules and decision traces.",
        summary: "Build a policy engine that answers whether a subject may perform an action on a resource. Unlike a pile of if-statements, every decision must include a machine-readable trace showing which rule matched and why.",
        resumeSignal: "Demonstrates security-minded modeling, recursive evaluation, deterministic conflict resolution, audit logs, and careful boundary behavior.",
        estimatedHours: "30–42 hours",
        difficulty: "Hard",
        stack: ["Python", "pydantic", "YAML/JSON", "SQLite", "pytest", "FastAPI optional"],
        architecture: ["A versioned policy schema models subjects, resources, actions, conditions, effects, and priorities.", "A compiler validates references and converts policies into immutable internal nodes.", "An evaluator accepts context and returns Allow/Deny plus a complete recursive decision trace.", "An audit repository records policy version, input identity, decision, trace hash, and timestamp."],
        milestones: [
          { title: "Policy contract", outcome: "Invalid and ambiguous policy files fail before evaluation.", tasks: ["Define operators for equality, membership, numeric comparison, time windows, all, any, and not.", "Require stable rule IDs and descriptions.", "Reject unknown attributes, duplicate IDs, and invalid operator/value combinations."] },
          { title: "Deterministic evaluator", outcome: "The same policy and context always produce the same decision and trace.", tasks: ["Implement deny-overrides and priority rules explicitly.", "Short-circuit evaluation while retaining enough trace to explain it.", "Default to deny when no rule matches."] },
          { title: "Testing and audit", outcome: "Policy behavior is reviewable and regression-safe.", tasks: ["Generate table-driven tests from policy examples.", "Persist decision records without storing secret context values.", "Add a diff command that shows decisions changed between policy versions."] },
          { title: "Usable interface", outcome: "Policies can be validated and evaluated from automation.", tasks: ["Build validate, evaluate, explain, diff, and audit commands.", "Use documented exit codes for allow, deny, and invalid input.", "Ship example policies for an API, document store, and admin console."] },
        ],
        acceptanceTests: ["A missing attribute cannot accidentally become an allow.", "Deny-overrides produces the same result regardless of source rule ordering.", "Nested any/all/not conditions produce an exact, readable trace.", "A version diff identifies every fixture whose final decision changed."],
        stretchGoals: ["Serve evaluation through an authenticated FastAPI endpoint.", "Add property tests proving deny-by-default invariants."],
        resumeBullet: "Built a deny-by-default authorization engine with validated policy compilation, recursive condition evaluation, deterministic conflict handling, and auditable decision traces.",
      },
      {
        id: "stencil",
        title: "Stencil",
        tagline: "A safe template compiler with variables, control flow, includes, and source-mapped errors.",
        summary: "Implement a template language that renders text from structured data. Support interpolation, conditionals, loops, filters, and includes without using eval or executing arbitrary Python.",
        resumeSignal: "Shows language implementation, secure execution boundaries, recursive structures, caching, and thoughtful diagnostics.",
        estimatedHours: "32–45 hours",
        difficulty: "Very hard",
        stack: ["Python", "dataclasses", "pathlib", "html", "pytest", "hypothesis optional"],
        architecture: ["A scanner splits literal text from delimited tags while tracking source spans.", "A parser builds nested If, For, Include, Expression, and Text nodes.", "A renderer evaluates only a whitelisted expression model and escapes HTML by default.", "A loader resolves includes inside an allowed root and caches compiled templates by content hash."],
        milestones: [
          { title: "Compiler front end", outcome: "Templates compile into an inspectable node tree.", tasks: ["Handle nested if/else and for/end blocks with clear unmatched-tag errors.", "Track file, line, and column for every node.", "Keep scanning, parsing, and rendering as separate APIs."] },
          { title: "Safe renderer", outcome: "Untrusted templates cannot import modules or execute Python.", tasks: ["Implement variable paths, literals, boolean conditions, and whitelisted filters yourself.", "Escape HTML interpolation unless explicitly marked safe.", "Detect missing variables with strict and permissive modes."] },
          { title: "Composition", outcome: "Real sites can split templates into reusable files.", tasks: ["Add include with cycle detection.", "Confine file access to a configured template root.", "Cache compiled includes and invalidate them when content changes."] },
          { title: "Developer experience", outcome: "Failures point to the correct source expression.", tasks: ["Render a source excerpt and caret for compile/runtime errors.", "Build a CLI that renders a template with JSON data.", "Document grammar, escaping guarantees, and unsupported behavior."] },
        ],
        acceptanceTests: ["Nested blocks render correctly and unmatched tags report the opening location.", "HTML-special data is escaped by default.", "An include path cannot escape the configured root with .. or a symlink.", "Recursive includes fail with the complete include chain instead of overflowing."],
        stretchGoals: ["Add inheritance with named blocks.", "Generate a source map from output ranges back to template nodes."],
        resumeBullet: "Developed a secure template compiler with nested control-flow parsing, source-span diagnostics, sandboxed expression evaluation, HTML escaping, and cycle-safe cached includes.",
      },
    ],
  },
  {
    id: "linear-patterns",
    afterModuleId: "py.m9",
    number: "03",
    title: "Turn interview patterns into a real product",
    description: "Use hashing, windows, stacks, intervals, and boundary reasoning inside systems where performance changes the user experience.",
    projects: [
      {
        id: "streamguard",
        title: "StreamGuard",
        tagline: "A streaming rate-limit and anomaly engine with bounded memory.",
        summary: "Consume timestamped events and detect bursts, unusual error rates, and sustained latency regressions in real time. The engine must answer from rolling windows without rescanning all history.",
        resumeSignal: "Connects sliding windows, monotonic structures, hashing, memory bounds, concurrency, and observability to a realistic platform problem.",
        estimatedHours: "30–45 hours",
        difficulty: "Very hard",
        stack: ["Python", "asyncio", "FastAPI", "SQLite", "pytest", "Docker"],
        architecture: ["An async ingestion endpoint validates events and assigns a stable event ID.", "Per-key window state tracks counts, errors, and latency statistics with bounded deques.", "A rule engine evaluates burst, ratio, and percentile-like threshold rules.", "An alert store deduplicates open alerts and records recovery transitions."],
        milestones: [
          { title: "Event and window model", outcome: "Out-of-order and duplicate events have explicit behavior.", tasks: ["Define event-time versus processing-time semantics.", "Deduplicate by event ID for a documented retention period.", "Evict expired samples and inactive keys without scanning every key per event."] },
          { title: "Detection engine", outcome: "Three distinct rolling rules operate incrementally.", tasks: ["Implement request-rate burst detection.", "Implement error-ratio detection with a minimum sample floor.", "Track rolling maximum latency with a monotonic deque."] },
          { title: "Service and backpressure", outcome: "The service stays bounded under input bursts.", tasks: ["Put ingestion through a bounded queue.", "Return an explicit overload response instead of consuming unlimited memory.", "Expose queue depth, processed, rejected, duplicate, and alert counters."] },
          { title: "Replay and demonstration", outcome: "A recorded event file deterministically reproduces an incident.", tasks: ["Build normal, burst, degraded, and recovery traffic generators.", "Support accelerated replay while preserving event order.", "Graph or summarize when each rule opened and recovered."] },
        ],
        acceptanceTests: ["Window counts match a brute-force oracle across randomized event streams.", "The monotonic maximum matches max(window) after every insertion and eviction.", "Duplicate event IDs never increment metrics twice.", "A load test proves memory stabilizes under a sustained configured rate."],
        stretchGoals: ["Add approximate percentile tracking and document its error.", "Partition state across multiple worker processes by key."],
        resumeBullet: "Built a bounded-memory streaming anomaly service using incremental windows, monotonic queues, deduplication, backpressure, replayable incidents, and property-tested oracles.",
      },
      {
        id: "slotwise",
        title: "SlotWise",
        tagline: "A scheduling API that resolves conflicts and finds common availability across calendars.",
        summary: "Import multiple calendars, normalize time zones, detect conflicts, and return ranked meeting slots under working-hour, duration, buffer, and participant constraints.",
        resumeSignal: "Uses interval algorithms inside a clear API while demonstrating date/time correctness, persistence, ranking, testing, and product design.",
        estimatedHours: "28–40 hours",
        difficulty: "Hard",
        stack: ["Python", "FastAPI", "PostgreSQL/SQLite", "zoneinfo", "pytest", "Docker"],
        architecture: ["Calendar adapters normalize external events into half-open UTC intervals.", "An interval service merges busy ranges and computes free complements within each participant's local working hours.", "A candidate generator intersects free ranges and ranks valid start times.", "A REST API manages users, calendars, events, constraints, and availability searches."],
        milestones: [
          { title: "Time contract", outcome: "Every stored instant and displayed local time is unambiguous.", tasks: ["Use aware datetimes only and store UTC.", "Define [start, end) interval semantics.", "Handle daylight-saving gaps and repeated local times with explicit validation."] },
          { title: "Calendar core", outcome: "Overlapping and adjacent events normalize correctly.", tasks: ["Merge sorted busy intervals.", "Apply before/after meeting buffers.", "Compute free intervals inside per-day local working-hour windows."] },
          { title: "Group search", outcome: "The API returns valid, ranked slots for many participants.", tasks: ["Intersect participant availability without minute-by-minute scanning.", "Support duration and search-range constraints.", "Rank by earliest time, total preference penalty, and fairness across time zones."] },
          { title: "API and import", outcome: "A reviewer can load fixtures and query the system end to end.", tasks: ["Create idempotent event import using external IDs.", "Return validation errors with field-level details.", "Publish OpenAPI examples and a seeded Docker setup."] },
        ],
        acceptanceTests: ["Touching [9,10) and [10,11) meetings do not overlap unless a buffer is configured.", "Availability remains correct across spring-forward and fall-back transitions.", "Every returned slot is revalidated against every participant calendar.", "Random interval sets match a slow minute-grid oracle on small ranges."],
        stretchGoals: ["Add recurring-event expansion with a bounded query horizon.", "Build a minimal visual week view for the generated options."],
        resumeBullet: "Designed a timezone-safe scheduling API with interval normalization, group-availability intersection, constraint-based ranking, idempotent imports, and property-based correctness tests.",
      },
      {
        id: "logscope",
        title: "LogScope",
        tagline: "A local log search engine with structured parsing, indexes, and live tailing.",
        summary: "Ingest heterogeneous application logs, extract structured fields, index tokens and metadata, and answer filtered phrase/time-range searches substantially faster than scanning raw files.",
        resumeSignal: "Shows practical indexing, parsing, concurrency, incremental ingestion, query design, benchmarking, and careful corruption handling.",
        estimatedHours: "35–48 hours",
        difficulty: "Very hard",
        stack: ["Python", "SQLite FTS5", "watchfiles", "Typer", "pytest", "Rich"],
        architecture: ["Parser plugins convert plain, JSON, and configurable regex logs into one event model.", "An incremental ingester checkpoints file identity and byte offset, then batches atomic index writes.", "A query parser supports terms, quoted phrases, levels, services, and time ranges.", "A tail command streams newly indexed matching events without rereading complete files."],
        milestones: [
          { title: "Robust ingestion", outcome: "Malformed lines are visible but never stop a file.", tasks: ["Store source path, byte offset, timestamp, level, service, message, and parsed fields.", "Detect truncation and rotation using file identity and size.", "Quarantine parse failures with raw text and reason."] },
          { title: "Search index", outcome: "Useful queries avoid linear file scans.", tasks: ["Create full-text and metadata indexes.", "Implement deterministic pagination using a stable cursor.", "Highlight matching terms without corrupting terminal output."] },
          { title: "Query language", outcome: "Users can combine text and structured filters.", tasks: ["Parse level:error service:api after:... timeout syntax.", "Return positional errors for invalid filters.", "Expose an explain option showing the normalized query and database plan."] },
          { title: "Performance proof", outcome: "The README contains reproducible benchmark results.", tasks: ["Generate at least one million realistic fixture lines.", "Measure ingest throughput, index size, cold query, and warm query latency.", "Compare indexed search to a correct streaming scan baseline."] },
        ],
        acceptanceTests: ["Restarting ingestion resumes at the exact committed byte offset.", "Rotation and truncation do not silently skip or duplicate lines.", "Indexed results equal the streaming oracle for a fixture query suite.", "Pagination returns every matching event exactly once while no new data is written."],
        stretchGoals: ["Add a browser UI with live query updates.", "Add a redaction pipeline for configured secrets before persistence."],
        resumeBullet: "Implemented an incremental log search engine with parser plugins, rotation-safe checkpoints, full-text/metadata indexes, composable queries, live tailing, and million-line benchmarks.",
      },
    ],
  },
  {
    id: "advanced-algorithms",
    afterModuleId: "py.m11",
    number: "04",
    title: "Build an algorithmic system",
    description: "Use trees, graphs, heaps, shortest paths, backtracking, and dynamic programming to solve a problem with measurable scale.",
    projects: [
      {
        id: "routecraft",
        title: "RouteCraft",
        tagline: "A multimodal route planner with explainable shortest paths and live closures.",
        summary: "Load a real or generated transport network and find routes optimized for time, distance, transfers, or cost. Support closures and prove the algorithm's result against known fixtures.",
        resumeSignal: "Demonstrates graph modeling, Dijkstra/A*, heaps, dynamic constraints, API design, visualization, and benchmark discipline.",
        estimatedHours: "38–55 hours",
        difficulty: "Very hard",
        stack: ["Python", "FastAPI", "heapq", "SQLite", "pytest", "Leaflet optional"],
        architecture: ["A graph loader validates nodes, directed edges, modes, weights, and transfer connections.", "A routing engine implements Dijkstra and A* behind one strategy interface.", "A constraint layer applies avoided modes, closed edges, transfer penalties, and accessibility rules.", "An API returns path legs, total metrics, explored-node count, and a human-readable explanation."],
        milestones: [
          { title: "Graph contract", outcome: "Invalid and unreachable network data is diagnosed clearly.", tasks: ["Choose adjacency representation and document complexity.", "Validate nonnegative weights and referenced node IDs.", "Create tiny hand-verifiable fixtures before loading a larger network."] },
          { title: "Correct routing", outcome: "Dijkstra and A* return equivalent optimal costs.", tasks: ["Store predecessor edges to reconstruct complete routes.", "Use stale-entry skipping in the heap.", "Design an admissible heuristic and explain why it cannot overestimate."] },
          { title: "Real constraints", outcome: "Closures and preferences alter routes without rebuilding the whole graph.", tasks: ["Overlay temporary closed edges.", "Support multi-objective cost through explicit configurable weights.", "Return a structured no-route explanation."] },
          { title: "Scale and presentation", outcome: "Performance is measured and the route can be inspected visually.", tasks: ["Benchmark queries across increasing graph sizes.", "Report nodes explored and compare Dijkstra with A*.", "Render the chosen route on a simple map or generated coordinate canvas."] },
        ],
        acceptanceTests: ["Both algorithms match hand-calculated optimal paths on weighted fixtures.", "A* never returns a higher cost than Dijkstra for the same valid heuristic.", "Closing every cut edge returns no route rather than crashing or looping.", "Random small graphs match a slower Bellman-Ford oracle for nonnegative weights."],
        stretchGoals: ["Add bidirectional Dijkstra.", "Import a bounded OpenStreetMap extract."],
        resumeBullet: "Built a constrained route-planning service with Dijkstra/A*, admissible heuristics, dynamic closures, path explanations, map visualization, and oracle-based graph tests.",
      },
      {
        id: "searchbox",
        title: "SearchBox",
        tagline: "A document search engine with ranking, autocomplete, snippets, and reproducible relevance tests.",
        summary: "Index a meaningful document corpus and implement retrieval yourself: tokenization, an inverted index, TF-IDF/BM25-style ranking, phrase matching, autocomplete, and highlighted snippets.",
        resumeSignal: "Shows information retrieval, indexing, tries/heaps, ranking tradeoffs, persistence, performance, and evaluation rather than framework wiring.",
        estimatedHours: "40–60 hours",
        difficulty: "Very hard",
        stack: ["Python", "SQLite", "FastAPI", "pytest", "Docker", "minimal web UI"],
        architecture: ["An indexer normalizes documents and writes term postings with document frequency and positions.", "A ranker scores candidate documents and keeps top-k results with a heap.", "A prefix structure serves autocomplete independently from full result ranking.", "An API exposes index status, search, suggestions, document retrieval, and explain-score endpoints."],
        milestones: [
          { title: "Corpus and index", outcome: "Documents can be added, updated, deleted, and recovered after restart.", tasks: ["Choose a licensed corpus and record stable document IDs.", "Store positional postings for phrase queries.", "Update corpus statistics correctly when a document changes."] },
          { title: "Retrieval and ranking", outcome: "Queries return explainable ordered results.", tasks: ["Implement AND/OR term retrieval.", "Implement and document a BM25-style score.", "Return per-term score contributions from an explain endpoint."] },
          { title: "Product features", outcome: "Search feels like a usable application.", tasks: ["Generate safe highlighted snippets around matching terms.", "Build autocomplete using prefix counts and a top-k structure.", "Support filters for source, date, and tags."] },
          { title: "Evaluation", outcome: "Quality claims have evidence.", tasks: ["Create at least 30 judged query/relevant-document fixtures.", "Measure precision@k or reciprocal rank before and after tuning.", "Benchmark index time, index size, and p50/p95 query latency."] },
        ],
        acceptanceTests: ["Adding, replacing, and deleting a document leaves correct corpus and term frequencies.", "Phrase queries require adjacent ordered token positions.", "Every score explanation sums to the final score within floating-point tolerance.", "A heap-based top-k exactly matches a full sort on randomized score sets."],
        stretchGoals: ["Add typo tolerance using edit distance with a strict candidate bound.", "Add offline index segments and merge them incrementally."],
        resumeBullet: "Developed a persistent search engine with positional inverted indexes, BM25-style explainable ranking, heap-based top-k retrieval, autocomplete, relevance evaluation, and latency benchmarks.",
      },
      {
        id: "jobflow",
        title: "JobFlow",
        tagline: "A dependency-aware workflow scheduler with retries, priorities, and critical-path analysis.",
        summary: "Execute jobs described as a directed acyclic graph. Respect dependencies and resource limits, recover from failures, and explain why every queued job is or is not runnable.",
        resumeSignal: "Combines topological sorting, graphs, heaps, concurrency, persistence, retry policy, and state-machine correctness in a recognizable infrastructure project.",
        estimatedHours: "42–60 hours",
        difficulty: "Very hard",
        stack: ["Python", "asyncio", "FastAPI", "PostgreSQL/SQLite", "pytest", "Docker"],
        architecture: ["A workflow compiler validates task IDs, dependencies, resource requirements, timeouts, and retry policy.", "A scheduler tracks remaining dependency counts and a priority heap of runnable tasks.", "Workers claim tasks through a persisted lease so crashes do not lose work.", "An event log records every state transition and rebuilds current state deterministically."],
        milestones: [
          { title: "DAG compiler", outcome: "Invalid workflows fail before any task runs.", tasks: ["Detect missing dependencies, self-dependencies, and cycles.", "Produce one valid topological order.", "Calculate earliest start/finish and critical path from estimated durations."] },
          { title: "Scheduler", outcome: "Only dependency-ready work is dispatched.", tasks: ["Maintain readiness incrementally as tasks finish.", "Prioritize by explicit priority then stable submission order.", "Respect global and named resource concurrency limits."] },
          { title: "Failure recovery", outcome: "Retries and worker crashes produce correct final states.", tasks: ["Implement attempt limits and bounded exponential backoff.", "Use expiring task leases and idempotent completion tokens.", "Propagate terminal dependency failure to blocked descendants with reasons."] },
          { title: "API and observability", outcome: "A user can submit and diagnose workflows.", tasks: ["Expose submit, cancel, retry, status, events, and graph endpoints.", "Show why each pending task is blocked.", "Publish counters and duration histograms by task type and outcome."] },
        ],
        acceptanceTests: ["No task starts before all successful dependencies complete.", "Random DAG executions respect a topological order under many workers.", "A crashed worker's expired lease is reclaimed exactly once logically.", "A cycle returns the actual cycle path in the validation error."],
        stretchGoals: ["Add cron-like scheduled workflow runs.", "Implement worker capability routing and heartbeats."],
        resumeBullet: "Engineered a durable DAG workflow scheduler with incremental topological readiness, priority/resource queues, leased execution, retry/backoff, critical-path analysis, and replayable state transitions.",
      },
    ],
  },
  {
    id: "systems-capstone",
    afterModuleId: "py.m12",
    number: "05",
    title: "Complete one résumé capstone",
    description: "Design, deploy, load-test, and defend a production-style service. This is the project you lead with in interviews.",
    projects: [
      {
        id: "relayq",
        title: "RelayQ",
        tagline: "A durable background-job service with leases, idempotency, retries, scheduling, and dead-letter recovery.",
        summary: "Build the infrastructure behind send-email, transcode-file, or generate-report work. Clients submit jobs through an API; independent workers execute them safely despite duplicates, crashes, and temporary failures.",
        resumeSignal: "A compact distributed-systems capstone covering APIs, queues, delivery semantics, idempotency, persistence, workers, observability, deployment, and load testing.",
        estimatedHours: "55–80 hours",
        difficulty: "Capstone",
        stack: ["Python", "FastAPI", "PostgreSQL", "Redis optional", "pytest", "Docker Compose", "OpenTelemetry"],
        architecture: ["An authenticated API validates submissions and maps an idempotency key to one logical job.", "A transactional queue stores state, availability time, priority, attempts, and an expiring worker lease.", "Workers claim bounded batches, heartbeat leases, and report success or typed failure.", "A dead-letter flow supports inspection, replay, and audit without silently deleting exhausted jobs."],
        milestones: [
          { title: "Durable job contract", outcome: "Submissions are safe to retry.", tasks: ["Define state transitions and reject illegal transitions.", "Implement idempotent submit in one transaction.", "Return the original job for repeated keys with equivalent payload and a conflict for changed payload."] },
          { title: "Worker protocol", outcome: "Multiple workers process jobs without double-completing them.", tasks: ["Claim jobs with an atomic database operation.", "Use lease expiry and heartbeat for crash recovery.", "Require a lease token on completion so a stale worker cannot overwrite a newer attempt."] },
          { title: "Retries and operations", outcome: "Temporary and permanent failures behave differently.", tasks: ["Implement bounded exponential backoff with jitter.", "Move exhausted/permanent failures to a dead-letter state.", "Add cancel, replay, inspect, queue-depth, and oldest-job-age operations."] },
          { title: "Production proof", outcome: "The deployed system has measured behavior under pressure.", tasks: ["Containerize API, database, and at least two workers.", "Add traces/log correlation by job ID and metrics for latency, attempts, outcomes, and lease recovery.", "Load-test throughput and publish the first bottleneck plus one measured improvement."] },
        ],
        acceptanceTests: ["One hundred concurrent submissions using one idempotency key create one logical job.", "Killing a worker mid-job causes recovery after lease expiry without an illegal state.", "A stale worker completion token is rejected.", "Retry timing, attempt limits, cancellation, and dead-letter replay are covered with a controllable clock."],
        stretchGoals: ["Support per-tenant quotas and fair scheduling.", "Add a web console that streams job state changes."],
        resumeBullet: "Designed and deployed a durable background-job platform with transactional idempotency, leased multi-worker execution, crash recovery, backoff/dead-letter flows, tracing, and documented load-test results.",
      },
      {
        id: "linkpulse",
        title: "LinkPulse",
        tagline: "A globally-minded short-link and analytics service with caching, abuse controls, and an event pipeline.",
        summary: "Create short links, redirect with low latency, and aggregate click analytics without making the redirect path wait for reporting work. Treat hot keys, duplicate events, bots, and retention as first-class design problems.",
        resumeSignal: "Transforms a familiar product into a serious systems project involving identifiers, cache policy, asynchronous events, analytics, reliability, and capacity reasoning.",
        estimatedHours: "50–75 hours",
        difficulty: "Capstone",
        stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "worker queue", "Docker", "pytest"],
        architecture: ["A write API creates random or custom aliases with ownership and expiration.", "A redirect API reads through a bounded Redis cache and falls back to the source-of-truth database.", "Redirects emit click events asynchronously; analytics consumers deduplicate and aggregate them.", "An admin API reports links, time buckets, referrers, countries or synthetic regions, and device classes."],
        milestones: [
          { title: "Link lifecycle", outcome: "Create, resolve, update, expire, and delete behavior is unambiguous.", tasks: ["Choose an alias encoding and calculate collision probability.", "Enforce alias uniqueness transactionally.", "Define cache invalidation for update, expiration, and deletion."] },
          { title: "Fast redirect path", outcome: "Analytics cannot make redirects unavailable.", tasks: ["Return redirects from cache/database before analytics aggregation.", "Use bounded timeouts and degrade safely when Redis or the event sink is unavailable.", "Prevent cache penetration for repeatedly missing aliases."] },
          { title: "Analytics pipeline", outcome: "Events are useful despite at-least-once delivery.", tasks: ["Give each click a unique event ID.", "Deduplicate within a documented retention window.", "Aggregate into hourly buckets and preserve enough raw samples for debugging without retaining unnecessary private data."] },
          { title: "Abuse, scale, and deployment", outcome: "The service has defensible production boundaries.", tasks: ["Rate-limit link creation and suspicious resolution patterns.", "Write a capacity estimate for links, redirects, cache memory, events, and database growth.", "Load-test hot-link and broad-link traffic separately and document p50/p95/p99 latency."] },
        ],
        acceptanceTests: ["Concurrent attempts to claim one custom alias produce exactly one success.", "Updating or deleting a cached link cannot return the stale destination afterward.", "Duplicate click events do not inflate aggregate counts.", "Redirects still work from the database when cache and analytics components are unavailable."],
        stretchGoals: ["Add privacy-preserving approximate unique-visitor counts.", "Add multi-region design documentation and a failure matrix without pretending to deploy it."],
        resumeBullet: "Built a low-latency short-link platform with read-through caching, transactional alias creation, asynchronous deduplicated analytics, abuse controls, capacity modeling, and p99 load-test evidence.",
      },
      {
        id: "flagship",
        title: "Flagship",
        tagline: "A feature-flag control plane and low-latency evaluation SDK with audit-safe rollouts.",
        summary: "Teams define flags and targeting rules in a control API; applications evaluate them locally from a versioned snapshot. Support percentage rollouts, segments, kill switches, audit history, and safe propagation.",
        resumeSignal: "Shows API and data modeling, deterministic hashing, consistency choices, caching, streaming/polling updates, SDK design, security, and operational safeguards.",
        estimatedHours: "55–80 hours",
        difficulty: "Capstone",
        stack: ["Python", "FastAPI", "PostgreSQL", "Redis optional", "Python SDK", "Docker", "pytest"],
        architecture: ["A control plane stores environments, flags, typed variations, rules, segments, and immutable audit events.", "A compiler turns database models into signed, versioned evaluation snapshots.", "A Python SDK caches snapshots and evaluates flags locally without a network call per decision.", "A propagation channel uses polling with ETags or server-sent events and safely retains the last valid snapshot."],
        milestones: [
          { title: "Flag model and control API", outcome: "Every change is validated and auditable.", tasks: ["Support boolean, string, and numeric variations.", "Require optimistic version checks on updates.", "Record actor, reason, before/after versions, and timestamp for every mutation."] },
          { title: "Deterministic evaluator", outcome: "The same subject and configuration always produce the same variation.", tasks: ["Implement ordered targeting rules and segment membership.", "Use stable hashing for percentage rollout buckets.", "Return an evaluation reason and matched rule ID with every result."] },
          { title: "Snapshot SDK", outcome: "Applications evaluate during control-plane outages.", tasks: ["Compile and validate a versioned snapshot schema.", "Cache the last verified snapshot atomically.", "Fail closed or use a caller-provided default when no valid snapshot exists; document the choice."] },
          { title: "Safe operations", outcome: "A reviewer can perform and diagnose a rollout.", tasks: ["Build create, update, archive, promote, rollback, and emergency-disable flows.", "Measure propagation delay from committed change to SDK visibility.", "Load-test local evaluation and control-plane snapshot distribution separately."] },
        ],
        acceptanceTests: ["A percentage rollout is stable across process restarts and close to its target distribution over many subject IDs.", "Concurrent edits using one base version allow one commit and reject stale writers.", "An invalid or partially written snapshot never replaces the last valid snapshot.", "Rollback restores behavior while preserving the complete immutable audit history."],
        stretchGoals: ["Add a small React administration console.", "Publish a second minimal SDK in another language and shared cross-language conformance fixtures."],
        resumeBullet: "Created a feature-flag platform with optimistic control-plane updates, deterministic local targeting, signed versioned snapshots, outage-safe SDK caching, immutable audits, and measured propagation latency.",
      },
    ],
  },
];

export const PROJECT_CHECKPOINT_BY_MODULE = new Map(
  PROJECT_CHECKPOINTS.map((checkpoint) => [checkpoint.afterModuleId, checkpoint]),
);

export const PROJECT_SHIPPING_REQUIREMENTS = [
  "Public repository with a concise problem statement, architecture diagram, setup instructions, tradeoffs, limitations, and a five-minute reviewer path.",
  "Small, reviewable commits and an issue or milestone history that shows how the system was decomposed—not one generated code dump.",
  "Automated unit and integration tests for normal behavior, boundaries, and named failure modes; include a coverage report but never optimize only for the percentage.",
  "Formatting, linting, static type checking, and tests enforced in continuous integration on a clean checkout.",
  "Reproducible local setup using a lock file plus containers when external services are required; no secrets committed anywhere.",
  "A deployed instance or downloadable tagged release, seeded demonstration data, and a two-to-four-minute video showing the primary flow and one failure/recovery flow.",
  "A benchmark or load test with hardware, dataset, command, result, first bottleneck, and one measured improvement documented honestly.",
  "A final engineering write-up covering three decisions, two rejected alternatives, one production risk, and what you would change with another week.",
];
