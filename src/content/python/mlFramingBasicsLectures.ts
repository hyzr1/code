import type { LectureQuestion } from "../../types";
import { guidedMasteryAtom, guidedMasteryConcept, guidedLessonContent, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

export const ML_FRAMING_BASIC_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_1.l1", atomId: "py.atom.ml.learning-paradigms", conceptId: "py.ml.learning-paradigms",
    title: "The feedback signal defines the learning paradigm", requires: ["py.ml.notebooks-pipelines"],
    vocabulary: [["supervised learning", "learning a mapping from examples paired with target answers"], ["unsupervised learning", "finding structure without target answers"], ["self-supervised learning", "creating prediction targets from the data itself"], ["reinforcement learning", "learning actions from rewards produced through interaction"], ["feedback signal", "the information telling a learner what behavior is useful"], ["objective", "the quantity the learning process tries to improve"]],
    opening: "Machine learning names can sound mysterious. Start with one question: what feedback tells the system that one behavior is better than another?",
    outcome: "You will distinguish four learning paradigms by their feedback, construct one example of each, and avoid classifying a task only by its model name.",
    why: "The feedback signal determines what data must exist, which objective makes sense, and what kind of evaluation can honestly measure success.",
    mentalModel: "Picture four classrooms. One has answer sheets. One sorts materials without answers. One hides part of each worksheet. One earns points after choosing actions.",
    firstTitle: "Label tasks by feedback, not buzzwords", firstIntro: "The same raw user events can support different paradigms. The task definition states what the learner receives and what it must produce.",
    firstCode: `tasks = [
    {"name": "spam filter", "input": "email", "feedback": "human spam label"},
    {"name": "customer groups", "input": "purchase history", "feedback": "no target label"},
    {"name": "masked word", "input": "sentence with one hidden word", "feedback": "original hidden word"},
    {"name": "game agent", "input": "screen and action", "feedback": "future reward"},
]

for task in tasks:
    print(task["name"], "->", task["feedback"])`,
    firstTrace: "Human labels create supervised feedback. No target suggests unsupervised structure discovery. A hidden word creates its own target. A game reward evaluates a sequence of actions.",
    secondTitle: "Build different feedback from one sequence", secondIntro: "One click sequence can become a supervised churn example, self-supervised next-click pairs, or states and rewards for an interactive policy.",
    secondCode: `clicks = ["home", "search", "product", "cart", "checkout"]

supervised_example = {
    "features": clicks[:3],
    "label": "purchased",
}
self_supervised_pairs = [
    (clicks[index], clicks[index + 1])
    for index in range(len(clicks) - 1)
]
reinforcement_steps = [
    {"state": page, "action": "recommend", "reward": int(next_page == "checkout")}
    for page, next_page in zip(clicks, clicks[1:])
]

print(supervised_example)
print(self_supervised_pairs)
print(reinforcement_steps)`,
    secondTrace: "The data source did not choose the paradigm. The constructed feedback did. Real reinforcement learning also changes future observations through chosen actions, unlike a fixed labeled table.",
    mistake: "Do not call every task without human labels unsupervised. Self-supervision creates targets from raw data, and reinforcement learning receives rewards through interaction. State the signal precisely.",
    checkpoint: "Why is predicting a hidden word self-supervised rather than ordinary supervised learning?",
    checkpointAnswer: "The target comes automatically from the original sentence. A separate human did not need to attach a new answer label to each example.",
    remember: "Identify inputs, outputs, feedback, objective, and interaction. Supervised uses target answers, unsupervised finds structure, self-supervised derives targets, and reinforcement learning learns from rewards.",
    checks: [q("What primarily separates learning paradigms?", ["The feedback signal", "The programming-language logo", "The file extension"], 0, "Feedback defines what improvement information is available.", ["Correct. It shapes objectives and evaluation.", "A language can implement every paradigm.", "Storage format does not define learning."]), q("Which task is self-supervised?", ["Predict a masked token from the same sentence", "Predict a manually labeled disease", "Cluster points with no target"], 0, "The sentence supplies its own missing target.", ["Correct. Targets are constructed from raw data.", "Human diagnostic labels make that supervised.", "Clustering is unsupervised."])],
  },
  {
    lessonId: "py.mc.m3_1.l2", atomId: "py.atom.ml.examples-features-labels", conceptId: "py.ml.examples-features-labels",
    title: "Define one example at one prediction moment", requires: ["py.ml.learning-paradigms"],
    vocabulary: [["example", "one case presented to a learner"], ["feature", "an input value available at prediction time"], ["label", "the target answer used for supervised learning"], ["row grain", "the real-world unit represented by one row"], ["prediction time", "the moment when the model must make its decision"], ["label horizon", "the future interval used to determine the outcome"]],
    opening: "Before choosing a model, write one sentence: using information available at this moment, predict this outcome for this real-world unit over this future interval.",
    outcome: "You will define row grain, prediction time, features, labels, and horizon, then build examples without using information from the future.",
    why: "A table can look valid while mixing customer rows, transaction rows, and post-outcome information. Precise example construction blocks those hidden assumptions.",
    mentalModel: "Freeze the world at prediction time. The model receives only facts already visible in that photograph. The label is revealed after the future window closes.",
    firstTitle: "Separate the feature matrix from the target", firstIntro: "Each row represents one customer at January first. Features describe December behavior; the label asks whether a purchase occurs in January.",
    firstCode: `import pandas as pd

examples = pd.DataFrame({
    "customer_id": [101, 102, 103],
    "visits_before_jan_1": [5, 1, 8],
    "spend_before_jan_1": [80.0, 0.0, 120.0],
    "purchased_in_january": [1, 0, 1],
})

feature_columns = ["visits_before_jan_1", "spend_before_jan_1"]
X = examples[feature_columns]
y = examples["purchased_in_january"]

print("one row means one customer", X.shape)
print("features", feature_columns)
print("labels", y.tolist())`,
    firstTrace: "X has three customer examples and two available features. y contains one future answer per matching row. Customer ID identifies rows but is not automatically a useful feature.",
    secondTitle: "Construct snapshots from timestamped events", secondIntro: "The cutoff divides history from the label window. Feature events must occur before the cutoff; purchase labels come from the later horizon.",
    secondCode: `events = pd.DataFrame({
    "customer_id": [1, 1, 1, 2, 2],
    "day": [2, 8, 15, 3, 18],
    "kind": ["visit", "visit", "purchase", "visit", "purchase"],
})
cutoff = 10
horizon_end = 20

history = events[events["day"] < cutoff]
future = events[(events["day"] >= cutoff) & (events["day"] < horizon_end)]
features = history.groupby("customer_id").size().rename("prior_events")
labels = future[future["kind"] == "purchase"].groupby("customer_id").size().gt(0).rename("label")
snapshot = features.to_frame().join(labels, how="left").fillna({"label": False})

print(snapshot)
print("latest feature day", history["day"].max())`,
    secondTrace: "Only days before ten create prior-event features. Purchases from days ten through nineteen create labels. Customer one and two never receive their future purchase as an input.",
    mistake: "Do not use a field merely because it exists in the warehouse. Ask whether it is known, stable, legal, and computed the same way at the real prediction moment.",
    checkpoint: "Why must prediction time be defined before selecting features?",
    checkpointAnswer: "Availability depends on that moment. A value recorded after the decision may reveal the outcome and create leakage even if it appears in the final table.",
    remember: "Define row grain, prediction time, target, horizon, and feature availability. Build X and y from aligned cases, and preserve identifiers for auditing without blindly modeling them.",
    checks: [q("What is row grain?", ["What one row represents", "The number of model layers", "The chart color"], 0, "Examples must correspond to a clear real-world unit and time.", ["Correct. It controls valid joins and labels.", "Architecture is separate from table grain.", "Color does not define an example."]), q("Can a post-outcome field be a valid feature for an earlier decision?", ["No", "Yes, because the database contains it", "Only if it is highly predictive"], 0, "It was unavailable when the real prediction had to occur.", ["Correct. Using it leaks future information.", "Storage time is not prediction-time availability.", "Predictiveness does not repair leakage."])],
  },
  {
    lessonId: "py.mc.m3_1.l3", atomId: "py.atom.ml.baselines-formulation", conceptId: "py.ml.baselines-formulation",
    title: "A baseline proves whether learning adds value", requires: ["py.ml.examples-features-labels"],
    vocabulary: [["baseline", "a simple reference that a useful model should beat"], ["metric", "a defined rule that scores predictions"], ["constant predictor", "a predictor returning one fixed value or class"], ["prevalence", "the fraction of examples belonging to a class"], ["false positive", "predicting positive when the answer is negative"], ["false negative", "predicting negative when the answer is positive"]],
    opening: "A complicated model is not progress unless it beats a relevant simple rule. Define the decision, metric, and baseline before searching model families.",
    outcome: "You will create classification and regression baselines, expose accuracy on an imbalanced target, and choose a metric from real error costs.",
    why: "A ninety-nine-percent accurate fraud model can catch no fraud when only one percent of cases are positive. A baseline makes that failure obvious.",
    mentalModel: "A baseline is the starting line, not an embarrassment. If a race car cannot beat a bicycle on the chosen course, inspect the course, timing, and car.",
    firstTitle: "Compare against the simplest honest rule", firstIntro: "The majority classifier predicts zero for every case. It earns high accuracy but zero recall for the rare positive class.",
    firstCode: `from collections import Counter

labels = [0] * 95 + [1] * 5
majority = Counter(labels).most_common(1)[0][0]
predictions = [majority] * len(labels)

correct = sum(pred == answer for pred, answer in zip(predictions, labels))
true_positives = sum(pred == answer == 1 for pred, answer in zip(predictions, labels))
actual_positives = sum(labels)

accuracy = correct / len(labels)
recall = true_positives / actual_positives
print("prevalence", actual_positives / len(labels))
print("baseline accuracy", accuracy)
print("baseline recall", recall)`,
    firstTrace: "The all-negative rule scores ninety-five-percent accuracy because negatives dominate. It catches zero of five positives, so accuracy alone contradicts the task of finding rare cases.",
    secondTitle: "Turn error costs into a scoring rule", secondIntro: "A confusion table separates false alarms from misses. A weighted cost states that one missed positive costs ten times one false alarm in this example.",
    secondCode: `answers =     [1, 1, 1, 0, 0, 0, 0, 0]
model_a =    [1, 0, 0, 1, 0, 0, 0, 0]
model_b =    [1, 1, 1, 1, 1, 1, 0, 0]

def error_report(predictions, answers, false_positive_cost=1, false_negative_cost=10):
    false_positives = sum(pred == 1 and answer == 0 for pred, answer in zip(predictions, answers))
    false_negatives = sum(pred == 0 and answer == 1 for pred, answer in zip(predictions, answers))
    total_cost = false_positives * false_positive_cost + false_negatives * false_negative_cost
    return {"false_positives": false_positives, "false_negatives": false_negatives, "cost": total_cost}

print("model A", error_report(model_a, answers))
print("model B", error_report(model_b, answers))`,
    secondTrace: "Model B creates more false alarms but no costly misses, so its stated cost is lower. Real costs require domain evidence, safety review, and subgroup analysis rather than invented weights.",
    mistake: "Do not choose a metric after seeing which one makes your favorite model look best. Define success, constraints, baselines, and reporting slices before model search.",
    checkpoint: "Why can high accuracy fail on an imbalanced classification task?",
    checkpointAnswer: "The majority class dominates the average. A model can predict only that class, score highly, and completely fail to find the rare class of interest.",
    remember: "Formulate the real decision, define prediction timing and costs, select metrics before search, and beat constant, rule-based, or existing-system baselines on honest splits.",
    checks: [q("What does a baseline establish?", ["A reference level a useful model should beat", "A guarantee of deployment", "The maximum possible score"], 0, "Simple rules reveal whether complexity adds measurable value.", ["Correct. Use a relevant, honest reference.", "Deployment also needs safety and system validation.", "A baseline is usually far below the theoretical maximum."]), q("What does an all-negative classifier's recall equal when positives exist?", ["Zero", "One", "The negative prevalence"], 0, "It finds none of the actual positive cases.", ["Correct. True positives are zero.", "Recall one would mean finding every positive.", "Recall conditions on actual positives."])],
  },
  {
    lessonId: "py.mc.m3_1.l4", atomId: "py.atom.ml.split-discipline", conceptId: "py.ml.split-discipline",
    title: "Splits simulate the future use of a model", requires: ["py.ml.baselines-formulation"],
    vocabulary: [["training set", "examples used to fit model and preprocessing parameters"], ["validation set", "held-out examples used for model choices"], ["test set", "a final untouched estimate used after choices are finished"], ["stratification", "preserving selected class proportions across splits"], ["group split", "keeping related examples in the same partition"], ["temporal split", "training on the past and evaluating on later data"]],
    opening: "Random rows are not always independent. The split must imitate deployment: new users, later periods, unseen devices, or another real boundary.",
    outcome: "You will assign train, validation, and test roles, split related examples by group, split forecasting data by time, and fit preprocessing only on training.",
    why: "A leaked split produces an impressive score that disappears in production. Evaluation design is part of model design, not administrative cleanup.",
    mentalModel: "Training is the textbook, validation is practice, and test is the sealed final. One person's pages cannot cross exams.",
    firstTitle: "Keep related rows in one partition", firstIntro: "Repeated sessions from one user are strongly related. GroupShuffleSplit assigns whole users, preventing the same identity from appearing in both train and validation.",
    firstCode: `import numpy as np
from sklearn.model_selection import GroupShuffleSplit

user_ids = np.repeat(np.arange(6), 3)
features = np.arange(18).reshape(-1, 1)
labels = user_ids % 2

splitter = GroupShuffleSplit(n_splits=1, test_size=0.33, random_state=7)
train_index, valid_index = next(splitter.split(features, labels, groups=user_ids))

train_users = set(user_ids[train_index])
valid_users = set(user_ids[valid_index])
print("train users", train_users)
print("validation users", valid_users)
print("overlap", train_users & valid_users)`,
    firstTrace: "The user sets do not overlap. A random row split could place one person's nearly identical sessions in both sets and reward memorization of identity.",
    secondTitle: "Respect time and freeze training statistics", secondIntro: "A temporal cutoff trains on earlier rows and validates on later rows. The scaler mean comes only from the training period.",
    secondCode: `import pandas as pd

data = pd.DataFrame({
    "day": [1, 2, 3, 4, 5, 6],
    "value": [10.0, 12.0, 11.0, 13.0, 50.0, 55.0],
    "label": [0, 0, 1, 0, 1, 1],
})
train = data[data["day"] <= 4].copy()
validation = data[data["day"] > 4].copy()

training_mean = train["value"].mean()
train["value_centered"] = train["value"] - training_mean
validation["value_centered"] = validation["value"] - training_mean

print("training mean", training_mean)
print(train[["day", "value_centered"]])
print(validation[["day", "value_centered"]])`,
    secondTrace: "Days one through four determine the center. Later values remain large, honestly revealing drift. Recomputing their own mean would hide the change and leak validation information.",
    mistake: "Do not repeatedly inspect the test score while tuning. Every decision based on test results adapts to that set. Keep it sealed, or collect a new test set after accidental reuse.",
    checkpoint: "Why should sessions from one user stay in the same split?",
    checkpointAnswer: "They share identity and behavior. Crossing splits lets the model recognize the person rather than generalize to a new user, inflating the estimate.",
    remember: "Choose splits from deployment boundaries, keep groups together, preserve time direction, fit every learned transform on training, use validation for choices, and open test once.",
    checks: [q("Which set fits scaler parameters?", ["Training only", "Test only", "Every split separately"], 0, "Validation and test must remain unseen by fitted transformations.", ["Correct. Reuse the frozen transform elsewhere.", "Test is reserved for final estimation.", "Separate fitting creates leakage and different feature systems."]), q("When is a temporal split preferable?", ["When deployment predicts later periods from the past", "Whenever rows have colors", "Only when labels are balanced"], 0, "The evaluation should preserve the direction of time.", ["Correct. It also reveals drift.", "Color is irrelevant.", "Class balance does not determine time dependence."])],
  },
];

export const ML_FRAMING_BASIC_ATOMS = ML_FRAMING_BASIC_SPECS.map(guidedMasteryAtom);
export const ML_FRAMING_BASIC_CONCEPTS = ML_FRAMING_BASIC_SPECS.map(guidedMasteryConcept);
export const ML_FRAMING_BASIC_LESSON_CONTENT = guidedLessonContent(ML_FRAMING_BASIC_SPECS);
