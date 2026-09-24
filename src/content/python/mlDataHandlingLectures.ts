import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_DATA_HANDLING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m2_2.l1", atomId: "py.atom.ml.pandas-foundations", conceptId: "py.ml.pandas-foundations",
    title: "A DataFrame is a labeled table with one row per case", requires: ["py.ml.numpy-random-generators"],
    vocabulary: [["Series", "one labeled one-dimensional pandas array"], ["DataFrame", "a labeled two-dimensional table"], ["index", "the labels used to identify rows"], ["column", "one named variable"], ["join key", "values used to match rows across tables"], ["groupby", "split rows into groups, apply a calculation, and combine results"]],
    opening: "A DataFrame looks like a spreadsheet, but its row meaning and column meaning must be explicit. Before any operation, say what one row represents.",
    outcome: "You will create and inspect DataFrames, select rows and columns safely, aggregate groups, and join tables while checking row counts.",
    why: "Most ML time is spent turning scattered records into one trustworthy feature table. Silent row duplication here can invalidate every later metric.",
    mentalModel: "Picture each row as one case card and each column as one question printed on every card. The index labels cards; a join key pairs cards from different boxes.",
    firstTitle: "Select by labels or positions on purpose", firstIntro: "Bracket selection returns columns. `loc` selects by labels and conditions. `iloc` selects by integer position. Keeping these jobs separate prevents ambiguous indexing.",
    firstCode: `import pandas as pd

people = pd.DataFrame({
    "person_id": [101, 102, 103, 104],
    "city": ["Austin", "Boston", "Austin", "Chicago"],
    "score": [82, 91, 76, 88],
}).set_index("person_id")

print(people[["city", "score"]])
print(people.loc[people["score"] >= 85, ["city", "score"]])
print(people.iloc[0:2, 1])`,
    firstTrace: "The index now contains person IDs. The `loc` condition keeps two high-scoring rows and named columns. The `iloc` slice chooses the first two positions from the score column.",
    secondTitle: "Aggregate, then validate a join", secondIntro: "Groupby creates one summary row per city. A many-to-one merge promises that many people may share one city but the city table must have one row per city.",
    secondCode: `city_summary = people.groupby("city").agg(
    people=("score", "size"),
    average_score=("score", "mean"),
)
print(city_summary)

regions = pd.DataFrame({
    "city": ["Austin", "Boston", "Chicago"],
    "region": ["South", "Northeast", "Midwest"],
})
joined = people.reset_index().merge(
    regions, on="city", how="left", validate="many_to_one", indicator=True,
)
print(joined[["person_id", "city", "region", "_merge"]])`,
    secondTrace: "Austin's two people become one aggregate row. The merge preserves four people, attaches one region to each, validates key uniqueness, and exposes unmatched rows through the indicator column.",
    mistake: "Do not merge and merely admire the output. State expected key uniqueness, use `validate`, inspect unmatched indicators, and compare row counts. Duplicate keys can multiply examples silently.",
    checkpoint: "Why is a person's city joined to a city lookup with a many-to-one validation?",
    checkpointAnswer: "Many people can share one city, but each city must map to one lookup row. The validation rejects a duplicated city definition.",
    remember: "Define one-row meaning, use label and position indexing deliberately, name aggregations, and treat joins as contracts with keys, cardinality, unmatched cases, and row-count checks.",
    checks: [q("What should you state before working with a DataFrame?", ["What one row represents", "The monitor size", "A random model type"], 0, "Row grain determines valid joins and summaries.", ["Correct. Every table operation depends on row meaning.", "Screen size does not define the data.", "Model choice comes after understanding the table."]), q("What does `validate='many_to_one'` check in a merge?", ["Right-side keys are unique", "Both tables have one row", "Every column is numeric"], 0, "Many left rows may match one right row.", ["Correct. Duplicate lookup keys raise an error.", "The left table can contain many rows.", "Merge validation concerns key cardinality, not dtype."])],
  },
  {
    lessonId: "py.mc.m2_2.l2", atomId: "py.atom.ml.data-cleaning", conceptId: "py.ml.data-cleaning",
    title: "Cleaning makes every data assumption visible", requires: ["py.ml.pandas-foundations"],
    vocabulary: [["missing value", "a value that was not observed or recorded"], ["duplicate", "a repeated record under a defined identity rule"], ["schema", "the expected columns, types, ranges, and constraints"], ["coercion", "attempting to convert values into a target type"], ["sentinel", "a special code such as minus one used to mean something else"], ["quarantine", "separating invalid rows for review instead of silently discarding them"]],
    opening: "Cleaning is not making a table look neat. It is deciding what each messy value means, recording that decision, and preserving evidence about rejected data.",
    outcome: "You will profile missingness, parse dirty values, define duplicate identity, enforce schema checks, and quarantine malformed rows.",
    why: "A model learns whatever the pipeline encodes. If missing means zero by accident or duplicates cross splits, model quality claims become misleading.",
    mentalModel: "Raw data enters a border checkpoint. Every column shows its passport: name, type, allowed range, and missing-value rule. Failed checks go to a review lane.",
    firstTitle: "Profile before filling or dropping", firstIntro: "The raw strings include blanks, a malformed age, a duplicated ID, and an impossible negative value. Parse first and keep validity flags.",
    firstCode: `from io import StringIO
import pandas as pd

raw = StringIO("""user_id,age,spend
1,20,14.50
2,,9.00
2,,9.00
3,unknown,11.25
4,35,-5.00
""")
data = pd.read_csv(raw)
data["age_parsed"] = pd.to_numeric(data["age"], errors="coerce")
data["valid_spend"] = data["spend"].ge(0)

print(data.isna().sum())
print(data[["user_id", "age", "age_parsed", "valid_spend"]])`,
    firstTrace: "Blank and malformed age both become missing after parsing, but the original age text remains available. The spend flag identifies the negative record without changing it silently.",
    secondTitle: "Apply explicit identity and quarantine rules", secondIntro: "Here a duplicate means the same full raw record. Schema failures are collected with reasons, while valid rows continue through the pipeline.",
    secondCode: `deduplicated = data.drop_duplicates(
    subset=["user_id", "age", "spend"], keep="first",
)
reasons = pd.DataFrame({
    "bad_id": deduplicated["user_id"].isna(),
    "bad_age": deduplicated["age_parsed"].isna(),
    "bad_spend": ~deduplicated["valid_spend"],
}, index=deduplicated.index)

bad_rows = reasons.any(axis=1)
quarantine = deduplicated.loc[bad_rows].assign(
    reason=reasons.loc[bad_rows].apply(
        lambda row: ",".join(row.index[row]), axis=1,
    )
)
clean = deduplicated.loc[~bad_rows].copy()
print("clean", clean[["user_id", "age_parsed", "spend"]])
print("quarantine", quarantine[["user_id", "reason"]])`,
    secondTrace: "One exact duplicate disappears under the declared identity rule. Only the fully valid row continues. Other records remain inspectable with machine-readable failure reasons.",
    mistake: "Do not replace every missing value with zero. Missing can mean not measured, not applicable, sensor failure, or delayed arrival. Choose a rule from collection semantics and consider a missingness indicator.",
    checkpoint: "Why keep the original dirty column after parsing into a clean numeric column?",
    checkpointAnswer: "The original preserves evidence for debugging, auditing, and improved parsing. A coerced missing value alone cannot explain whether input was blank or malformed.",
    remember: "Profile first, preserve raw evidence, define duplicate identity, validate a schema, and quarantine failures with reasons. Cleaning decisions are model assumptions and should be testable.",
    checks: [q("What does `errors='coerce'` do during numeric parsing?", ["Turns unparseable values into missing values", "Guarantees every value is correct", "Deletes the whole DataFrame"], 0, "Coercion exposes failed conversions as missing.", ["Correct. Preserve the raw value to diagnose why.", "Parsing success still needs range and meaning checks.", "Only individual failed values are coerced."]), q("Why quarantine bad rows?", ["To preserve evidence and failure reasons", "To make them train twice", "To hide them permanently"], 0, "Rejected data should remain inspectable.", ["Correct. This supports debugging and data-quality monitoring.", "Invalid duplicates should not gain extra weight.", "Quarantine is an explicit review path, not concealment."])],
  },
  {
    lessonId: "py.mc.m2_2.l3", atomId: "py.atom.ml.tabular-preprocessing", conceptId: "py.ml.tabular-preprocessing",
    title: "Fit preprocessing on training data only", requires: ["py.ml.data-cleaning"],
    vocabulary: [["preprocessing", "turning raw columns into model-ready features"], ["fit", "learning transformation parameters from data"], ["transform", "applying already learned parameters"], ["one-hot encoding", "turning each category into a separate zero-or-one feature"], ["standardization", "subtracting a learned mean and dividing by a learned scale"], ["leakage", "using information unavailable at the real prediction moment"]],
    opening: "A scaler learns means and spreads. An encoder learns category names. Those are fitted parameters, so learning them from validation or test data leaks information.",
    outcome: "You will split before fitting, transform numeric and categorical columns consistently, handle unseen categories, and preserve feature order.",
    why: "Preprocessing is part of the model. If training and serving use different rules, predictions can be wrong even when the estimator file is correct.",
    mentalModel: "Training data writes the translation dictionary. Validation, test, and future rows may use that frozen dictionary, but they cannot add answers to it.",
    firstTitle: "Learn numeric parameters from training rows", firstIntro: "The training mean and scale become frozen constants. A large validation value may transform beyond the training range; that is honest rather than a reason to refit.",
    firstCode: `import pandas as pd

train = pd.DataFrame({
    "age": [20.0, 30.0, 40.0],
    "plan": ["free", "pro", "free"],
})
valid = pd.DataFrame({
    "age": [100.0, 35.0],
    "plan": ["team", "pro"],
})

age_mean = train["age"].mean()
age_scale = train["age"].std(ddof=0)
train_age = (train["age"] - age_mean) / age_scale
valid_age = (valid["age"] - age_mean) / age_scale
print(age_mean, age_scale)
print(train_age.round(2).tolist(), valid_age.round(2).tolist())`,
    firstTrace: "Only ages twenty, thirty, and forty define mean thirty and their scale. Validation age one hundred becomes a large standardized value because the frozen training distribution considers it unusual.",
    secondTitle: "Freeze categories and feature order", secondIntro: "Training categories define the output columns. Reindex makes validation use exactly those columns and fills an unseen category with zeros under this documented policy.",
    secondCode: `train_plan = pd.get_dummies(train["plan"], prefix="plan", dtype=float)
feature_columns = train_plan.columns.tolist()

valid_plan = pd.get_dummies(valid["plan"], prefix="plan", dtype=float)
valid_plan = valid_plan.reindex(columns=feature_columns, fill_value=0.0)

train_features = pd.concat(
    [train_age.rename("age_scaled"), train_plan], axis=1,
)
valid_features = pd.concat(
    [valid_age.rename("age_scaled"), valid_plan], axis=1,
)
print(feature_columns)
print(train_features)
print(valid_features)`,
    secondTrace: "Both matrices have age-scaled, plan-free, and plan-pro in the same order. The unseen team category becomes all-zero plan features; a production system should also track that unknown-category event.",
    mistake: "Do not call fit separately on train and validation data. That creates different coordinate systems and leaks validation statistics. Package learned parameters and column order with the model artifact.",
    checkpoint: "Why should validation age one hundred not change the scaler's mean?",
    checkpointAnswer: "Validation represents unseen data used to estimate generalization. Letting it change fitted parameters gives the training pipeline information from the evaluation set.",
    remember: "Split first. Fit every learned transformation on training data. Reuse it unchanged everywhere else, preserve feature order, and define behavior for missing or unseen categories.",
    checks: [q("Which data should fit a production feature scaler?", ["Training data only", "Test data only", "All future user data together"], 0, "Evaluation and future rows must not influence learned preprocessing.", ["Correct. Then transform other splits with frozen parameters.", "The test set must remain untouched until final evaluation.", "Future data is unavailable and should not refit the deployed model silently."]), q("Why reindex one-hot columns?", ["To keep the same feature names and order", "To convert every category to age", "To make validation fit the encoder"], 0, "A model expects a fixed input coordinate system.", ["Correct. Missing known categories get zero columns.", "Numeric age and categories are different features.", "Validation should use, not fit, the training vocabulary."])],
  },
  {
    lessonId: "py.mc.m2_2.l4", atomId: "py.atom.ml.exploratory-analysis", conceptId: "py.ml.exploratory-analysis",
    title: "Exploration tests the data story before modeling", requires: ["py.ml.tabular-preprocessing"],
    vocabulary: [["distribution", "how often a variable takes different values"], ["outlier", "an observation far from most others under a stated rule"], ["stratum", "a meaningful subgroup examined separately"], ["target leakage", "a feature that reveals the answer through an invalid route"], ["collection failure", "a pattern created by how data was recorded rather than the real process"], ["data drift", "a change in input distribution over time or groups"]],
    opening: "Exploratory data analysis is a search for broken assumptions. Ask where values came from, what is missing, which groups differ, and whether time or collection systems changed.",
    outcome: "You will inspect distributions and groups, flag outliers without deleting them automatically, and detect a collection artifact that a model could exploit.",
    why: "A powerful model can learn a hospital ID, post-outcome timestamp, or logging bug instead of the intended relationship. Exploration catches these shortcuts early.",
    mentalModel: "Act like a detective inspecting a witness statement. Summaries are clues, not verdicts. Compare the story across groups, time, missingness, and suspiciously perfect predictors.",
    firstTitle: "Summarize overall and by meaningful groups", firstIntro: "Overall averages can hide subgroup differences. Quantiles reveal spread without assuming a normal distribution, and group summaries expose uneven collection.",
    firstCode: `import pandas as pd

data = pd.DataFrame({
    "site": ["A"] * 5 + ["B"] * 5,
    "age": [20, 22, 23, 24, 80, 40, 41, 42, 43, 44],
    "label": [0, 0, 0, 1, 1, 0, 1, 1, 1, 1],
    "device": ["old"] * 5 + ["new"] * 5,
})

print(data["age"].describe(percentiles=[0.25, 0.5, 0.75]))
print(data.groupby("site").agg(
    rows=("label", "size"),
    label_rate=("label", "mean"),
    median_age=("age", "median"),
))`,
    firstTrace: "Age eighty stretches the range but not the median as strongly. Site B has a much higher label rate. That difference may be real, sampled, or caused by policy and must be investigated.",
    secondTitle: "Flag outliers and suspicious shortcuts", secondIntro: "The IQR rule creates a review flag. A cross-tab reveals that device and site are perfectly linked, so device may only identify the collection system.",
    secondCode: `lower_quartile = data["age"].quantile(0.25)
upper_quartile = data["age"].quantile(0.75)
iqr = upper_quartile - lower_quartile
lower = lower_quartile - 1.5 * iqr
upper = upper_quartile + 1.5 * iqr
data["age_outlier"] = ~data["age"].between(lower, upper)

print(data.loc[data["age_outlier"], ["site", "age"]])
print(pd.crosstab(data["site"], data["device"], normalize="index"))
print(pd.crosstab(data["device"], data["label"], normalize="index"))`,
    secondTrace: "Age eighty receives a review flag, not an automatic deletion. The device table exactly mirrors site. Its label association may disappear at a new site with different hardware.",
    mistake: "Do not remove an outlier merely because a formula flagged it. It may be an error, a rare valid case, or the population you most need to serve. Investigate provenance and evaluate decisions by subgroup.",
    checkpoint: "Why can a feature that predicts labels well still be unsafe?",
    checkpointAnswer: "It may encode a collection site, timestamp after the outcome, duplicate identity, or another shortcut that will not exist at prediction time or in deployment.",
    remember: "Explore distributions, missingness, groups, time, duplicates, and suspicious predictors. Flags create questions. Provenance and deployment context decide what action is valid.",
    checks: [q("What should happen immediately after an outlier rule flags a row?", ["Investigate its meaning and source", "Delete it without review", "Copy it into every split"], 0, "A statistical flag cannot determine data semantics.", ["Correct. Rare valid cases may matter greatly.", "Automatic deletion can bias the dataset.", "Duplication changes its weight and can leak across splits."]), q("Why inspect features by site or time?", ["Collection changes can create shortcuts and drift", "Every group must have identical values", "It guarantees causation"], 0, "Models can exploit recording patterns that do not generalize.", ["Correct. Group and time views expose hidden shifts.", "Real groups can differ; the goal is understanding.", "Observational summaries do not prove causation."])],
  },
  {
    lessonId: "py.mc.m2_2.l5", atomId: "py.atom.ml.plotting-guided", conceptId: "py.ml.plotting-guided",
    title: "A good plot answers one named question", requires: ["py.ml.exploratory-analysis"],
    vocabulary: [["encoding", "mapping a data value to position, color, size, or shape"], ["histogram", "counts placed into numeric intervals"], ["scatter plot", "paired numeric values shown as points"], ["learning curve", "model performance plotted against training size or training step"], ["axis scale", "the numeric mapping from values to visual positions"], ["uncertainty band", "a visual range showing variability around an estimate"]],
    opening: "A plot is an explanation, not decoration. Start with one question, choose a matching encoding, and label the needed context.",
    outcome: "You will build distribution, relationship, and learning-curve plots, choose axes deliberately, and include uncertainty or counts when the picture could overstate certainty.",
    why: "Plots reveal data and training failures faster than raw tables, but poor scales and missing context can create a convincing false story.",
    mentalModel: "A plot is a sentence. The title states the question, axes define values and units, and marks provide evidence.",
    firstTitle: "Match the plot to the question", firstIntro: "A histogram asks how one variable is distributed. A scatter plot asks how two numeric variables move together. Labels include units and sample size.",
    firstCode: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ages = np.array([18, 19, 20, 20, 21, 22, 24, 29, 35, 42])
scores = np.array([51, 55, 61, 60, 64, 66, 70, 73, 78, 81])

figure, axes = plt.subplots(1, 2, figsize=(8, 3))
axes[0].hist(ages, bins=[15, 20, 25, 30, 35, 40, 45])
axes[0].set(title=f"Age distribution, n={len(ages)}", xlabel="Age, years", ylabel="Count")
axes[1].scatter(ages, scores)
axes[1].set(title="Age and score", xlabel="Age, years", ylabel="Score, points")
figure.tight_layout()
print([axis.get_title() for axis in axes])
plt.close(figure)`,
    firstTrace: "The histogram uses bins and counts, so its appearance depends on bin boundaries. The scatter plot preserves each pair and shows relationship shape, spread, clusters, and possible outliers.",
    secondTitle: "Show learning progress with variability", secondIntro: "Mean validation loss alone can hide unstable runs. Plot each checkpoint with an uncertainty band and keep the training curve for diagnosing overfit.",
    secondCode: `steps = np.array([1, 2, 3, 4, 5])
train_loss = np.array([0.9, 0.65, 0.48, 0.36, 0.28])
valid_mean = np.array([0.95, 0.72, 0.60, 0.58, 0.62])
valid_std = np.array([0.04, 0.05, 0.06, 0.08, 0.10])

figure, axis = plt.subplots(figsize=(5, 3))
axis.plot(steps, train_loss, marker="o", label="train")
axis.plot(steps, valid_mean, marker="o", label="validation mean")
axis.fill_between(steps, valid_mean - valid_std, valid_mean + valid_std, alpha=0.25)
axis.set(title="Loss across training checkpoints", xlabel="Checkpoint", ylabel="Loss")
axis.legend()
print("best validation checkpoint", steps[valid_mean.argmin()])
plt.close(figure)`,
    secondTrace: "Training loss keeps falling while validation loss reaches its minimum at checkpoint four, then rises. The widening band warns that validation behavior also becomes less stable.",
    mistake: "Do not truncate an axis to exaggerate a tiny difference without making the scale unmistakable. Avoid rainbow colors, hidden sample sizes, overlapping marks, and smoothed curves that conceal raw variation.",
    checkpoint: "Why should a learning curve show training and validation performance together?",
    checkpointAnswer: "Their gap helps separate optimization progress from generalization. Falling training loss with rising validation loss is evidence of overfitting rather than successful improvement.",
    remember: "Name the question, choose the matching mark, label units and sample context, show variability, and inspect how scales or aggregation could change the story.",
    checks: [q("Which plot best preserves paired numeric observations?", ["A scatter plot", "A single total", "An unlabeled pie chart"], 0, "Each point encodes one x-y pair.", ["Correct. Relationship shape and outliers remain visible.", "A total removes pair structure.", "A pie chart is not designed for two numeric variables."]), q("What can an uncertainty band reveal?", ["Variation around an estimated curve", "A guaranteed causal effect", "The exact future value"], 0, "The band communicates instability or sampling variation under a defined method.", ["Correct. Its meaning should be stated.", "Visualization does not establish causation.", "Uncertainty means the future is not exactly known."])],
  },
];

export const ML_DATA_HANDLING_ATOMS = ML_DATA_HANDLING_SPECS.map(guidedMasteryAtom);
export const ML_DATA_HANDLING_CONCEPTS = ML_DATA_HANDLING_SPECS.map(guidedMasteryConcept);
export const ML_DATA_HANDLING_LESSON_CONTENT = guidedLessonContent(ML_DATA_HANDLING_SPECS);
