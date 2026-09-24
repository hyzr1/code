import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_EXTREME_SCALE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m12_3.l1",
    atomId: "py.atom.ml.three-dimensional-parallelism",
    conceptId: "py.ml.three-dimensional-parallelism",
    title: "Three-dimensional parallelism",
    requires: ["py.ml.kernel-autotuning"],
    vocabulary: [
      ["parallelism dimension", "one way of splitting work, such as by data, by tensor or by layer"],
      ["decomposition", "a choice of how many devices go to each dimension"],
      ["topology", "which devices are connected by fast links and which are not"],
    ],
    opening:
      "A thousand devices can be arranged many ways. The product of the three splits must equal the device count, and which arrangement you pick changes both the memory per device and the traffic.",
    outcome:
      "You will enumerate valid decompositions of a cluster and compute what each does to per-device memory.",
    why:
      "Only tensor and pipeline splits reduce memory. Data parallelism replicates, so a decomposition heavy on data can leave a model that still does not fit.",
    mentalModel:
      "Picture the cluster as a three-dimensional grid. Every device has a coordinate, and the axes correspond to the three ways work is divided.",
    firstTitle: "The product must match",
    firstIntro:
      "Any decomposition is valid when the three factors multiply to the device count. Several very different arrangements qualify.",
    firstCode: `def layout(total, data, tensor, pipeline):
    used = data * tensor * pipeline
    return used, used == total

for data, tensor, pipeline in [(64, 8, 2), (128, 8, 1),
                               (8, 8, 16), (512, 2, 1)]:
    print(f"data {data:>4} tensor {tensor} pipeline {pipeline:>2}",
          layout(1024, data, tensor, pipeline))`,
    firstTrace:
      "All four use exactly one thousand and twenty-four devices. Nothing in the arithmetic prefers one over another, and they behave completely differently.",
    secondTitle: "Only two axes reduce memory",
    secondIntro:
      "Data parallelism replicates the model on every device. Tensor and pipeline splits divide it, so only they change what has to fit.",
    secondCode: `def per_device_gb(params_billions, tensor, pipeline, bytes_each=16):
    return round(params_billions * bytes_each / (tensor * pipeline), 2)

for tensor, pipeline in [(1, 1), (8, 1), (8, 8), (8, 16)]:
    print("tensor", tensor, "pipeline", pipeline, "->",
          per_device_gb(400, tensor, pipeline), "GB per device")`,
    secondTrace:
      "Six thousand four hundred gigabytes unsplit, down to fifty at tensor eight by pipeline sixteen. The data dimension never appears in this calculation.",
    mistake:
      "Choosing the decomposition without reference to the interconnect. Tensor parallelism exchanges data inside every layer, so it belongs within a fast-linked group; spreading it across slower links makes it the bottleneck.",
    checkpoint:
      "A model does not fit despite five hundred devices of data parallelism. Why?",
    checkpointAnswer:
      "Data parallelism replicates rather than splits. Only tensor and pipeline dimensions reduce what each device must hold.",
    remember:
      "The three factors multiply to the device count; only two of them shrink memory.",
    checks: [
      {
        question: "What must the three parallelism factors satisfy?",
        choices: [
          "Their product equals the device count",
          "Their sum equals the device count",
          "They must be equal",
        ],
        answer: 0,
        explanation: "Each device has one coordinate on each axis.",
        why: [
          "Correct, and many products are valid.",
          "The grid is multiplicative.",
          "Balanced splits are rarely optimal.",
        ],
      },
      {
        question: "Which dimension does not reduce per-device memory?",
        choices: ["Data", "Tensor", "Pipeline"],
        answer: 0,
        explanation: "It replicates the model.",
        why: [
          "Correct. Each replica holds the whole model.",
          "That splits individual operations.",
          "That splits the layers.",
        ],
      },
      {
        question: "Where should tensor parallelism be placed?",
        choices: [
          "Within a group joined by fast links",
          "Across the slowest links",
          "It does not matter",
        ],
        answer: 0,
        explanation: "It communicates inside every layer.",
        why: [
          "Correct, otherwise it becomes the bottleneck.",
          "That is the worst possible placement.",
          "Topology dominates the choice.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_3.l2",
    atomId: "py.atom.ml.communication-overlap",
    conceptId: "py.ml.communication-overlap",
    title: "Communication overlap",
    requires: ["py.ml.three-dimensional-parallelism"],
    vocabulary: [
      ["overlap", "issuing a transfer so it proceeds while computation continues"],
      ["exposed communication", "transfer time that no computation was available to hide"],
      ["critical path", "the sequence of operations that actually determines the step time"],
    ],
    opening:
      "Communication cannot be removed, but it can be made to happen at the same time as computation. What cannot be hidden is whatever exceeds the compute it was hiding behind.",
    outcome:
      "You will compute step time at several overlap fractions and find the point beyond which overlap stops helping.",
    why:
      "Perfect overlap is often assumed and rarely achieved. The gap between the assumed step time and the real one is exposed communication.",
    mentalModel:
      "Picture two tracks running side by side. Transfers hide under computation until the transfer track is longer, and then the excess sticks out.",
    firstTitle: "Partial overlap",
    firstIntro:
      "The hidden portion is the overlap fraction of whichever is shorter. Everything else adds to the step.",
    firstCode: `def step_time(compute_ms, comm_ms, overlap):
    hidden = min(comm_ms, compute_ms) * overlap
    return round(compute_ms + comm_ms - hidden, 2)

for overlap in (0.0, 0.5, 0.9, 1.0):
    print("overlap", overlap, "step ms", step_time(100, 40, overlap))`,
    firstTrace:
      "A hundred and forty milliseconds with no overlap, down to a hundred with perfect overlap. Ninety percent overlap still costs four milliseconds a step.",
    secondTitle: "Overlap has a ceiling",
    secondIntro:
      "Once the transfer is longer than the computation, no amount of overlap hides the excess. The step time is then set by communication.",
    secondCode: `for comm in (20, 100, 200):
    print("comm", comm, "fully overlapped step",
          step_time(100, comm, 1.0))`,
    secondTrace:
      "Twenty and a hundred milliseconds of traffic both hide completely. Two hundred cannot, and the step becomes two hundred — the compute is now what is hidden.",
    mistake:
      "Reporting high accelerator utilization as evidence that communication is free. Overlap makes the device busy, and the transfer is still on the critical path when it exceeds the compute it hides behind.",
    checkpoint:
      "Computation takes a hundred milliseconds and communication two hundred. What is the best possible step time?",
    checkpointAnswer:
      "Two hundred milliseconds. Overlap can hide the compute behind the transfer, but not the other way round.",
    remember:
      "Overlap hides the shorter of the two; the excess is exposed.",
    checks: [
      {
        question: "What does overlap hide?",
        choices: [
          "The shorter of computation and communication",
          "All communication",
          "All computation",
        ],
        answer: 0,
        explanation: "Something has to run underneath.",
        why: [
          "Correct, and the excess stays on the critical path.",
          "Only what fits under the compute.",
          "The same limit applies both ways.",
        ],
      },
      {
        question: "Communication exceeds computation. What sets the step time?",
        choices: ["Communication", "Computation", "Their sum"],
        answer: 0,
        explanation: "The longer track dominates.",
        why: [
          "Correct. Overlap has hit its ceiling.",
          "The compute is now what is hidden.",
          "That would be zero overlap.",
        ],
      },
      {
        question: "Why is high utilization misleading here?",
        choices: [
          "Overlap makes the device busy while the transfer remains critical",
          "Utilization is hard to measure",
          "Utilization ignores memory",
        ],
        answer: 0,
        explanation: "Busy is not the same as productive.",
        why: [
          "Correct. The transfer is still on the critical path.",
          "It is straightforward to measure.",
          "Memory is a separate metric.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_3.l3",
    atomId: "py.atom.ml.fault-tolerant-training",
    conceptId: "py.ml.fault-tolerant-training",
    title: "Fault-tolerant frontier training",
    requires: ["py.ml.communication-overlap"],
    vocabulary: [
      ["mean time between failures", "the average interval before one device fails"],
      ["globally consistent state", "a checkpoint every worker agrees on"],
      ["restart cost", "the time to detect, reschedule and resume after a failure"],
    ],
    opening:
      "One device failing every six years sounds like a non-problem. Sixteen thousand of them makes it several times a day, and every failure stops the entire run.",
    outcome:
      "You will compute expected failures for a cluster and the hours a run loses to them.",
    why:
      "Synchronous training has no partial progress. One worker dying discards the step for every other worker, so the failure rate multiplies by the device count.",
    mentalModel:
      "Picture the run as a chain with sixteen thousand links. It is only as reliable as the product of all of them, and that product falls fast.",
    firstTitle: "Failures scale with the fleet",
    firstIntro:
      "Divide the device-hours by the mean time between failures. The rate is per device, so the count multiplies directly.",
    firstCode: `def expected_failures(devices, mtbf_hours, run_hours):
    return round(devices * run_hours / mtbf_hours, 2)

for devices in (8, 1024, 16384):
    print(devices, "devices over thirty days ->",
          expected_failures(devices, 50000, 720), "failures")`,
    firstTrace:
      "One failure every eight runs at eight devices, fifteen at a thousand, and two hundred and thirty-six at sixteen thousand. The hardware did not get worse; there is just more of it.",
    secondTitle: "What each failure costs",
    secondIntro:
      "Every failure loses half a checkpoint interval on average, plus the time to detect it and restart the whole job.",
    secondCode: `def lost_hours(failures, checkpoint_minutes, restart_minutes):
    return round(failures * (checkpoint_minutes / 2
                             + restart_minutes) / 60, 2)

for failures in (0.12, 14.75, 236.0):
    print(failures, "failures ->", lost_hours(failures, 60, 20),
          "hours lost")`,
    secondTrace:
      "Almost two hundred hours lost at the largest scale — over a week of a thirty-day run. Shortening the checkpoint interval is the main lever.",
    mistake:
      "Checkpointing only the weights when workers can fail independently. Resuming needs a state every worker agrees on, so a partially written checkpoint from a dying worker is worse than no checkpoint at all.",
    checkpoint:
      "Why does the failure rate scale with the device count rather than staying fixed?",
    checkpointAnswer:
      "Each device fails independently and synchronous training has no partial progress, so any one failure stops the whole run.",
    remember:
      "Failures multiply with the fleet; checkpoint often and consistently.",
    checks: [
      {
        question: "Why does one device failing stop the whole run?",
        choices: [
          "Synchronous training has no partial progress",
          "The devices share memory",
          "The scheduler kills the job",
        ],
        answer: 0,
        explanation: "Every worker waits at the barrier.",
        why: [
          "Correct. The step is discarded for everyone.",
          "Memory is per device.",
          "The job stops because it cannot proceed.",
        ],
      },
      {
        question: "What does a failure cost on average?",
        choices: [
          "Half a checkpoint interval plus detection and restart",
          "A whole checkpoint interval",
          "The time since the run started",
        ],
        answer: 0,
        explanation: "The failure lands uniformly between checkpoints.",
        why: [
          "Correct, and the restart is often the larger term.",
          "That is the worst case.",
          "Only work since the last checkpoint is lost.",
        ],
      },
      {
        question: "What makes a checkpoint usable after a failure?",
        choices: [
          "Every worker agrees on the same state",
          "It contains the weights",
          "It was written recently",
        ],
        answer: 0,
        explanation: "A partially written checkpoint is worse than none.",
        why: [
          "Correct. Consistency is the requirement.",
          "Weights alone do not resume a run.",
          "Recency is useless without consistency.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_3.l4",
    atomId: "py.atom.ml.frontier-utilization",
    conceptId: "py.ml.frontier-utilization",
    title: "Frontier utilization",
    requires: ["py.ml.fault-tolerant-training"],
    vocabulary: [
      ["model flops utilization", "useful training operations as a share of what the hardware could have done"],
      ["capacity model", "one accounting of tokens, operations, time, devices and cost"],
      ["idle time", "device-hours reserved and not producing training progress"],
    ],
    opening:
      "A cluster reserved for a month has a fixed number of device-hours. What fraction of them turned into training progress is one number, and it is usually far under what people assume.",
    outcome:
      "You will compute utilization from a training recipe and convert the shortfall into money.",
    why:
      "Every inefficiency covered so far — stragglers, exposed communication, failures, pipeline bubbles — lands in this single figure.",
    mentalModel:
      "Picture the cluster's total capacity as a rectangle. The training run occupies part of it, and everything else is paid for and empty.",
    firstTitle: "Useful work over available work",
    firstIntro:
      "Training operations are about six times parameters times tokens. Available operations are devices times peak rate times seconds.",
    firstCode: `def utilization(params_billions, tokens_billions, days,
                devices, peak_tflops):
    useful = 6 * params_billions * 1e9 * tokens_billions * 1e9
    available = devices * peak_tflops * 1e12 * days * 86400
    return round(useful / available * 100, 1)

for devices, days in [(1024, 30), (4096, 30), (4096, 90)]:
    print(devices, "devices", days, "days ->",
          utilization(70, 2000, days, devices, 400), "percent")`,
    firstTrace:
      "Seventy-nine percent on a thousand devices for thirty days. The same recipe on four thousand devices reaches twenty percent, because the work did not grow with the cluster.",
    secondTitle: "The shortfall in money",
    secondIntro:
      "Multiply the reserved device-hours by the hourly price. The gap between that and the useful fraction is what the inefficiency actually cost.",
    secondCode: `def spend_millions(devices, days, per_hour):
    return round(devices * days * 24 * per_hour / 1e6, 2)

for devices in (1024, 4096):
    total = spend_millions(devices, 30, 2.5)
    used = utilization(70, 2000, 30, devices, 400) / 100
    print(devices, "devices: spend", total, "million, useful",
          round(total * used, 2), "million")`,
    secondTrace:
      "Seven point four million spent on four thousand devices, of which one point five million did training. The rest bought idle time.",
    mistake:
      "Reporting utilization without saying which operations are counted. Some accounting includes recomputation from gradient checkpointing as useful work, which inflates the figure by a fifth or more.",
    checkpoint:
      "The same training recipe is moved to four times the devices for the same duration. What happens to utilization?",
    checkpointAnswer:
      "It falls by roughly four times, because the useful work is unchanged while the available capacity quadrupled.",
    remember:
      "Useful operations over available ones — and say what counts as useful.",
    checks: [
      {
        question: "What does model flops utilization compare?",
        choices: [
          "Useful training operations against what the hardware could have done",
          "Time busy against time idle",
          "Memory used against memory available",
        ],
        answer: 0,
        explanation: "Both terms are operation counts.",
        why: [
          "Correct, and every inefficiency lands in it.",
          "That is a coarser occupancy measure.",
          "Memory is accounted separately.",
        ],
      },
      {
        question: "Why does adding devices without adding work lower utilization?",
        choices: [
          "The denominator grows while the numerator does not",
          "More devices fail",
          "Communication rises",
        ],
        answer: 0,
        explanation: "It is arithmetic, not a systems effect.",
        why: [
          "Correct. Capacity grew and the work did not.",
          "Failures matter but are not the mechanism here.",
          "Communication is a separate cost.",
        ],
      },
      {
        question: "Why must the accounting be stated?",
        choices: [
          "Counting recomputation as useful inflates the figure substantially",
          "The units are ambiguous",
          "Peak rates vary",
        ],
        answer: 0,
        explanation: "Gradient checkpointing repeats forward work.",
        why: [
          "Correct, by a fifth or more.",
          "Operations per second is unambiguous.",
          "Peak rates are published.",
        ],
      },
    ],
  },
];

export const ML_EXTREME_SCALE_ATOMS = ML_EXTREME_SCALE_SPECS.map(guidedMasteryAtom);
export const ML_EXTREME_SCALE_CONCEPTS = ML_EXTREME_SCALE_SPECS.map(guidedMasteryConcept);
export const ML_EXTREME_SCALE_LESSON_CONTENT = guidedLessonContent(ML_EXTREME_SCALE_SPECS);
