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

const ML_EVALUATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_7.l1",
    atomId: "py.atom.ml.metrics-precision-recall",
    conceptId: "py.ml.metrics-precision-recall",
    title: "Precision and recall answer two different questions",
    requires: ["py.ml.anomaly-detection"],
    vocabulary: [
      ["true positive", "a positive case the model correctly flagged"],
      ["precision", "the share of flagged cases that were genuinely positive"],
      ["recall", "the share of genuine positives the model flagged"],
      ["F1", "the harmonic mean, which punishes a weak side"],
    ],
    opening: "Accuracy collapses two very different mistakes into one number, and on skewed data it hides both. Precision and recall separate them by asking different questions, and which one you care about is a product decision rather than a modelling one.",
    outcome: "You will compute precision, recall and F1 from counts, say which one a product cares about, and explain why accuracy misleads on rare classes.",
    why: "Fraud, disease screening, moderation and search all have rare positives. Reporting accuracy there is the single most common way a useless model looks successful.",
    mentalModel: "Think of a fishing net. Precision asks what fraction of your catch is actually the fish you wanted. Recall asks what fraction of the fish in the lake you caught. A tiny net scores high on one and terribly on the other.",
    firstTitle: "Three counts decide everything",
    firstIntro: "Every metric here comes from true positives, false positives and false negatives. Computing them by hand makes the definitions concrete.",
    firstCode: `truth =      [1, 1, 1, 0, 0, 0, 0, 0]
predicted =  [1, 1, 0, 1, 0, 0, 0, 0]

true_positive = sum(t == 1 and p == 1 for t, p in zip(truth, predicted))
false_positive = sum(t == 0 and p == 1 for t, p in zip(truth, predicted))
false_negative = sum(t == 1 and p == 0 for t, p in zip(truth, predicted))

precision = true_positive / (true_positive + false_positive)
recall = true_positive / (true_positive + false_negative)
print("precision", round(precision, 2), "recall", round(recall, 2))
print("f1", round(2 * precision * recall / (precision + recall), 2))`,
    firstTrace: "Two of the three flagged cases were right, so precision is two thirds. Two of the three real positives were caught, so recall is also two thirds. F1 sits at the same value because neither side is weaker here.",
    secondTitle: "Watch accuracy hide a useless model",
    secondIntro: "With one positive in a hundred, a model that never fires still scores very well on accuracy.",
    secondCode: `from sklearn.metrics import accuracy_score, precision_score, recall_score

truth = [1] * 5 + [0] * 495
never_fires = [0] * 500

print("accuracy", round(accuracy_score(truth, never_fires), 3))
print("recall", recall_score(truth, never_fires))
print("precision", precision_score(truth, never_fires, zero_division=0))`,
    secondTrace: "The model catches nothing at all, yet accuracy reads ninety-nine percent because the negatives dominate the count. Recall is zero, which is the number that exposes it. Precision is undefined with no predictions, so it is reported as zero here.",
    mistake: "Do not report a single metric without saying which error is expensive. Cancer screening wants recall, because a missed case is far worse than a second test. Spam filtering wants precision, because losing a real message is worse than seeing one advert.",
    checkpoint: "A moderation model flags five percent of posts with precision zero point nine and recall zero point three. What is actually happening?",
    checkpointAnswer: "Nearly everything it flags is genuinely a violation, so reviewers are not wasting time. But it is only catching about a third of the violations present, so most bad content is still getting through. The model is trustworthy when it speaks and far too quiet.",
    remember: "Precision is correctness among flagged cases; recall is coverage of real positives. F1 balances them, and accuracy hides both when the classes are skewed.",
    checks: [
      q("Which metric answers how many real positives were caught?", ["Recall", "Precision", "Accuracy"], 0, "Recall divides true positives by all genuine positives.", ["Correct. It measures coverage of the positive class.", "Precision measures correctness among the flagged cases.", "Accuracy mixes both classes into one number."]),
      q("A cancer screen should be tuned toward which metric?", ["Recall, since a missed case is the expensive error", "Precision, since false alarms are expensive", "Accuracy, since it summarizes both"], 0, "The cost of each error decides the metric.", ["Correct. A follow-up test is cheap compared with a missed diagnosis.", "A false alarm costs one extra test, which is the lesser harm.", "Accuracy is dominated by the healthy majority."]),
      q("Why is F1 a harmonic rather than arithmetic mean?", ["It stays low when either side is weak", "It is faster to compute", "It bounds the result above one"], 0, "The harmonic mean punishes imbalance between the two.", ["Correct. Precision one and recall zero gives F1 zero, not one half.", "Computation cost is irrelevant.", "Both means are bounded by one here."]),
    ],
  },
  {
    lessonId: "py.mc.m3_7.l2",
    atomId: "py.atom.ml.confusion-thresholds",
    conceptId: "py.ml.confusion-thresholds",
    title: "The threshold is a product decision, not a default",
    requires: ["py.ml.metrics-precision-recall"],
    vocabulary: [
      ["confusion matrix", "the four-cell table of predicted against actual"],
      ["threshold", "the score at which a case starts being called positive"],
      ["operating point", "the precision and recall a chosen threshold produces"],
      ["error cost", "what each kind of mistake actually costs the product"],
    ],
    opening: "A classifier does not output a decision. It outputs a score. The threshold turning that score into a decision is a separate choice. Leaving it at one half is a choice too, just an unexamined one.",
    outcome: "You will read a confusion matrix, move a threshold deliberately, and pick an operating point from error costs rather than convention.",
    why: "Most production tuning happens at the threshold, not in the model. Moving it is free and instant, while retraining is neither.",
    mentalModel: "Picture a dial between paranoid and permissive. Turn it one way and the model flags everything, catching all the positives and drowning reviewers in noise. Turn it the other way and it barely speaks, but is right when it does.",
    firstTitle: "Four cells hold every classification outcome",
    firstIntro: "The confusion matrix separates the two error types that accuracy adds together.",
    firstCode: `from sklearn.metrics import confusion_matrix

truth =     [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
predicted = [1, 1, 1, 0, 1, 0, 0, 0, 0, 0]

matrix = confusion_matrix(truth, predicted)
(true_negative, false_positive), (false_negative, true_positive) = matrix
print("true negative", true_negative, "false positive", false_positive)
print("false negative", false_negative, "true positive", true_positive)`,
    firstTrace: "Reading the layout matters: rows are the truth and columns are the prediction, so the off-diagonal cells are the two mistakes. One genuine positive was missed and one negative was wrongly flagged. Accuracy would report both as a single wrong answer.",
    secondTitle: "Sweep the threshold and choose deliberately",
    secondIntro: "The same trained model produces very different behaviour depending on where the cut is placed.",
    secondCode: `import numpy as np
from sklearn.metrics import precision_score, recall_score

truth = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
scores = np.array([0.95, 0.8, 0.6, 0.35, 0.55, 0.4, 0.3, 0.2, 0.1, 0.05])

for threshold in (0.3, 0.5, 0.7):
    flags = (scores >= threshold).astype(int)
    print("threshold", threshold,
          "precision", round(precision_score(truth, flags, zero_division=0), 2),
          "recall", round(recall_score(truth, flags), 2))`,
    secondTrace: "A low threshold catches every positive but drags in negatives, so recall is high and precision falls. Raising it reverses the trade. The model never changed; only the line between score and decision moved.",
    mistake: "Do not tune the threshold on the test set. It is a parameter fitted from data like any other, so choosing it on the test split turns your final estimate into a training score. Pick it on validation and report the test result once.",
    checkpoint: "Reviewers can process fifty cases a day and the model flags four hundred. Which direction do you move the threshold, and what do you lose?",
    checkpointAnswer: "Raise it, so only the most confident cases are flagged. Precision rises because the surviving flags are the strongest, and recall falls because genuine positives with middling scores are now missed. The trade is deliberate: capacity is the binding constraint.",
    remember: "The confusion matrix separates the two error types, and the threshold chooses where you sit between them. Select it from error costs on validation data, never on test.",
    checks: [
      q("Lowering the decision threshold does what?", ["Raises recall and usually lowers precision", "Raises both precision and recall", "Retrains the model"], 0, "A lower bar flags more cases, right and wrong.", ["Correct. You catch more positives and accept more false alarms.", "The two move in opposite directions along one curve.", "The model is untouched; only the cut moves."]),
      q("In a confusion matrix laid out with truth as rows, what sits off the diagonal?", ["The two kinds of mistake", "The correct predictions", "The class priors"], 0, "Diagonal cells are agreement between truth and prediction.", ["Correct. False positives and false negatives occupy those cells.", "Correct predictions are on the diagonal.", "Priors are the row totals, not individual cells."]),
      q("Why must the threshold be chosen on validation data?", ["It is fitted from data, so tuning it on test inflates the estimate", "Validation data is larger", "Test data has no labels"], 0, "Anything selected using a split is fitted on that split.", ["Correct. The test set has to stay untouched to remain an honest estimate.", "Size is unrelated to the principle.", "The test set has labels; that is why it can be scored."]),
    ],
  },
  {
    lessonId: "py.mc.m3_7.l3",
    atomId: "py.atom.ml.roc-pr-auc",
    conceptId: "py.ml.roc-pr-auc",
    title: "Under heavy imbalance, precision-recall tells the truth",
    requires: ["py.ml.confusion-thresholds"],
    vocabulary: [
      ["ROC curve", "true positive rate plotted against false positive rate"],
      ["precision-recall curve", "precision plotted against recall"],
      ["AUC", "the area under a curve, summarizing every threshold at once"],
      ["baseline", "the score a trivial model would achieve"],
    ],
    opening: "A curve summarizes every threshold at once, which is why curves are reported rather than single operating points. But the two common curves disagree sharply on rare-positive data, and only one of them stays honest.",
    outcome: "You will explain what each axis measures, say why ROC flatters an imbalanced problem, and compare a score against the right baseline.",
    why: "ROC AUC is the default in most papers and libraries. On a problem with one percent positives it can read impressively high while the model is nearly unusable in production.",
    mentalModel: "The false positive rate divides by a huge pile of negatives, so a thousand false alarms barely move it. Precision divides by the flags you actually raised, where those same thousand alarms are the whole story.",
    firstTitle: "The two curves measure different denominators",
    firstIntro: "Both summarize all thresholds, but the false positive rate is diluted by the negative class while precision is not.",
    firstCode: `import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score

rng = np.random.default_rng(0)
truth = np.array([1] * 10 + [0] * 990)
scores = np.concatenate([rng.normal(1.0, 1.0, 10), rng.normal(0.0, 1.0, 990)])

print("positives:", int(truth.sum()), "of", truth.size)
print("roc auc", round(roc_auc_score(truth, scores), 3))
print("average precision", round(average_precision_score(truth, scores), 3))`,
    firstTrace: "The same scores produce a comfortable ROC AUC and a far lower average precision. Nothing is wrong with either calculation. They differ because one divides by nine hundred and ninety negatives and the other divides by the handful of cases actually flagged.",
    secondTitle: "Compare each score against its own baseline",
    secondIntro: "A number is only meaningful against what a trivial model would score, and the two curves have different baselines.",
    secondCode: `import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score

rng = np.random.default_rng(1)
truth = np.array([1] * 10 + [0] * 990)
random_scores = rng.normal(0.0, 1.0, 1000)

print("random roc auc", round(roc_auc_score(truth, random_scores), 3))
print("random average precision", round(average_precision_score(truth, random_scores), 3))
print("prevalence baseline", round(truth.mean(), 3))`,
    secondTrace: "Random scores sit near one half on ROC, which is its baseline. The precision baseline is the prevalence instead, here one percent. So a ROC AUC of zero point eight and an average precision of zero point eight mean very different things.",
    mistake: "Do not compare ROC AUC across datasets with different class balance. The metric depends on the negative pile it divides by, so the same model scores differently as prevalence shifts. Report average precision alongside prevalence when positives are rare.",
    checkpoint: "A model scores zero point nine two ROC AUC and zero point one eight average precision on data with two percent positives. Is it good?",
    checkpointAnswer: "It ranks far better than chance, since average precision of zero point one eight is nine times the two percent baseline. But in absolute terms most flagged cases would still be wrong, so whether it is usable depends on review capacity and the cost of a false alarm. The ROC figure alone would have looked excellent.",
    remember: "ROC divides by the whole negative class and flatters imbalance; precision-recall divides by what you flagged. Compare each against its baseline, which is one half for ROC and prevalence for precision.",
    checks: [
      q("Why does ROC AUC look optimistic on rare-positive data?", ["The false positive rate is diluted by a huge negative class", "It ignores the positive class", "It only uses one threshold"], 0, "The denominator is every negative case.", ["Correct. Hundreds of false alarms barely move the rate.", "The true positive rate is one of its two axes.", "It summarizes every threshold at once."]),
      q("What is the baseline for average precision?", ["The prevalence of the positive class", "Always one half", "Always zero"], 0, "A random ranker achieves precision equal to prevalence.", ["Correct. At one percent positives, zero point zero one is chance.", "One half is the ROC baseline instead.", "Zero would mean never being right, which chance beats."]),
      q("Two datasets differ only in class balance. What happens to ROC AUC?", ["It changes, so the two are not comparable", "It stays fixed by definition", "It becomes undefined"], 0, "The metric depends on the negative pile it divides by.", ["Correct. Report prevalence whenever you quote it.", "It is not invariant to prevalence.", "It remains computable, just not comparable."]),
    ],
  },
  {
    lessonId: "py.mc.m3_7.l4",
    atomId: "py.atom.ml.regression-metrics",
    conceptId: "py.ml.regression-metrics",
    title: "Regression metrics differ in what they punish",
    requires: ["py.ml.roc-pr-auc"],
    vocabulary: [
      ["MAE", "mean absolute error, in the target's own units"],
      ["RMSE", "root mean squared error, which magnifies large misses"],
      ["R squared", "the share of variance the model explains over predicting the mean"],
      ["baseline model", "always predicting the training mean"],
    ],
    opening: "Regression errors can be summarized in several ways, and the choice is not cosmetic. One metric treats a single large miss as ten small ones, another treats it as far worse, and a third answers whether the model beats guessing the average.",
    outcome: "You will read MAE, RMSE and R squared, say which punishes outliers, and interpret a negative R squared correctly.",
    why: "Choosing the wrong error metric optimizes the wrong behaviour. Delivery estimates care about typical error, while structural load estimates care enormously about the rare large miss.",
    mentalModel: "Picture a dartboard. MAE measures the average distance from the bullseye. RMSE weights the wildest throws far more heavily. R squared asks whether you are throwing better than someone aiming at the board's centre of mass every time.",
    firstTitle: "One outlier separates the two error measures",
    firstIntro: "MAE grows linearly with a miss while RMSE grows with its square, so a single bad prediction moves them very differently.",
    firstCode: `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error

truth = np.array([10.0, 11.0, 12.0, 13.0])
steady = np.array([11.0, 12.0, 13.0, 14.0])
one_blowup = np.array([10.0, 11.0, 12.0, 17.0])

for name, prediction in (("steady drift", steady), ("one blowup", one_blowup)):
    mae = mean_absolute_error(truth, prediction)
    rmse = np.sqrt(mean_squared_error(truth, prediction))
    print(name, "mae", round(mae, 2), "rmse", round(rmse, 2))`,
    firstTrace: "Both prediction sets carry the same total absolute error, so their MAE is identical. RMSE separates them sharply, because concentrating all the error into one prediction squares that miss. If rare large errors are what hurts, RMSE is the metric that notices.",
    secondTitle: "R squared compares you against guessing the mean",
    secondIntro: "Absolute error values mean nothing without knowing the target's scale, so R squared reports performance relative to a trivial baseline.",
    secondCode: `import numpy as np
from sklearn.metrics import r2_score

truth = np.array([10.0, 20.0, 30.0, 40.0])
good = np.array([11.0, 19.0, 31.0, 39.0])
mean_guess = np.full(4, truth.mean())
worse_than_mean = np.array([40.0, 30.0, 20.0, 10.0])

print("good model", round(r2_score(truth, good), 3))
print("predicting the mean", round(r2_score(truth, mean_guess), 3))
print("worse than the mean", round(r2_score(truth, worse_than_mean), 3))`,
    secondTrace: "Predicting the mean scores exactly zero, which is what makes it the reference point. A good model approaches one. A model worse than the mean goes negative, and that negative value is meaningful rather than a bug.",
    mistake: "Do not read R squared as a percentage of correct predictions. It is the share of variance explained relative to the mean baseline, so a negative value simply means the model is worse than that baseline. It also rises whenever features are added, which is why adjusted variants exist.",
    checkpoint: "Two models have identical MAE, but one has a much higher RMSE. What does that tell you about their error patterns?",
    checkpointAnswer: "The higher-RMSE model concentrates its error into a few large misses, while the other spreads the same total error evenly across many small ones. Which is preferable depends on whether occasional large failures are tolerable or catastrophic in your setting.",
    remember: "MAE reports typical error in the target's units, RMSE punishes large misses, and R squared measures improvement over predicting the mean. Negative R squared means worse than that baseline.",
    checks: [
      q("Which metric is most sensitive to a single large error?", ["RMSE", "MAE", "R squared"], 0, "Squaring magnifies large residuals.", ["Correct. That is exactly why it is chosen when big misses matter.", "MAE weights every unit of error equally.", "R squared is a relative measure rather than an outlier detector."]),
      q("A model scores R squared of minus zero point three. What does that mean?", ["It performs worse than predicting the mean", "The calculation failed", "It explains thirty percent of the variance"], 0, "Zero is the mean baseline, not the floor.", ["Correct. Negative values are legitimate and informative.", "Negative results are expected for poor models.", "That would be positive zero point three."]),
      q("Why can MAE alone be misleading?", ["It hides whether error is spread evenly or concentrated", "It cannot be computed for large datasets", "It is always larger than RMSE"], 0, "Two very different error patterns can share an MAE.", ["Correct. Pair it with RMSE to see the shape of the error.", "It scales fine to any size.", "RMSE is at least as large as MAE, never smaller."]),
    ],
  },
  {
    lessonId: "py.mc.m3_7.l5",
    atomId: "py.atom.ml.probability-calibration",
    conceptId: "py.ml.probability-calibration",
    title: "A confident score is not the same as a probability",
    requires: ["py.ml.regression-metrics"],
    vocabulary: [
      ["calibration", "agreement between predicted probability and observed frequency"],
      ["reliability check", "bucketing predictions and comparing them with outcomes"],
      ["overconfidence", "predicting probabilities more extreme than reality"],
      ["Brier score", "mean squared error of predicted probabilities"],
    ],
    opening: "A model that ranks cases perfectly can still be badly wrong about probability. If you plan to threshold, price, or combine predictions, ranking is not enough: the number itself has to mean something.",
    outcome: "You will test calibration by bucketing predictions, recognize overconfidence, and say when calibration matters more than ranking.",
    why: "Any decision multiplying probability by a cost needs the probability to be real. Expected-value decisions, risk pricing, and combining several models all break silently under miscalibration.",
    mentalModel: "Think of a weather forecaster. Across every day they said thirty percent, it should rain about three times in ten. If it rains eight times in ten, their ranking may be fine while their numbers are meaningless.",
    firstTitle: "Bucket the predictions and compare with reality",
    firstIntro: "Calibration is checked by grouping predictions of similar confidence and asking how often those cases were actually positive.",
    firstCode: `import numpy as np

predicted = np.array([0.9, 0.9, 0.9, 0.9, 0.6, 0.6, 0.6, 0.6, 0.2, 0.2, 0.2, 0.2])
actual =    np.array([1,   1,   1,   0,   1,   1,   0,   0,   1,   0,   0,   0])

for level in (0.2, 0.6, 0.9):
    mask = predicted == level
    print("said", level, "-> actually positive", round(actual[mask].mean(), 2))`,
    firstTrace: "Each bucket compares the promise with the outcome. Cases scored at zero point nine were positive three quarters of the time, and those at zero point six were positive half the time. Both are drifting toward the middle, which is the signature of overconfidence.",
    secondTitle: "Ranking can be perfect while probabilities are wrong",
    secondIntro: "Squashing every probability toward the extremes leaves the ordering untouched and destroys the calibration.",
    secondCode: `import numpy as np
from sklearn.metrics import roc_auc_score, brier_score_loss

truth = np.array([1, 1, 1, 0, 0, 0, 0, 0])
honest = np.array([0.8, 0.7, 0.6, 0.4, 0.3, 0.3, 0.2, 0.1])
overconfident = np.clip((honest - 0.5) * 5 + 0.5, 0.01, 0.99)

for name, scores in (("honest", honest), ("overconfident", overconfident)):
    print(name, "roc auc", round(roc_auc_score(truth, scores), 3),
          "brier", round(brier_score_loss(truth, scores), 3))`,
    secondTrace: "Both score identically on ROC AUC because stretching preserves the ordering completely. The Brier score separates them, since it measures the squared distance between promise and outcome. A metric that only reads ranking cannot detect this failure.",
    mistake: "Do not treat a model's output as a probability just because it lies between zero and one. Tree ensembles and margin-based models are routinely miscalibrated. Check with buckets, and if the numbers matter, fit a calibration map on a held-out split rather than on the training data.",
    checkpoint: "Two models have the same ROC AUC but very different Brier scores. Which would you choose for an expected-value decision?",
    checkpointAnswer: "The one with the lower Brier score. Equal ROC AUC means both rank cases equally well, but an expected-value decision multiplies the probability by a cost, so the number itself must be trustworthy. Only the Brier score reflects that.",
    remember: "Calibration is agreement between predicted probability and observed frequency. Ranking metrics cannot see miscalibration, so check with buckets or a Brier score whenever the number itself is used.",
    checks: [
      q("What does it mean for a model to be well calibrated?", ["Cases predicted at seventy percent are positive about seventy percent of the time", "It ranks positives above negatives", "Its accuracy exceeds seventy percent"], 0, "Calibration compares promises with frequencies.", ["Correct. That agreement is the entire definition.", "Ranking is a separate property that calibration does not imply.", "Accuracy says nothing about the probability values."]),
      q("Why can ROC AUC not detect miscalibration?", ["Any order-preserving change leaves it unchanged", "It only uses the top predictions", "It requires calibrated inputs"], 0, "ROC AUC depends only on the ranking.", ["Correct. Stretching probabilities toward the extremes does not move it.", "It uses every threshold across all predictions.", "It works on arbitrary scores, calibrated or not."]),
      q("When does calibration matter most?", ["When the probability is multiplied by a cost to make a decision", "When you only need the top ten results", "When classes are balanced"], 0, "Expected-value reasoning needs real probabilities.", ["Correct. A wrong probability produces a wrong expected value.", "Pure ranking tasks care only about order.", "Balance affects which metrics mislead, not calibration's importance."]),
    ],
  },
  {
    lessonId: "py.mc.m3_7.l6",
    atomId: "py.atom.ml.imbalanced-data",
    conceptId: "py.ml.imbalanced-data",
    title: "Fix imbalance in training without corrupting evaluation",
    requires: ["py.ml.probability-calibration"],
    vocabulary: [
      ["class weight", "telling the loss that one class costs more to get wrong"],
      ["resampling", "changing class proportions by duplicating or dropping rows"],
      ["threshold tuning", "moving the decision point instead of the data"],
      ["evaluation integrity", "keeping the test split at the real prevalence"],
    ],
    opening: "Rare positives break the default assumption that both classes matter equally. Three tools fix that, and all three are safe in training. The dangerous move is letting any of them touch the data you evaluate on.",
    outcome: "You will apply class weighting, say what resampling does to calibration, and keep the evaluation split at true prevalence.",
    why: "Imbalance is the normal case in fraud, failure, and safety work. The standard mistake is resampling the whole dataset before splitting, which produces a wonderful score against a world that does not exist.",
    mentalModel: "Picture a courtroom where one side speaks for hours and the other gets a sentence. Weighting gives the quiet side proportionally louder words. Resampling clones its speaker. Either way, the verdict must still be judged against the real world.",
    firstTitle: "Weighting the loss costs nothing and changes behaviour",
    firstIntro: "Class weights tell the model that mistakes on the rare class are more expensive, without touching the data at all.",
    firstCode: `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score

rng = np.random.default_rng(0)
X = np.vstack([rng.normal(0.0, 1.0, (480, 2)), rng.normal(1.6, 1.0, (20, 2))])
y = np.array([0] * 480 + [1] * 20)

for weight in (None, "balanced"):
    model = LogisticRegression(class_weight=weight, max_iter=1000).fit(X, y)
    print("class_weight", weight, "recall", round(recall_score(y, model.predict(X)), 2))`,
    firstTrace: "With no weighting the model largely ignores the rare class. Getting the majority right already minimizes the loss. Declaring the classes balanced raises the price of missing a positive, so recall rises immediately. Notice that the data itself was never modified at all.",
    secondTitle: "Resample only the training split",
    secondIntro: "Duplicating rare rows is legitimate, but doing it before splitting leaks copies of the same rows into evaluation.",
    secondCode: `import numpy as np
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(1)
X = np.arange(500).reshape(-1, 1)
y = np.array([0] * 480 + [1] * 20)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=0)

positives = X_train[y_train == 1]
X_upsampled = np.vstack([X_train, np.repeat(positives, 5, axis=0)])
y_upsampled = np.concatenate([y_train, np.ones(len(positives) * 5, dtype=int)])

print("train prevalence after upsampling", round(y_upsampled.mean(), 3))
print("test prevalence, left alone", round(y_test.mean(), 3))`,
    secondTrace: "The training split now holds many more positives, which is the point. The test split keeps the real prevalence of four percent, so the reported score still describes production. Upsampling before the split would have copied the same rows into both sides.",
    mistake: "Do not resample before splitting, and do not report metrics on a rebalanced test set. Both make the model look far better than it is: the first leaks duplicated rows across the boundary, and the second measures against a prevalence that will never occur.",
    checkpoint: "You upsample the rare class heavily and the model's predicted probabilities all rise. What has happened?",
    checkpointAnswer: "Upsampling changes the base rate the model learns, so it now believes positives are far more common than they are. Ranking may still be fine, but the probabilities are no longer calibrated to reality and need recalibrating on data at the true prevalence before being used as probabilities.",
    remember: "Weight the loss, resample only the training split, or tune the threshold. Keep the evaluation split at true prevalence, and recalibrate if you changed the base rate.",
    checks: [
      q("What does class weighting change?", ["The cost of each mistake in the loss", "The number of rows in the dataset", "The decision threshold"], 0, "Weights reprice errors without altering the data.", ["Correct. The rare class becomes more expensive to get wrong.", "No rows are added or removed.", "The threshold is a separate lever applied after training."]),
      q("Why must resampling happen after the split?", ["Duplicated rows would otherwise appear on both sides", "Resampling is slow on large data", "The split function requires it"], 0, "Copies crossing the boundary are a leak.", ["Correct. The model would be scored on rows it trained on.", "Speed is not the concern.", "Nothing technical enforces the order; correctness does."]),
      q("After heavy upsampling, what should you check before using the probabilities?", ["Calibration, since the learned base rate shifted", "Nothing, they are unaffected", "That accuracy improved"], 0, "Changing prevalence changes the probabilities the model learns.", ["Correct. Recalibrate on data at the true prevalence.", "The base rate the model saw changed materially.", "Accuracy is the wrong headline here anyway."]),
    ],
  },
  {
    lessonId: "py.mc.m3_7.l7",
    atomId: "py.atom.ml.grouped-time-validation",
    conceptId: "py.ml.grouped-time-validation",
    title: "Splits must respect groups and the arrow of time",
    requires: ["py.ml.imbalanced-data"],
    vocabulary: [
      ["group", "rows sharing an identity, such as one patient or user"],
      ["grouped split", "keeping every row of a group on one side"],
      ["temporal split", "training only on the past and testing on the future"],
      ["optimistic estimate", "a score that cannot be reproduced in production"],
    ],
    opening: "A random split assumes rows are independent. Real data breaks that assumption constantly: several rows describe the same user, or the future sits alongside the past. When they break it, the score improves and the model does not.",
    outcome: "You will choose a grouped or temporal split from the deployment boundary and explain why random shuffling inflates the estimate.",
    why: "This is the most expensive evaluation mistake in practice, because nothing fails. The model reports a strong number, ships, and performs far worse against data it genuinely has not seen.",
    mentalModel: "Picture an exam where some questions come from the practice paper. You score brilliantly and learn nothing about how you will do on fresh questions. A grouped or temporal split removes the questions you have already answered.",
    firstTitle: "Keep every row of a group on one side",
    firstIntro: "When rows repeat an identity, a random split lets the model recognize the identity rather than generalize from it.",
    firstCode: `import numpy as np
from sklearn.model_selection import GroupKFold, KFold

groups = np.repeat(np.arange(10), 5)
X = np.arange(50).reshape(-1, 1)

random_split = next(KFold(n_splits=5, shuffle=True, random_state=0).split(X))
grouped_split = next(GroupKFold(n_splits=5).split(X, groups=groups))

def shared(split):
    train_index, test_index = split
    return len(set(groups[train_index]) & set(groups[test_index]))

print("groups on both sides, random split:", shared(random_split))
print("groups on both sides, grouped split:", shared(grouped_split))`,
    firstTrace: "The random split puts most groups on both sides, so the model sees other rows from the very same subject it is being tested on. The grouped split shares none. That difference is exactly the leak, and it is invisible in the score.",
    secondTitle: "Never train on the future",
    secondIntro: "For anything with a time order, the split must respect it, because production will only ever have the past available.",
    secondCode: `import numpy as np
from sklearn.model_selection import TimeSeriesSplit

timestamps = np.arange(12)
splitter = TimeSeriesSplit(n_splits=3)

for fold, (train_index, test_index) in enumerate(splitter.split(timestamps), 1):
    print("fold", fold,
          "train up to", timestamps[train_index].max(),
          "test from", timestamps[test_index].min())`,
    secondTrace: "Every fold trains on a prefix and tests on the block immediately following it, so the training window never contains a moment later than the evaluation window. The training set grows across folds, which mirrors how a deployed model accumulates history.",
    mistake: "Do not shuffle time-ordered data, even when rows look independent. Seasonality, trends and slow drift all let future rows inform the past, and the resulting score is unreachable in production. If the model will predict forward, the split must too.",
    checkpoint: "Your grouped split scores much lower than the random split you started with. Which number should you report?",
    checkpointAnswer: "The grouped one. It is not that the model became worse; the original estimate was inflated by recognizing identities it had already seen. The grouped split matches the deployment boundary, so it is the only estimate that describes performance on genuinely new subjects.",
    remember: "Choose the split from the deployment boundary. Keep every row of a group together, and train only on the past when time matters, even though both lower the reported score.",
    checks: [
      q("Rows repeat one patient across visits. Which split is correct?", ["A grouped split keeping each patient on one side", "A random shuffle stratified by outcome", "A split by row index"], 0, "The deployment boundary is a new patient.", ["Correct. Otherwise the model recognizes the patient rather than generalizing.", "Stratifying balances classes but still splits patients.", "Index order carries no information about identity."]),
      q("Why is a random split wrong for time-ordered data?", ["It lets the model train on moments after the test period", "It changes the class balance", "It reduces the training set"], 0, "Production only ever has the past available.", ["Correct. Trends and seasonality leak backwards through the shuffle.", "Balance is a separate issue.", "The sizes are unchanged by shuffling."]),
      q("Switching to a correct split lowers your score. What does that mean?", ["The earlier number was optimistic, not that the model got worse", "The new split is broken", "The model must be retrained from scratch"], 0, "The honest estimate is usually the lower one.", ["Correct. You are now measuring what production will actually see.", "The lower number is the trustworthy one.", "The model is unchanged; only the measurement improved."]),
    ],
  },
];

export const ML_EVALUATION_ATOMS = ML_EVALUATION_SPECS.map(guidedMasteryAtom);
export const ML_EVALUATION_CONCEPTS = ML_EVALUATION_SPECS.map(guidedMasteryConcept);
export const ML_EVALUATION_LESSON_CONTENT = guidedLessonContent(ML_EVALUATION_SPECS);
