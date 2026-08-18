import type { LectureQuestion } from "../../types";
import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_VISION_TASKS_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m5_2.l1",
    atomId: "py.atom.ml.image-classification",
    conceptId: "py.ml.image-classification",
    title: "The classification pipeline, end to end",
    requires: ["py.ml.transfer-learning"],
    vocabulary: [
      ["pipeline", "the ordered stages carrying raw files through to a reported metric"],
      ["class imbalance", "some classes having far more examples than others"],
      ["macro average", "averaging a metric over classes rather than over examples"],
      ["leakage", "information from the held-out set influencing training"],
    ],
    opening: "Classification is the simplest vision task and the one where most mistakes are made, because almost none of them are in the model. Data handling, the split, and the metric decide whether the number you report means anything.",
    outcome: "You will lay out the six stages of a classification pipeline and identify which of them can leak information into the held-out set.",
    why: "A model reporting ninety-nine per cent because of a leaky split is worse than useless, since it hides the failure until deployment. Knowing where leakage enters is what makes a reported number trustworthy.",
    mentalModel: "Think of a sealed exam. Every decision made using the exam paper contaminates it, and the only honest measurement comes from a paper nobody has looked at.",
    firstTitle: "Six stages, in a fixed order",
    firstIntro: "Each stage has one job, and swapping two of them is where the classic bugs come from.",
    firstCode: `stages = [
    ("split", "separate held-out data before anything else touches it"),
    ("augment", "expand the training set only, never the held-out set"),
    ("backbone", "a pretrained feature extractor, usually frozen at first"),
    ("head", "a new layer whose width is the class count"),
    ("loss", "cross-entropy, weighted when the classes are imbalanced"),
    ("metric", "macro-averaged, so rare classes are not drowned out"),
]

for index, (name, job) in enumerate(stages, start=1):
    print(f"{index}. {name:<9} {job}")

print()
print("swapping 1 and 2 augments the held-out set, which inflates every number")`,
    firstTrace: "Splitting comes first because every later decision is made using the training data. Augmentation applies to training alone, since a held-out set is meant to resemble what arrives in production. The metric is chosen last and deliberately, because accuracy on an imbalanced set reports mostly the majority class.",
    secondTitle: "Accuracy hides what a macro average shows",
    secondIntro: "On an imbalanced set, a model that ignores the rare class can still score well.",
    secondCode: `def accuracy(counts):
    correct = sum(right for right, total in counts)
    return correct / sum(total for _, total in counts)

def macro_recall(counts):
    return sum(right / total for right, total in counts) / len(counts)

# (correct, total) per class: 990 common, 10 rare
ignores_rare = [(985, 990), (0, 10)]
handles_rare = [(950, 990), (8, 10)]

for name, counts in (("ignores rare", ignores_rare), ("handles rare", handles_rare)):
    print(f"{name:<13} accuracy {accuracy(counts):.4f}  macro recall {macro_recall(counts):.4f}")`,
    secondTrace: "The model that never predicts the rare class scores higher on accuracy than the one that catches eight of ten. Macro recall reverses that ranking, because it weights each class equally rather than each example. Which of the two you report decides which model you would have shipped.",
    mistake: "Do not tune anything against the test set, including the decision to stop training. Every choice made by looking at it is a small transfer of information, and after enough of them the number it reports is a training score wearing a different name.",
    checkpoint: "Photographs of the same patient appear in both the training and held-out sets. What has gone wrong?",
    checkpointAnswer: "The split is leaky, because the model can recognize the patient rather than the condition. Splitting has to happen at the level of whatever the model might memorize, which here is the patient rather than the individual image, and grouped splitting is what enforces that.",
    remember: "Split first, augment only the training data, and choose the metric to match the imbalance. Every decision made by looking at the held-out set leaks a little information into it.",
    checks: [
      q("Why must the split come before augmentation?", ["Augmenting first can put variants of one image on both sides", "Augmentation is slower", "The split needs the augmented count"], 0, "Related images must not straddle the split.", ["Correct. That inflates every number reported.", "Speed is not the reason for the order.", "The split uses the original examples."]),
      q("A set is 99 per cent one class. What does plain accuracy report?", ["Mostly the majority class's performance", "The average across classes", "The rare class's recall"], 0, "Each example counts equally.", ["Correct. Macro averaging is the fix.", "That is what a macro average does.", "Accuracy can be high with zero rare-class recall."]),
      q("Photographs of one patient sit on both sides of the split. What is that?", ["Leakage, since the model can recognize the patient", "Correct, since the images differ", "Augmentation"], 0, "The split must group whatever could be memorized.", ["Correct. Grouped splitting prevents it.", "Different images of one subject are still related.", "Augmentation is a deliberate transformation."]),
    ],
  },
  {
    lessonId: "py.mc.m5_2.l2",
    atomId: "py.atom.ml.object-detection",
    conceptId: "py.ml.object-detection",
    title: "Detection adds where, and the bookkeeping that needs",
    requires: ["py.ml.image-classification"],
    vocabulary: [
      ["bounding box", "a rectangle naming where an object sits in the image"],
      ["intersection over union", "overlap area divided by combined area, used to score a box"],
      ["non-maximum suppression", "discarding boxes that overlap a higher-scoring one"],
      ["two-stage detector", "a design that proposes regions first and classifies them second"],
    ],
    opening: "Adding location to classification changes the problem more than it sounds. The output is no longer one label but a variable number of boxes, which means the model must also decide how many objects there are.",
    outcome: "You will compute overlap between boxes, run non-maximum suppression, and explain what separates a two-stage design from a single-stage one.",
    why: "Overlap scoring and suppression are shared by every detector, and they are also where most detection bugs live. The single-stage and two-stage split explains the speed and accuracy trade you will be asked to make.",
    mentalModel: "Picture several people pointing at the same object from slightly different angles. Suppression is the rule that keeps the most confident pointer and quietly dismisses everyone pointing at the same thing.",
    firstTitle: "Overlap is one number",
    firstIntro: "Intersection over union scores how well two rectangles agree, on a scale from zero to one.",
    firstCode: `def iou(a, b):
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    overlap = max(0, ix2 - ix1) * max(0, iy2 - iy1)
    if overlap == 0:
        return 0.0
    area_a = (ax2 - ax1) * (ay2 - ay1)
    area_b = (bx2 - bx1) * (by2 - by1)
    return overlap / (area_a + area_b - overlap)

box = (0, 0, 10, 10)
print("identical:   ", iou(box, (0, 0, 10, 10)))
print("half over:   ", round(iou(box, (5, 0, 15, 10)), 4))
print("touching:    ", iou(box, (10, 0, 20, 10)))
print("far apart:   ", iou(box, (50, 50, 60, 60)))`,
    firstTrace: "Identical boxes score one and disjoint boxes score zero. Two boxes overlapping by half score one third, because the union is larger than either one alone, which is a value that surprises people the first time. A threshold of one half is the usual line between a detection and a miss.",
    secondTitle: "Suppression turns many boxes into a few",
    secondIntro: "Keep the highest-scoring box, discard everything overlapping it, and repeat.",
    secondCode: `def iou(a, b):
    ix1, iy1 = max(a[0], b[0]), max(a[1], b[1])
    ix2, iy2 = min(a[2], b[2]), min(a[3], b[3])
    overlap = max(0, ix2 - ix1) * max(0, iy2 - iy1)
    if overlap == 0:
        return 0.0
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    return overlap / (area_a + area_b - overlap)

def suppress(boxes, threshold=0.5):
    ordered = sorted(boxes, key=lambda item: item[1], reverse=True)
    kept = []
    for box, score in ordered:
        if all(iou(box, other) <= threshold for other, _ in kept):
            kept.append((box, score))
    return kept

candidates = [((3, 3, 13, 13), 0.9), ((1, 1, 11, 11), 0.8),
              ((50, 50, 60, 60), 0.7), ((2, 2, 12, 12), 0.95)]
for box, score in suppress(candidates):
    print(score, box)`,
    secondTrace: "Four candidates become two, because three of them describe the same object and only the most confident survives. The distant box is kept, since it overlaps nothing. Raising the threshold keeps more near-duplicates and lowering it risks discarding two genuinely adjacent objects.",
    mistake: "Do not run suppression across different classes at once. A person standing beside a bicycle produces heavily overlapping boxes with different labels, and suppressing across classes deletes one of two correct detections.",
    checkpoint: "Two boxes overlap by exactly half of each one's area. Why is the overlap score a third rather than a half?",
    checkpointAnswer: "Because the denominator is the union, not either box. Half of one box is the intersection, and the union is one and a half boxes, so the ratio is one over three. Reading it as a half is the most common misunderstanding of the measure.",
    remember: "Overlap over union scores a box on a zero-to-one scale, and suppression keeps the most confident box among those describing one object. Run it per class, never across classes.",
    checks: [
      q("Two boxes overlap by half of each. What is their overlap score?", ["One third", "One half", "Two thirds"], 0, "The denominator is the union of the two.", ["Correct. The union is one and a half boxes.", "That reads the intersection over one box.", "That inverts the ratio."]),
      q("Why is suppression run separately per class?", ["Objects of different classes legitimately overlap", "It runs faster", "Scores are not comparable across classes"], 0, "A person beside a bicycle overlaps heavily.", ["Correct. Suppressing across classes deletes correct detections.", "The cost is similar either way.", "Comparability is not the problem here."]),
      q("What does raising the suppression threshold do?", ["Keeps more near-duplicate boxes", "Keeps fewer boxes", "Changes the confidence scores"], 0, "The threshold decides what counts as a duplicate.", ["Correct. Lowering it risks merging adjacent objects.", "A higher threshold suppresses less.", "Scores come from the model."]),
    ],
  },
  {
    lessonId: "py.mc.m5_2.l3",
    atomId: "py.atom.ml.segmentation",
    conceptId: "py.ml.segmentation",
    title: "Segmentation labels every pixel",
    requires: ["py.ml.object-detection"],
    vocabulary: [
      ["semantic segmentation", "labelling each pixel with a class, without separating instances"],
      ["instance segmentation", "labelling each pixel and separating individual objects"],
      ["encoder-decoder", "a design that reduces resolution and then restores it"],
      ["skip connection", "a path carrying high-resolution detail past the reduction"],
    ],
    opening: "Classification asks what, detection asks what and roughly where, and segmentation asks about every single pixel. That last step breaks the usual architecture, because the reductions that build reach are exactly what destroy the detail the answer needs.",
    outcome: "You will explain the resolution conflict, and how an encoder-decoder with skip connections resolves it.",
    why: "Medical imaging, autonomous driving and any measurement task needs per-pixel output, and the encoder-decoder with skips is the shape almost all of them use.",
    mentalModel: "Picture sketching a map by first stepping back to see the whole layout, then walking in again to fill in the streets. Stepping back tells you what is there and the walk back in is where the detail is restored.",
    firstTitle: "Reach and resolution pull in opposite directions",
    firstIntro: "Every halving doubles the receptive field and discards three quarters of the positions.",
    firstCode: `size = 256
field = 1
jump = 1
print(f"{'stage':<8}{'size':>6}{'receptive field':>18}")
for stage in range(5):
    field += 2 * jump
    print(f"{stage:<8}{size:>6}{field:>18}")
    size //= 2
    jump *= 2

print()
print("the final stage knows what the image contains and not where")`,
    firstTrace: "Reach climbs from three to sixty-three while the grid falls from two hundred and fifty-six to sixteen. A single position at the end summarizes a large region, which is what classification needs and what segmentation cannot use. Both properties come from the same operation, so one has to be restored afterwards.",
    secondTitle: "Skip connections carry the detail across",
    secondIntro: "The decoder gets both the coarse meaning and the fine positions the encoder saw.",
    secondCode: `def upsample(row, factor=2):
    out = []
    for value in row:
        out.extend([value] * factor)
    return out

coarse = [0.9, 0.1]
detail = [0.9, 0.2, 0.1, 0.8]

restored = upsample(coarse)
print("coarse upsampled:", restored)
print("encoder detail:  ", detail)
print("combined:        ", [round((a + b) / 2, 3) for a, b in zip(restored, detail)])
print("without the skip, the boundary between 0.1 and 0.8 is lost")`,
    secondTrace: "Upsampling alone reproduces the coarse answer at a larger size and invents nothing, so a boundary that fell inside one coarse cell stays invisible. Adding the encoder's own high-resolution values back restores it. That combination is why the architecture is drawn as a U, with the skips running straight across.",
    mistake: "Do not evaluate a segmentation model with plain pixel accuracy. Backgrounds usually dominate the pixel count, so predicting background everywhere already scores highly, and per-class overlap is the measure that reflects the task.",
    checkpoint: "Semantic segmentation is run on a photograph of two people standing together. What does it fail to report?",
    checkpointAnswer: "Which pixels belong to which person. Semantic segmentation labels every pixel as person without separating the individuals, and telling them apart is what instance segmentation adds, usually by combining detection boxes with a per-box mask.",
    remember: "Reductions buy reach and cost resolution. An encoder-decoder restores the size and skip connections restore the detail, and per-class overlap is the metric rather than pixel accuracy.",
    checks: [
      q("Why does a plain classification backbone fail at segmentation?", ["Its reductions destroy the spatial detail the answer needs", "It has too few parameters", "It cannot handle colour"], 0, "Reach and resolution come from the same operation.", ["Correct. The decoder is what restores the size.", "Parameter count is not the obstacle.", "Channels handle colour fine."]),
      q("What do skip connections contribute to a decoder?", ["High-resolution detail the reductions discarded", "More receptive field", "Fewer parameters"], 0, "Upsampling alone invents no detail.", ["Correct. Boundaries inside a coarse cell are restored.", "Reach is built by the encoder.", "They add paths, not savings."]),
      q("What does semantic segmentation not tell you?", ["Which pixels belong to which individual object", "What class each pixel is", "Where each class appears"], 0, "Instance separation is a further step.", ["Correct. Instance segmentation adds that.", "That is exactly what it reports.", "Location is per-pixel and included."]),
    ],
  },
  {
    lessonId: "py.mc.m5_2.l4",
    atomId: "py.atom.ml.vision-augmentation",
    conceptId: "py.ml.vision-augmentation",
    title: "Augmentation must preserve the label",
    requires: ["py.ml.segmentation"],
    vocabulary: [
      ["label-preserving", "a transformation that leaves the correct answer unchanged"],
      ["train-time only", "a step applied to training data and never to held-out data"],
      ["geometric transform", "a change of position, scale or orientation"],
      ["photometric transform", "a change of brightness, contrast or colour"],
    ],
    opening: "Augmentation is the cheapest way to enlarge a dataset and the easiest to get quietly wrong. Every transformation is a claim that the label survives it, and that claim is true for some tasks and false for others.",
    outcome: "You will separate label-preserving transformations from label-breaking ones, and keep augmentation out of the held-out set.",
    why: "A flip that reverses the meaning of the label teaches the model something false, and augmenting the held-out set inflates every number you report. Both mistakes are invisible in the code and obvious in the results.",
    mentalModel: "Think of rephrasing a question for practice. Rewording it is useful preparation, and rewriting it into a different question means you have been practising for the wrong exam.",
    firstTitle: "The same transformation, two different verdicts",
    firstIntro: "Whether a flip is safe depends entirely on what the label means.",
    firstCode: `TASKS = {
    "cat versus dog": {"hflip": True, "vflip": True, "rotate90": True},
    "handwritten digits": {"hflip": False, "vflip": False, "rotate90": False},
    "road sign reading": {"hflip": False, "vflip": False, "rotate90": False},
    "satellite land cover": {"hflip": True, "vflip": True, "rotate90": True},
}

for task, allowed in TASKS.items():
    safe = [name for name, ok in allowed.items() if ok]
    print(f"{task:<22} safe: {safe if safe else 'none of these'}")

print()
print("a flipped 2 is not a 2, and a mirrored road sign says something else")`,
    firstTrace: "A cat is still a cat upside down, and a satellite tile has no privileged orientation at all. A digit is not, because flipping turns some digits into other digits and others into nothing. The question is never whether the transformation is realistic, but whether the label survives it.",
    secondTitle: "Geometric transforms have to move the label too",
    secondIntro: "For detection and segmentation, the target is spatial and must be transformed alongside the image.",
    secondCode: `def flip_box(box, width):
    x1, y1, x2, y2 = box
    return (width - x2, y1, width - x1, y2)

width = 100
box = (10, 20, 30, 40)
print("original:", box)
print("flipped: ", flip_box(box, width))
print("flipped twice:", flip_box(flip_box(box, width), width))
print()
print("forgetting this trains the model to point at the mirror image")`,
    secondTrace: "Flipping the image without flipping the box hands the model an example where the object sits on one side and the target on the other. Applying the flip twice returns the original box, which is the check worth writing. Segmentation masks need the identical treatment, since they are spatial targets as well.",
    mistake: "Do not apply augmentation to the held-out set. Its purpose is to resemble what arrives in production, and transforming it measures the model on a distribution nobody will ever send it.",
    checkpoint: "A model reads house numbers from photographs. Which common augmentations are unsafe?",
    checkpointAnswer: "Horizontal and vertical flips, and large rotations, because they change what the digits say. Brightness, contrast, small rotations and mild cropping are all safe, since none of them alter the number being read.",
    remember: "Augment the training set only, and only with transformations the label survives. Spatial targets must be transformed alongside the image.",
    checks: [
      q("Why is a horizontal flip unsafe for digit recognition?", ["Flipping changes what some digits are", "It reduces the resolution", "It is too slow"], 0, "The label does not survive the transformation.", ["Correct. Label preservation is the only test that matters.", "A flip changes no pixel counts.", "It is a cheap operation."]),
      q("An image is flipped for detection. What else must change?", ["The bounding boxes, mirrored to match", "The class label", "The learning rate"], 0, "The target is spatial too.", ["Correct. Otherwise the model learns the mirror image.", "The class is unchanged by a flip.", "Training settings are unrelated."]),
      q("Why is the held-out set never augmented?", ["It should resemble what arrives in production", "Augmentation is too slow", "It would reduce its size"], 0, "The measurement must reflect real inputs.", ["Correct. Transforming it measures the wrong distribution.", "Cost is not the concern.", "Augmentation enlarges rather than shrinks."]),
    ],
  },
];

export const ML_VISION_TASKS_ATOMS = ML_VISION_TASKS_SPECS.map(guidedMasteryAtom);
export const ML_VISION_TASKS_CONCEPTS = ML_VISION_TASKS_SPECS.map(guidedMasteryConcept);
export const ML_VISION_TASKS_LESSON_CONTENT = guidedLessonContent(ML_VISION_TASKS_SPECS);
