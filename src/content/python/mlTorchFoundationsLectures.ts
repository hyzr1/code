import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_TORCH_FOUNDATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m2_3.l1", atomId: "py.atom.ml.torch-tensors-devices", conceptId: "py.ml.torch-tensors-devices",
    title: "A tensor carries values, shape, dtype, and device", requires: ["py.ml.plotting-guided"],
    vocabulary: [["tensor", "a multidimensional numeric array used by PyTorch"], ["device", "the processor and memory holding a tensor"], ["CPU", "a general-purpose processor"], ["GPU", "a processor designed for many parallel numeric operations"], ["dtype", "the storage format and precision of tensor values"], ["transfer", "copying a tensor from one device to another"]],
    opening: "A PyTorch tensor resembles a NumPy array, but it also records where its memory lives. Operations need compatible shapes, dtypes, and devices.",
    outcome: "You will create tensors, inspect their contracts, select an available device, move data explicitly, and explain when GPU acceleration does not help.",
    why: "A model and its input must occupy the same device. Hidden transfers cause errors or slowdowns, while an oversized dtype wastes memory.",
    mentalModel: "A tensor is a numbered crate with shape, material called dtype, and a warehouse address called device.",
    firstTitle: "Inspect the complete tensor contract", firstIntro: "Create feature rows as float thirty-two and labels as integers. Model inputs and class IDs have different jobs and usually different dtypes.",
    firstCode: `import torch

features = torch.tensor(
    [[1.5, 2.0, -1.0], [0.5, 3.0, 4.0]],
    dtype=torch.float32,
)
labels = torch.tensor([0, 2], dtype=torch.int64)

print(features.shape, features.dtype, features.device)
print(labels.shape, labels.dtype, labels.device)
print("column means", features.mean(dim=0))`,
    firstTrace: "Features have shape two-by-three and use floating-point math. Labels have shape two and integer class IDs. Reducing dimension zero returns one mean per feature column.",
    secondTitle: "Choose and use one device explicitly", secondIntro: "The code prefers a CUDA GPU when available and otherwise uses the CPU. Both model parameters and input tensors move to the same chosen device.",
    secondCode: `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
layer = torch.nn.Linear(3, 2).to(device)
batch = features.to(device)

output = layer(batch)
print("chosen device", device)
print("parameter device", next(layer.parameters()).device)
print("output", output.shape, output.device)

cpu_output = output.detach().cpu()
print("ready for NumPy", cpu_output.numpy().shape)`,
    secondTrace: "The layer and batch share one device, so the operation is legal. Detach removes gradient tracking, then `cpu` makes the result safe to convert to a NumPy array.",
    mistake: "Do not assume a GPU makes every job faster. Transfers and launch overhead can dominate tiny workloads. Measure end-to-end time and avoid moving tensors back and forth inside the training loop.",
    checkpoint: "Why must a model's parameters and its input batch be on the same device?",
    checkpointAnswer: "An operation cannot directly combine memory owned by different processors. Move both to the chosen device before the forward calculation.",
    remember: "Treat shape, dtype, and device as one tensor contract. Move model and data deliberately, convert through CPU when needed, and measure whether acceleration helps the actual workload.",
    checks: [q("Which dtype usually stores class indices for cross-entropy?", ["Integer sixty-four", "Boolean only", "A Python string"], 0, "Class labels are integer positions.", ["Correct. PyTorch commonly names it int64 or long.", "Booleans represent only false and true.", "Tensor loss functions need numeric labels."]), q("What must match before a layer processes a batch?", ["Their devices must be compatible", "Their variable names must match", "Both must be converted to lists"], 0, "Parameters and data must be accessible to the same processor operation.", ["Correct. Shape and dtype contracts must also be valid.", "Python names do not affect tensor memory.", "Lists would discard tensor acceleration and autograd behavior."])],
  },
  {
    lessonId: "py.mc.m2_3.l2", atomId: "py.atom.ml.torch-autograd", conceptId: "py.ml.torch-autograd",
    title: "Autograd records operations and applies the chain rule backward", requires: ["py.ml.torch-tensors-devices"],
    vocabulary: [["computation graph", "the recorded operations connecting inputs to an output"], ["leaf tensor", "a user-created tracked tensor whose gradient can be stored"], ["gradient", "the derivative of an output with respect to a value"], ["backward pass", "propagating derivatives through the recorded graph"], ["detach", "creating a tensor view that no longer tracks this graph"], ["no_grad", "a context that disables graph recording for enclosed operations"]],
    opening: "Autograd is not symbolic magic. During the forward pass, PyTorch records how tracked tensors produced the loss. Backward walks those operations in reverse using the chain rule.",
    outcome: "You will inspect a small graph, calculate and verify gradients, understand accumulation, and stop tracking during updates or evaluation.",
    why: "Training works only when gradients describe the current forward pass. Accidental graph breaks or accumulated old gradients can make correct-looking code learn incorrectly.",
    mentalModel: "The forward pass leaves a trail of operation cards. Backward starts with the loss and walks in reverse, passing each local slope toward the inputs.",
    firstTitle: "Trace one scalar gradient by hand", firstIntro: "For loss equal to `(w*x - target)` squared, chain rule gives two times the error times x. Autograd should produce the same number.",
    firstCode: `import torch

w = torch.tensor(2.0, requires_grad=True)
x = torch.tensor(3.0)
target = torch.tensor(10.0)

prediction = w * x
loss = (prediction - target) ** 2
loss.backward()

manual_gradient = 2 * (prediction.item() - target.item()) * x.item()
print("prediction", prediction.item())
print("loss", loss.item())
print("autograd", w.grad.item(), "manual", manual_gradient)`,
    firstTrace: "Prediction is six, so error is minus four. Two times minus four times input three equals minus twenty-four. The negative gradient says increasing w locally would lower the loss.",
    secondTitle: "Clear gradients and update without recording", secondIntro: "Calling backward adds into existing `.grad`. Training therefore clears gradients before the next backward pass and updates parameters inside `no_grad`.",
    secondCode: `learning_rate = 0.1
for step in range(3):
    if w.grad is not None:
        w.grad.zero_()
    prediction = w * x
    loss = (prediction - target) ** 2
    loss.backward()
    with torch.no_grad():
        w -= learning_rate * w.grad
    print(step, round(w.item(), 3), round(loss.item(), 3))

with torch.no_grad():
    evaluation = w * x
print("tracked during evaluation", evaluation.requires_grad)`,
    secondTrace: "Each iteration builds a fresh graph, computes one current gradient, then changes w without recording the update itself. Evaluation also skips graph storage because no backward pass is needed.",
    mistake: "Do not use `.item()`, NumPy conversion, or a newly constructed tensor in the middle of a differentiable calculation. Those operations can detach values and break the path from loss to parameter.",
    checkpoint: "Why does a training loop clear gradients before calling backward again?",
    checkpointAnswer: "PyTorch accumulates gradients by addition. Without clearing, the next update mixes the current gradient with gradients from older batches.",
    remember: "Forward records a graph, backward applies chain rule in reverse, leaf gradients accumulate, and parameter updates or evaluation should avoid recording unnecessary graphs.",
    checks: [q("What does `loss.backward()` do?", ["Propagates derivatives through the recorded graph", "Deletes every parameter", "Moves the model to a GPU"], 0, "Backward applies local derivative rules in reverse order.", ["Correct. Leaf gradients are accumulated.", "Parameters remain and are updated separately.", "Device movement is an explicit different operation."]), q("Why use `torch.no_grad()` during a manual parameter update?", ["To avoid recording the update in a new graph", "To turn floats into strings", "To make the gradient larger"], 0, "The update is optimizer bookkeeping, not part of the differentiable model.", ["Correct. It also avoids needless graph memory.", "It does not change values into text.", "It disables recording rather than scaling gradients."])],
  },
  {
    lessonId: "py.mc.m2_3.l3", atomId: "py.atom.ml.torch-shapes", conceptId: "py.ml.torch-shapes",
    title: "Name tensor axes before broadcasting them", requires: ["py.ml.torch-autograd"],
    vocabulary: [["batch axis", "the axis indexing independent examples"], ["feature axis", "the axis indexing input measurements or hidden units"], ["channel axis", "the axis indexing image or signal channels"], ["unsqueeze", "inserting a length-one axis"], ["reshape", "viewing the same element count with different axis lengths"], ["shape assertion", "a check that documents and enforces an expected tensor contract"]],
    opening: "A legal broadcast can still be a semantic bug. Write axis names beside important shapes, insert length-one axes deliberately, and assert boundaries before the wrong result travels farther.",
    outcome: "You will trace batch and feature shapes, use unsqueeze safely, distinguish reshape from transpose, and detect an accidental broadcast.",
    why: "Neural code often runs while mixing batch, sequence, channel, or feature axes incorrectly. Explicit contracts turn silent mistakes into immediate errors.",
    mentalModel: "Every axis is a labeled drawer. Reshape rearranges drawer sizes without changing item order; transpose swaps drawer roles; unsqueeze inserts a one-slot drawer for broadcasting.",
    firstTitle: "Make bias broadcasting explicit", firstIntro: "A batch-by-features matrix multiplies a features-by-outputs weight matrix. The output bias has one value per output and broadcasts over the batch.",
    firstCode: `import torch

batch = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
weights = torch.ones(3, 4)
bias = torch.tensor([0.1, 0.2, 0.3, 0.4])

assert batch.shape == (2, 3)       # batch, features
assert weights.shape == (3, 4)     # features, outputs
logits = batch @ weights + bias
assert logits.shape == (2, 4)      # batch, outputs
print(logits)`,
    firstTrace: "Matrix multiplication contracts the shared feature axis and leaves batch-by-outputs. Bias shape four acts like one-by-four, so each example receives the same four output offsets.",
    secondTitle: "Insert the axis you mean", secondIntro: "Subtract one mean per channel from a batch-by-channel-by-height-by-width image tensor. Two unsqueezes create channel-by-one-by-one for spatial broadcasting.",
    secondCode: `images = torch.arange(2 * 3 * 2 * 2, dtype=torch.float32).reshape(2, 3, 2, 2)
channel_means = images.mean(dim=(0, 2, 3))
centered = images - channel_means[:, None, None]

print("images", images.shape)
print("means", channel_means.shape)
print("broadcast view", channel_means[:, None, None].shape)
print("center check", centered.mean(dim=(0, 2, 3)))

wrong_means = images.mean(dim=(0, 1, 2))
print("legal but wrong meaning", wrong_means.shape)`,
    secondTrace: "The intended mean shape three becomes three-by-one-by-one and aligns with channel, height, and width. The wrong reduction returns length two, which can broadcast over width while silently encoding the wrong meaning.",
    mistake: "Do not use reshape to repair a dimension mismatch until you can name every old and new axis. A reshape can preserve element count while scrambling the semantic grouping you intended.",
    checkpoint: "Why is shape compatibility alone not enough to trust a broadcast?",
    checkpointAnswer: "Broadcasting checks axis lengths, not meanings. An accidental length can align with the wrong axis and produce a plausible tensor containing incorrect values.",
    remember: "Name axes, assert boundary shapes, insert length-one axes deliberately, and distinguish reshape from axis permutation. Legal shapes do not guarantee correct semantics.",
    checks: [q("What does unsqueeze do?", ["Inserts a length-one axis", "Deletes all dimensions", "Moves data to a GPU"], 0, "The same values gain one additional axis.", ["Correct. This often makes broadcast intent explicit.", "Squeeze may remove length-one axes; unsqueeze adds one.", "Device placement is unrelated."]), q("Why add shape assertions?", ["To document contracts and fail near the mistake", "To speed every GPU kernel automatically", "To rename Python variables"], 0, "An assertion catches unexpected layouts before later operations obscure the cause.", ["Correct. It is executable documentation.", "Assertions are checks, not automatic kernel optimization.", "Variable names do not change."])],
  },
  {
    lessonId: "py.mc.m2_3.l4", atomId: "py.atom.ml.torch-dataloaders", conceptId: "py.ml.torch-dataloaders",
    title: "Datasets describe examples and DataLoaders build batches", requires: ["py.ml.torch-shapes"],
    vocabulary: [["Dataset", "an object that returns one example by index"], ["DataLoader", "an iterator that fetches, batches, and optionally shuffles examples"], ["batch", "a group of examples processed together"], ["shuffle", "randomizing example order between passes"], ["collate function", "the rule that combines individual examples into one batch"], ["padding", "adding placeholder positions so variable-length examples share a rectangular shape"]],
    opening: "A Dataset defines one example. A DataLoader defines how examples arrive. Separate jobs make loading, shuffling, and batching testable.",
    outcome: "You will create reproducible batches, inspect final short batches, and write a collate function that pads variable-length sequences with a mask.",
    why: "A perfect model can be trained on duplicated, misaligned, or nondeterministically ordered data. The input pipeline is part of the experiment.",
    mentalModel: "The Dataset is a card catalog. The DataLoader chooses order and tray size. Collation arranges one rectangular model input.",
    firstTitle: "Batch fixed-shape examples reproducibly", firstIntro: "TensorDataset pairs each feature row with its matching label. A dedicated generator controls shuffle order without sharing global random state.",
    firstCode: `import torch
from torch.utils.data import DataLoader, TensorDataset

features = torch.arange(20, dtype=torch.float32).reshape(10, 2)
labels = torch.arange(10)
dataset = TensorDataset(features, labels)
generator = torch.Generator().manual_seed(17)
loader = DataLoader(
    dataset, batch_size=4, shuffle=True,
    generator=generator, num_workers=0,
)

for batch_features, batch_labels in loader:
    print(batch_features.shape, batch_labels.tolist())`,
    firstTrace: "Ten examples with batch size four create batches of four, four, and two. Features and labels stay paired. The seeded generator makes this shuffle order repeatable.",
    secondTitle: "Collate variable-length sequences with a mask", secondIntro: "The custom collate rule pads token sequences to the longest sequence in this batch. A Boolean mask marks real tokens so the model can ignore padding.",
    secondCode: `from torch.nn.utils.rnn import pad_sequence

sequences = [torch.tensor([4, 8, 2]), torch.tensor([7]), torch.tensor([5, 6])]

def collate_sequences(examples):
    lengths = torch.tensor([len(item) for item in examples])
    padded = pad_sequence(examples, batch_first=True, padding_value=0)
    positions = torch.arange(padded.shape[1])[None, :]
    mask = positions < lengths[:, None]
    return padded, lengths, mask

sequence_loader = DataLoader(sequences, batch_size=3, collate_fn=collate_sequences)
padded, lengths, mask = next(iter(sequence_loader))
print(padded)
print(lengths)
print(mask)`,
    secondTrace: "The result has three rows and maximum length three. Zeros fill absent positions. The mask is true exactly before each sequence length, preserving which values are real.",
    mistake: "Do not shuffle validation or test data unless order truly does not matter and identifiers remain available. Never let a Dataset perform random train-test splitting each time an example is requested.",
    checkpoint: "Why does variable-length batching need a mask as well as padded values?",
    checkpointAnswer: "The model must distinguish real zero-valued tokens from placeholder zeros. The mask records which positions belong to the original example.",
    remember: "Dataset defines one example, DataLoader defines delivery, collate defines batch structure, and seeds control shuffle. Inspect pairing, final batches, padding, masks, and split boundaries.",
    checks: [q("What does a collate function do?", ["Combines examples into one batch", "Calculates every model gradient", "Chooses the final business metric"], 0, "Collation defines batch structure and padding rules.", ["Correct. It runs after individual examples are fetched.", "Backpropagation belongs to the training step.", "Metric choice is separate from loading."]), q("With ten examples and batch size four, what batch sizes appear when drop-last is false?", ["Four, four, and two", "Four only", "Ten and ten"], 0, "The final incomplete batch is kept by default.", ["Correct. Its shape must be handled safely.", "That would ignore six examples.", "Batch size four cannot create batches of ten."])],
  },
  {
    lessonId: "py.mc.m2_3.l5", atomId: "py.atom.ml.torch-reproducibility", conceptId: "py.ml.torch-reproducibility",
    title: "Reproducibility controls sources and records remaining limits", requires: ["py.ml.torch-dataloaders"],
    vocabulary: [["deterministic algorithm", "an implementation chosen to return repeatable results under its supported conditions"], ["nondeterminism", "variation that remains despite identical high-level inputs"], ["random state", "the current position of a pseudorandom generator"], ["environment", "library, driver, hardware, and operating-system details"], ["seed manifest", "the recorded seeds for each random source"], ["reproducibility envelope", "the specific setup within which repeatability is expected"]],
    opening: "Setting one seed is useful but incomplete. Python, NumPy, PyTorch, DataLoader workers, GPU kernels, library versions, and hardware can each affect repeatability.",
    outcome: "You will reset major random sources, request deterministic algorithms, verify repeatability, and record an honest reproducibility envelope.",
    why: "A teammate must know whether a metric change came from code, data, configuration, random sampling, or a different execution environment.",
    mentalModel: "Reproducing a run is recreating a recipe and kitchen. Seeds are ingredient batch numbers; versions, hardware, and deterministic settings describe the equipment and method.",
    firstTitle: "Reset every random source you use", firstIntro: "One helper seeds Python, NumPy, and PyTorch. Calling it before each experiment reproduces all three streams within this environment.",
    firstCode: `import random
import numpy as np
import torch

def seed_everything(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

def sample_once(seed):
    seed_everything(seed)
    return random.random(), np.random.rand(), torch.rand(1).item()

first = sample_once(2026)
second = sample_once(2026)
print(first)
print(second)
print("same", first == second)`,
    firstTrace: "Resetting all three generators recreates the same three draws. Without resetting, each call would advance its stream and return new values.",
    secondTitle: "Request determinism and record the environment", secondIntro: "Deterministic mode rejects known nondeterministic operations when possible. The run record also captures versions, device, seed, and policy instead of promising universal bitwise identity.",
    secondCode: `import platform

torch.use_deterministic_algorithms(True)
run_record = {
    "seed": 2026,
    "python": platform.python_version(),
    "numpy": np.__version__,
    "torch": torch.__version__,
    "device": "cuda" if torch.cuda.is_available() else "cpu",
    "deterministic_algorithms": torch.are_deterministic_algorithms_enabled(),
}

values = torch.tensor([1e20, 1.0, -1e20])
print(run_record)
print("sum order A", values.sum().item())
print("sum order B", values[[0, 2, 1]].sum().item())`,
    secondTrace: "The record states the reproducibility envelope. The two mathematically equal sums can differ because floating-point addition is not associative; parallel operation order can therefore matter.",
    mistake: "Do not claim that one seed guarantees identical results on every GPU and software version. State what was controlled, save exact configuration and data identifiers, and define acceptable tolerance when bitwise identity is unrealistic.",
    checkpoint: "Why can two seeded runs still differ on different hardware or library versions?",
    checkpointAnswer: "They may select different kernels, operation orders, or numerical implementations. Seeds control random streams, not every algorithm or floating-point execution detail.",
    remember: "Seed every source, isolate generator streams, request deterministic algorithms when appropriate, record the full environment, and state the boundary within which repeatability is expected.",
    checks: [q("Does `torch.manual_seed` also seed Python's `random` module?", ["No", "Yes, always", "Only on a GPU"], 0, "Each library owns separate random state.", ["Correct. Seed every source actually used.", "Python random must be seeded separately.", "Device choice does not merge the libraries' generators."]), q("What should a reproducibility report include besides seeds?", ["Code, data, configuration, versions, hardware, and determinism policy", "Only the final metric", "A claim that all machines are identical"], 0, "Execution context can change results.", ["Correct. This defines the reproducibility envelope.", "A metric cannot explain how it was produced.", "Machines and implementations can differ."])],
  },
];

export const ML_TORCH_FOUNDATION_ATOMS = ML_TORCH_FOUNDATION_SPECS.map(guidedMasteryAtom);
export const ML_TORCH_FOUNDATION_CONCEPTS = ML_TORCH_FOUNDATION_SPECS.map(guidedMasteryConcept);
export const ML_TORCH_FOUNDATION_LESSON_CONTENT = guidedLessonContent(ML_TORCH_FOUNDATION_SPECS);
