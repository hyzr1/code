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

const ML_UNSUPERVISED_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_6.l1",
    atomId: "py.atom.ml.kmeans-guided",
    conceptId: "py.ml.kmeans-guided",
    title: "k-means alternates assignment and centroid updates",
    requires: ["py.ml.kernel-trick"],
    vocabulary: [
      ["centroid", "the mean point that represents one cluster"],
      ["assignment step", "attaching every point to its nearest centroid"],
      ["update step", "moving each centroid to the mean of the points assigned to it"],
      ["inertia", "the total squared distance from points to their own centroid"],
    ],
    opening: "Without labels there is nothing to predict, so the goal changes: find structure the data already contains. k-means proposes a specific structure — a fixed number of groups, each summarized by one average point — and then improves that guess by alternating two very simple steps.",
    outcome: "You will be able to run one k-means iteration by hand, explain why inertia never increases, and state the geometric assumption that decides whether k-means is the right tool.",
    why: "k-means is the default first attempt at segmentation, quantization, and compression because it is fast and easy to explain. Knowing its assumption is what stops you applying it to data whose clusters are elongated, nested, or wildly different in size.",
    mentalModel: "Picture k flags planted in a field of points. Every point walks to its nearest flag. Each flag then slides to the middle of its own crowd. Repeat: the flags stop moving once no point wants to switch.",
    firstTitle: "Run one Lloyd iteration by hand",
    firstIntro: "One iteration is an assignment step followed by an update step. Doing it explicitly shows there is no magic — only distances and means.",
    firstCode: `import numpy as np

points = np.array([[0.0, 0.0], [0.5, 0.2], [4.0, 4.0], [4.5, 4.2]])
centroids = np.array([[0.0, 0.0], [1.0, 1.0]])

distances = np.linalg.norm(points[:, None, :] - centroids[None, :, :], axis=2)
labels = distances.argmin(axis=1)
moved = np.array([points[labels == k].mean(axis=0) for k in range(len(centroids))])

print("labels", labels.tolist())
print("new centroids", moved.round(2).tolist())`,
    firstTrace: "The distance array has one row per point and one column per centroid, so `argmin(axis=1)` picks each point's nearest flag. The two far points both choose centroid one, so its new position becomes their mean, `[4.25, 4.1]`. Nothing was optimized directly; the centroid simply moved to the middle of its crowd.",
    secondTitle: "Watch inertia fall and then stop",
    secondIntro: "Inertia is the quantity k-means actually minimizes. Both steps can only lower it, which is why the algorithm always converges — though possibly to a local optimum that depends on the starting flags.",
    secondCode: `from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=120, centers=3, cluster_std=0.6, random_state=0)

for k in (1, 2, 3, 4):
    model = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(k, "clusters ->  inertia", round(model.inertia_, 1))`,
    secondTrace: "Inertia drops steeply from one to three clusters and then flattens, because the data really was generated from three blobs. The fourth cluster only splits an existing group, so it buys very little. That bend is the elbow people look for when choosing k.",
    mistake: "Do not read a lower inertia as a better clustering. Inertia falls every time you add a cluster, and reaches zero when every point is its own centroid. Compare inertia across k to find the bend, or use a criterion such as silhouette that penalizes meaningless splits.",
    checkpoint: "k-means is run on two clusters shaped like long crossing ribbons. Why does it usually fail, even though the groups are obvious to the eye?",
    checkpointAnswer: "Assigning each point to its nearest centroid carves the space into straight-edged regions around each mean, so every cluster it can express is roughly round and equally sized. Elongated or interleaved shapes cannot be described by one mean each, so the boundary cuts across the true groups.",
    remember: "k-means alternates assignment and centroid updates to minimize inertia. It converges, but only to a local optimum, and it can only express roughly spherical clusters of similar size.",
    checks: [
      q("What does the assignment step do?", ["Attaches every point to its nearest centroid", "Moves each centroid to a cluster mean", "Chooses the number of clusters"], 0, "Assignment fixes the centroids and reconsiders the points.", ["Correct. Only the labels change during this step.", "That is the update step, which runs afterwards.", "k is chosen before the algorithm runs at all."]),
      q("Why does adding clusters always reduce inertia?", ["Each new centroid can only shorten some distances", "The data becomes less noisy", "The algorithm runs more iterations"], 0, "Inertia measures distance to the nearest centroid, so more centroids can only help.", ["Correct. At k equal to the sample count inertia reaches zero.", "The data is unchanged by the choice of k.", "Iteration count is unrelated to the final inertia."]),
      q("Two runs of k-means on the same data give different clusters. What is the most likely cause?", ["Different random initial centroids led to different local optima", "The data changed between runs", "k-means is not deterministic by design"], 0, "Convergence is guaranteed, but not to the same optimum.", ["Correct. This is why n_init runs several initializations and keeps the best.", "The data is identical; only the starting flags differed.", "With a fixed seed and fixed start it is perfectly reproducible."]),
    ],
  },
  {
    lessonId: "py.mc.m3_6.l2",
    atomId: "py.atom.ml.hierarchical-dbscan",
    conceptId: "py.ml.hierarchical-dbscan",
    title: "Hierarchical and density clustering find shapes k-means cannot",
    requires: ["py.ml.kmeans-guided"],
    vocabulary: [
      ["linkage", "the rule deciding how far apart two clusters are"],
      ["dendrogram", "the tree recording which clusters merged and when"],
      ["density reachability", "being connected through a chain of close, crowded neighbours"],
      ["noise point", "a point in no dense region, which DBSCAN refuses to cluster"],
    ],
    opening: "k-means forces you to name the number of clusters and accepts only round ones. Two other families remove those constraints: hierarchical clustering builds every grouping at once and lets you cut later, while density clustering discovers clusters of any shape and is allowed to say that some points belong to nothing.",
    outcome: "You will be able to choose between hierarchical and density clustering, read what a linkage rule implies, and explain why DBSCAN labels some points as noise.",
    why: "Real groups are rarely round. Customer journeys, spatial data, and sensor traces produce elongated and nested structure, and genuine outliers that should not be forced into a cluster at all.",
    mentalModel: "Hierarchical clustering is a family tree: everything eventually merges, and you choose how far down to cut. DBSCAN is a flood filling crowded rooms: it spreads while the crowd stays dense, stops at empty corridors, and leaves stragglers unlabelled.",
    firstTitle: "Merge the closest pair until you stop",
    firstIntro: "Agglomerative clustering starts with every point alone and repeatedly merges the closest pair. The linkage rule defines closest, and it changes the shapes you get.",
    firstCode: `import numpy as np
from sklearn.cluster import AgglomerativeClustering

X = np.array([[0.0], [0.2], [0.4], [5.0], [5.2], [9.0]])

for linkage in ("single", "complete", "average"):
    labels = AgglomerativeClustering(n_clusters=3, linkage=linkage).fit_predict(X)
    print(linkage.ljust(8), labels.tolist())`,
    firstTrace: "All three rules recover the same three groups here because the gaps are unambiguous. The rules differ on harder data: single linkage measures the closest pair of members and can chain along a thin bridge, while complete linkage measures the farthest pair and therefore prefers compact clusters.",
    secondTitle: "Let density decide, including what to exclude",
    secondIntro: "DBSCAN never asks how many clusters exist. It asks whether a point has enough neighbours within a radius, and grows a cluster through those crowded neighbourhoods.",
    secondCode: `from sklearn.cluster import DBSCAN, KMeans
from sklearn.datasets import make_moons

X, _ = make_moons(n_samples=200, noise=0.05, random_state=0)

dbscan_labels = DBSCAN(eps=0.3, min_samples=5).fit_predict(X)
kmeans_labels = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)

print("dbscan clusters", len(set(dbscan_labels) - {-1}))
print("dbscan noise points", int((dbscan_labels == -1).sum()))
print("kmeans splits the moons", len(set(kmeans_labels)))`,
    secondTrace: "The two moons interleave, so no pair of means can separate them and k-means cuts straight through both. DBSCAN follows the density instead and recovers the two crescents. The label `-1` is not a third cluster; it marks points that never sat in a crowded enough neighbourhood.",
    mistake: "Do not treat DBSCAN's `-1` as an ordinary cluster label. Counting it as a group inflates your cluster count and corrupts any metric computed over the labels. Filter noise out deliberately, or report it as a separate quantity.",
    checkpoint: "DBSCAN on a dataset returns one huge cluster and almost no noise. Which parameter would you change first, and in which direction?",
    checkpointAnswer: "Reduce `eps`. Too large a radius makes almost every point a neighbour of every other, so separate dense regions become reachable from one another and merge into a single cluster. Lowering it restores the empty corridors that divide genuine groups.",
    remember: "Hierarchical clustering builds every grouping and defers the cut, with linkage deciding cluster shape. DBSCAN discovers arbitrary shapes from density, needs no cluster count, and deliberately leaves sparse points unlabelled.",
    checks: [
      q("What does DBSCAN's label -1 mean?", ["The point sits in no sufficiently dense region", "The point belongs to the first cluster", "The algorithm failed to converge"], 0, "Noise points are excluded from every cluster on purpose.", ["Correct. Refusing to cluster a straggler is a feature, not an error.", "Cluster labels start at zero; -1 is reserved for noise.", "DBSCAN is a single pass and does not iterate to convergence."]),
      q("Which linkage rule is most likely to chain two groups through a thin bridge of points?", ["Single linkage", "Complete linkage", "Ward linkage"], 0, "Single linkage measures the closest pair of members.", ["Correct. One short hop is enough to merge, so bridges connect groups.", "Complete linkage uses the farthest pair and resists chaining.", "Ward minimizes variance increase and produces compact clusters."]),
      q("What must you supply to DBSCAN that k-means does not need?", ["A neighbourhood radius and a minimum neighbour count", "The number of clusters", "Initial centroid positions"], 0, "DBSCAN's parameters describe density, not cluster count.", ["Correct. Those two numbers define what dense means for your data.", "Not needing k is precisely DBSCAN's advantage.", "There are no centroids in a density-based method."]),
    ],
  },
  {
    lessonId: "py.mc.m3_6.l3",
    atomId: "py.atom.ml.gmm-em",
    conceptId: "py.ml.gmm-em",
    title: "Gaussian mixtures assign softly and fit by expectation-maximization",
    requires: ["py.ml.hierarchical-dbscan"],
    vocabulary: [
      ["mixture component", "one Gaussian, with its own mean, covariance, and weight"],
      ["responsibility", "the probability that one component generated a given point"],
      ["expectation step", "computing responsibilities from the current parameters"],
      ["maximization step", "refitting each component using responsibility-weighted data"],
    ],
    opening: "k-means forces every point into exactly one cluster, which is a strange thing to insist on when a point sits halfway between two groups. A Gaussian mixture keeps the uncertainty: it models the data as several Gaussians and reports, for each point, the probability that each component produced it.",
    outcome: "You will be able to read soft responsibilities, describe the two alternating steps of expectation-maximization, and explain what a mixture can express that k-means cannot.",
    why: "Soft assignments are the honest output whenever groups overlap, and the same expectation-maximization pattern reappears throughout machine learning wherever some variable is hidden.",
    mentalModel: "Each cluster is a fuzzy elliptical cloud rather than a flag. A point in the overlap is not forced to choose a side; it is described as seventy percent from one cloud and thirty percent from the other, and every parameter update weighs it accordingly.",
    firstTitle: "Read the responsibilities, not just the label",
    firstIntro: "A mixture can still produce a hard label by taking the largest probability, but the probabilities themselves carry the information k-means throws away.",
    firstCode: `import numpy as np
from sklearn.mixture import GaussianMixture

X = np.array([[0.0], [0.4], [1.0], [4.6], [5.0], [5.4]])
model = GaussianMixture(n_components=2, random_state=0).fit(X)

probabilities = model.predict_proba(np.array([[0.2], [2.7], [5.2]]))
for point, row in zip([0.2, 2.7, 5.2], probabilities.round(2)):
    print("x =", point, "responsibilities", row.tolist())`,
    firstTrace: "The points at `0.2` and `5.2` sit inside one cloud each, so one responsibility is essentially one and the other essentially zero. The point at `2.7` lies between the groups and receives a genuinely split responsibility, which is exactly the situation a hard assignment would hide.",
    secondTitle: "Alternate expectation and maximization",
    secondIntro: "Fitting is the same alternation as k-means, with soft weights replacing hard membership: compute responsibilities from the current parameters, then refit the parameters using those responsibilities.",
    secondCode: `import numpy as np
from sklearn.mixture import GaussianMixture

rng = np.random.default_rng(0)
X = np.concatenate([rng.normal(0.0, 1.0, 200), rng.normal(6.0, 2.0, 200)]).reshape(-1, 1)

for iterations in (1, 2, 20):
    model = GaussianMixture(
        n_components=2, max_iter=iterations, n_init=1, random_state=0,
    ).fit(X)
    means = np.sort(model.means_.ravel()).round(2)
    print(iterations, "iterations -> means", means.tolist(),
          "log-likelihood", round(model.score(X), 3))`,
    secondTrace: "After a single iteration the means are already separating, and by twenty they have settled near zero and six. The average log-likelihood rises with each round because both steps can only increase it, which is the same monotone-improvement argument that makes k-means converge.",
    mistake: "Do not assume more components always fit better and stop there. Log-likelihood rises with every component added, so comparing raw likelihood always favours the most complex mixture. Use a criterion that charges for parameters, such as BIC, when choosing the component count.",
    checkpoint: "A Gaussian mixture and k-means are fitted to the same well-separated round blobs. Why do their hard labels often agree, and where would they diverge?",
    checkpointAnswer: "With well-separated round clusters of similar size, taking the largest responsibility reproduces nearest-centroid assignment, so the labels agree. They diverge when clusters overlap, when one is much wider than another, or when clusters are elongated, because a mixture can fit different covariances and report uncertainty while k-means cannot.",
    remember: "A Gaussian mixture models data as weighted Gaussians and reports soft responsibilities. Expectation-maximization alternates computing those responsibilities and refitting parameters, raising the likelihood each round.",
    checks: [
      q("What does a responsibility of 0.5 for both components tell you?", ["The point is equally consistent with either component", "The model failed to fit", "The point is an outlier"], 0, "Responsibilities are probabilities of component membership.", ["Correct. The point sits in the overlap, which a hard label would conceal.", "A split responsibility is a normal, informative output.", "Outlyingness is about low density overall, not a tie between components."]),
      q("What happens during the expectation step?", ["Responsibilities are computed from the current parameters", "Means and covariances are refitted", "The number of components is chosen"], 0, "Expectation fixes the parameters and recomputes the soft memberships.", ["Correct. Parameters are held still while memberships update.", "That is the maximization step that follows.", "The component count is chosen before fitting."]),
      q("Why can a Gaussian mixture separate clusters of very different widths when k-means cannot?", ["Each component fits its own covariance, not just a centre", "It uses more iterations", "It ignores distance entirely"], 0, "A mixture models spread as well as location.", ["Correct. Nearest-centroid assignment has no way to express that one cluster is wider.", "Iteration count is not the limitation.", "Density still depends on distance from each component's mean."]),
    ],
  },
  {
    lessonId: "py.mc.m3_6.l4",
    atomId: "py.atom.ml.pca-guided",
    conceptId: "py.ml.pca-guided",
    title: "PCA projects onto the directions that carry the variance",
    requires: ["py.ml.gmm-em"],
    vocabulary: [
      ["principal component", "a direction along which the data varies most"],
      ["explained variance ratio", "the share of total variance a component captures"],
      ["projection", "the coordinates of the data once expressed in the new directions"],
      ["reconstruction", "rebuilding the original coordinates from the kept components"],
    ],
    opening: "Clustering asks which points belong together. Dimensionality reduction asks a different question: which directions actually matter. PCA answers it by finding the axes along which the data spreads most, and letting you discard the rest.",
    outcome: "You will be able to compute principal components from a covariance matrix, read explained variance, and state why centring and scaling change the result.",
    why: "PCA compresses correlated features, removes redundancy before modelling, and makes high-dimensional data visible. It is also the clearest practical use of the eigenvectors and singular values from linear algebra.",
    mentalModel: "Picture a flat, tilted pancake of points floating in three dimensions. PCA finds the pancake's long axis first, its short axis second, and the direction of its negligible thickness last — then lets you drop that last one and lose almost nothing.",
    firstTitle: "Compute components from the covariance matrix",
    firstIntro: "PCA is an eigen-decomposition of the covariance matrix of centred data. Doing it directly shows there is nothing hidden inside the library call.",
    firstCode: `import numpy as np

X = np.array([[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0]])
centred = X - X.mean(axis=0)

covariance = np.cov(centred, rowvar=False)
values, vectors = np.linalg.eigh(covariance)
order = values.argsort()[::-1]
values, vectors = values[order], vectors[:, order]

print("eigenvalues", values.round(3).tolist())
print("share of variance", (values / values.sum()).round(3).tolist())`,
    firstTrace: "Centring is what makes the covariance meaningful; without it the first component would point at the data's location rather than its spread. Sorting the eigenvalues largest first orders the directions by how much variance each captures, and the first one holds almost all of it because these two features are strongly correlated.",
    secondTitle: "Keep components, then measure what you lost",
    secondIntro: "The practical question is how many components to keep. Explained variance answers it, and reconstructing the data shows what discarding the rest actually costs.",
    secondCode: `import numpy as np
from sklearn.decomposition import PCA
from sklearn.datasets import load_iris

X = load_iris().data
model = PCA(n_components=2).fit(X)
projected = model.transform(X)
restored = model.inverse_transform(projected)

print("explained variance ratio", model.explained_variance_ratio_.round(3).tolist())
print("cumulative", round(model.explained_variance_ratio_.sum(), 3))
print("mean reconstruction error", round(np.abs(X - restored).mean(), 4))`,
    secondTrace: "Two of the four original directions carry about ninety-eight percent of the variance, so the projection keeps almost everything. The reconstruction error confirms it numerically: rebuilding four columns from two loses very little, which is what makes the compression worthwhile.",
    mistake: "Do not run PCA on unscaled features with different units. Variance is measured in the feature's own units, so a column recorded in grams will dominate one recorded in kilograms purely because its numbers are larger. Standardize first whenever the units are not comparable.",
    checkpoint: "The first principal component of a dataset explains ninety-five percent of the variance. Does that mean the other features are useless?",
    checkpointAnswer: "No. It means the data lies mostly along one direction, so most of the spread is captured. A low-variance direction can still carry the signal you care about, because variance measures spread and not relevance to a target. PCA is unsupervised and never looks at the labels.",
    remember: "PCA finds orthogonal directions ordered by variance and lets you project onto the largest ones. Centre always, scale when units differ, and remember variance is not the same as usefulness.",
    checks: [
      q("Why must the data be centred before computing principal components?", ["Otherwise the first direction reflects location rather than spread", "Otherwise the eigenvalues become complex", "Otherwise the components stop being orthogonal"], 0, "Covariance is defined on deviations from the mean.", ["Correct. Uncentred data drags the leading direction toward the origin offset.", "A covariance matrix is symmetric, so its eigenvalues are real regardless.", "Orthogonality comes from the symmetry of the matrix, not from centring."]),
      q("What does an explained variance ratio of 0.6 for the first component mean?", ["That direction accounts for sixty percent of the total variance", "The model is sixty percent accurate", "Sixty percent of the rows are kept"], 0, "The ratio is a share of total spread, not of accuracy or of rows.", ["Correct. It measures how much of the spread lies along that axis.", "PCA is unsupervised and has no accuracy.", "Every row is kept; it is the columns that are reduced."]),
      q("PCA is run on features measured in wildly different units without scaling. What happens?", ["The largest-numbered feature dominates the components", "The components become identical", "PCA raises an error"], 0, "Variance is expressed in each feature's own units.", ["Correct. Magnitude, not importance, decides the leading direction.", "They remain distinct, just badly chosen.", "It runs happily and returns a misleading answer."]),
    ],
  },
  {
    lessonId: "py.mc.m3_6.l5",
    atomId: "py.atom.ml.manifold-visualization",
    conceptId: "py.ml.manifold-visualization",
    title: "t-SNE and UMAP preserve neighbourhoods, not distances",
    requires: ["py.ml.pca-guided"],
    vocabulary: [
      ["manifold", "a lower-dimensional surface the data approximately lies on"],
      ["neighbourhood preservation", "keeping nearby points nearby in the new layout"],
      ["perplexity", "roughly how many neighbours t-SNE tries to respect per point"],
      ["embedding", "the low-dimensional layout produced for visualization"],
    ],
    opening: "PCA keeps directions of maximum variance, which is a linear notion. When the interesting structure is curved, a linear projection flattens it away. Neighbour-based methods take a different vow: forget global distances entirely and simply keep near things near.",
    outcome: "You will be able to state what t-SNE optimizes, read an embedding responsibly, and explain which visual features of the plot carry no meaning.",
    why: "These plots appear in nearly every paper that inspects learned representations, and they are misread constantly. Knowing what the axes do not mean is what separates a useful diagnostic from a confident wrong conclusion.",
    mentalModel: "Imagine crumpling a sheet of paper into a ball. PCA photographs the ball and sees a blob. A neighbour-based method instead asks which points were touching on the sheet, and lays them out to keep those contacts — even if that stretches distant parts arbitrarily.",
    firstTitle: "See the structure a linear projection misses",
    firstIntro: "Comparing the two methods on the same curved data makes the difference concrete rather than theoretical.",
    firstCode: `from sklearn.datasets import make_circles
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import numpy as np

X, y = make_circles(n_samples=120, factor=0.4, noise=0.04, random_state=0)

pca_points = PCA(n_components=1).fit_transform(X)
tsne_points = TSNE(
    n_components=1, perplexity=10, init="pca", random_state=0,
).fit_transform(X)

def overlap(points):
    inner, outer = points[y == 1].ravel(), points[y == 0].ravel()
    return round(float(min(inner.max(), outer.max()) - max(inner.min(), outer.min())), 2)

print("pca span overlap", overlap(pca_points))
print("tsne span overlap", overlap(tsne_points))`,
    firstTrace: "The data is two concentric rings, so no straight line separates them and the one-dimensional PCA projection overlaps the classes heavily. t-SNE works from neighbourhoods instead, so the ring memberships survive the reduction far better despite the structure being entirely non-linear.",
    secondTitle: "Check what the picture does not tell you",
    secondIntro: "Running the same embedding twice with different seeds shows exactly how much of the layout is real and how much is an artefact of the optimization.",
    secondCode: `from sklearn.datasets import make_blobs
from sklearn.manifold import TSNE
import numpy as np

X, _ = make_blobs(n_samples=90, centers=3, cluster_std=1.0, random_state=0)

for seed in (0, 1):
    embedded = TSNE(
        n_components=2, perplexity=12, init="pca", random_state=seed,
    ).fit_transform(X)
    spread = embedded.max(axis=0) - embedded.min(axis=0)
    print("seed", seed, "layout width", spread.round(1).tolist())`,
    secondTrace: "Both runs recover the same three groups, but the extent and orientation of the layout differ between seeds. That is the warning: the existence of clusters is informative, while their sizes, their spacing, and the axis values are consequences of the optimization rather than facts about the data.",
    mistake: "Do not measure distances between clusters on a t-SNE or UMAP plot. The method only tries to preserve local neighbourhoods, so two clusters drawn far apart are not necessarily more different than two drawn close together. Use the embedding to spot structure, then verify any claim in the original space.",
    checkpoint: "A t-SNE plot shows one tight cluster and one loose sprawling cluster. Can you conclude the second group is genuinely more variable?",
    checkpointAnswer: "No. Apparent cluster size in the embedding is largely an artefact of the algorithm, which expands sparse regions and compresses dense ones to satisfy neighbourhood constraints. To claim one group is more variable, measure its spread in the original feature space.",
    remember: "t-SNE and UMAP preserve neighbourhoods rather than distances. Trust that clusters exist; do not trust their sizes, spacing, or axis values, and confirm every claim in the original space.",
    checks: [
      q("What does t-SNE try to preserve?", ["Which points are near each other", "The total variance of the data", "The exact pairwise distances"], 0, "It is a neighbourhood-preserving method.", ["Correct. Local structure is the objective; global geometry is not.", "That is PCA's criterion.", "Preserving all distances is precisely what it gives up."]),
      q("Two clusters appear far apart in a t-SNE plot. What may you conclude?", ["Very little — inter-cluster distance is not meaningful", "They are highly dissimilar", "One is an outlier group"], 0, "Only local neighbourhoods are optimized.", ["Correct. Verify any such claim in the original feature space.", "The gap can be an artefact of the layout.", "Outlyingness cannot be read off the embedding either."]),
      q("Why would you still run PCA before t-SNE on very wide data?", ["To remove noise and speed up the neighbour computation", "Because t-SNE requires exactly two input features", "To make the embedding deterministic"], 0, "PCA is often used as a preprocessing step for manifold methods.", ["Correct. A modest linear reduction first makes neighbour search cheaper and less noisy.", "t-SNE accepts any input dimensionality.", "Seeding controls determinism, not PCA."]),
    ],
  },
  {
    lessonId: "py.mc.m3_6.l6",
    atomId: "py.atom.ml.anomaly-detection",
    conceptId: "py.ml.anomaly-detection",
    title: "Anomaly detection scores rarity and is judged on rare events",
    requires: ["py.ml.manifold-visualization"],
    vocabulary: [
      ["anomaly", "a point unlike the bulk of the data already seen"],
      ["contamination", "the assumed share of the training data that is anomalous"],
      ["novelty detection", "scoring new points against a model fitted on clean data"],
      ["isolation", "how few random splits it takes to separate a point from the rest"],
    ],
    opening: "Sometimes the interesting points are the ones that do not fit. Anomaly detection has no labels to learn from and a severe imbalance by definition, so it works by scoring how unusual each point is — and it demands evaluation that survives a base rate of one in a thousand.",
    outcome: "You will be able to choose between density, distance, and isolation approaches, set contamination honestly, and evaluate a detector without being fooled by accuracy.",
    why: "Fraud, intrusion, equipment failure, and data-quality breakage all arrive as rare deviations. These are also the settings where a useless detector can post ninety-nine percent accuracy, so the evaluation discipline matters as much as the model.",
    mentalModel: "Think of a game of twenty questions where each question is a random split of one feature. A typical point hides in the crowd and takes many questions to pin down. An anomaly sits alone and is isolated in two or three — that shortness is the score.",
    firstTitle: "Score rarity with isolation",
    firstIntro: "Isolation forests exploit the fact that anomalies are both few and different, so random splits separate them quickly.",
    firstCode: `import numpy as np
from sklearn.ensemble import IsolationForest

rng = np.random.default_rng(0)
normal = rng.normal(0.0, 1.0, size=(200, 1))
outliers = np.array([[8.0], [-7.5]])
X = np.vstack([normal, outliers])

model = IsolationForest(contamination=0.02, random_state=0).fit(X)
scores = model.score_samples(X)

print("flagged", int((model.predict(X) == -1).sum()))
print("score of a typical point", round(float(scores[0]), 3))
print("score of the extreme point", round(float(scores[-2]), 3))`,
    firstTrace: "`predict` returns `-1` for anomalies and `1` for ordinary points, and the count matches the contamination we declared. The extreme point receives a markedly lower score than a typical one, because far fewer random splits were needed to isolate it.",
    secondTitle: "Evaluate where accuracy is meaningless",
    secondIntro: "With anomalies at one percent, a detector that flags nothing is ninety-nine percent accurate. Precision and recall on the rare class are the only numbers that describe useful behaviour.",
    secondCode: `import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score

rng = np.random.default_rng(1)
X = np.vstack([rng.normal(0.0, 1.0, size=(495, 2)), rng.normal(6.0, 0.4, size=(5, 2))])
truth = np.array([0] * 495 + [1] * 5)

flags = (IsolationForest(contamination=0.01, random_state=0).fit_predict(X) == -1).astype(int)
lazy = np.zeros_like(truth)

print("detector precision", round(precision_score(truth, flags, zero_division=0), 2),
      "recall", round(recall_score(truth, flags), 2))
print("flag-nothing accuracy", round(float((lazy == truth).mean()), 3),
      "recall", round(recall_score(truth, lazy), 2))`,
    secondTrace: "The detector recovers the injected anomalies with meaningful precision and recall. The lazy baseline that flags nothing scores ninety-nine percent accuracy with a recall of zero, which is the whole reason accuracy is the wrong headline number for rare events.",
    mistake: "Do not set `contamination` to whatever makes the output look tidy. It is an assumption about how much of your data is anomalous, and it directly sets the decision threshold. Estimate it from domain knowledge or a labelled sample, and report it alongside the results.",
    checkpoint: "An intrusion detector reports ninety-nine point nine percent accuracy on traffic where attacks are one in a thousand. What have you actually learned?",
    checkpointAnswer: "Almost nothing. Flagging nothing at all achieves the same accuracy, so the number is consistent with a detector that never fires. You need recall on the attack class to know how many attacks were caught, and precision to know how much of the alerting is noise.",
    remember: "Anomaly detection scores rarity without labels using density, distance, or isolation. Contamination sets the threshold and must be justified, and evaluation belongs to precision and recall on the rare class rather than accuracy.",
    checks: [
      q("Why does an isolation forest separate anomalies quickly?", ["They are few and lie apart, so random splits isolate them sooner", "They have larger feature values", "They are always at the dataset's edge in every feature"], 0, "Isolation depth is the score.", ["Correct. Fewer splits are needed to leave a lonely point on its own.", "An anomaly can have perfectly ordinary values in most features.", "It may be anomalous only in a combination of features."]),
      q("What does the contamination parameter actually control?", ["The threshold deciding how many points get flagged", "How long the model trains", "The number of trees in the forest"], 0, "Contamination is the assumed anomaly rate.", ["Correct. It converts continuous scores into a decision.", "Training cost is unrelated to it.", "The tree count is a separate parameter."]),
      q("A rare-event detector reports 99% accuracy. What should you ask for next?", ["Precision and recall on the rare class", "The training loss curve", "A larger test set"], 0, "Accuracy is dominated by the majority class.", ["Correct. Those two numbers reveal whether anything was actually caught.", "The loss curve says nothing about rare-class behaviour.", "More data does not fix a misleading metric."]),
    ],
  },
];

export const ML_UNSUPERVISED_ATOMS = ML_UNSUPERVISED_SPECS.map(guidedMasteryAtom);
export const ML_UNSUPERVISED_CONCEPTS = ML_UNSUPERVISED_SPECS.map(guidedMasteryConcept);
export const ML_UNSUPERVISED_LESSON_CONTENT = guidedLessonContent(ML_UNSUPERVISED_SPECS);
