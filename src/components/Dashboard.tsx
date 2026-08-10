import type { Progress } from "../types";
import { FAILURE_MODES } from "../types";
import { CONCEPT_BY_ID, STAGE_NAMES } from "../content";
import { isDue, strengthOf, weakest } from "../engine/mastery";
import { buildSession, conceptIdsFor } from "../engine/scheduler";
import { streakDays, todayKey } from "../engine/storage";
import { useSettings } from "../settings";
import { Heatmap, Sparkline } from "./Brand";
import { MasteryBar, ReviewForecast } from "./Forecast";
import { weeksUntil } from "../content/tracks";
import { ACTIVE_SWE_PREPARATION_LEVEL, COURSE_BY_ID, trackForCourse } from "../content/courses";

/**
 * One sentence on what to do next, and why.
 *
 * The failure-mode tally is the most useful thing this app collects and it was
 * buried three cards down. Four of the six modes are *not* fixed by solving
 * another problem, so the recommendation has to name the mode rather than say
 * "keep practising".
 */
function recommend(input: {
  started: boolean;
  dueCount: number;
  minutesToday: number;
  target: number;
  coldRate: number | null;
  topMode: { id: string; label: string; count: number } | null;
  totalFailures: number;
}): { headline: string; why: string } {
  if (!input.started) {
    return {
      headline: "Start with one lesson.",
      why: "Nothing here means anything until there's data. Work through a lesson in the course — the numbers on this page start answering questions after about three sessions.",
    };
  }

  if (input.topMode && input.totalFailures >= 3) {
    const share = Math.round((input.topMode.count / input.totalFailures) * 100);
    if (input.topMode.id === "syntax") {
      return {
        headline: `${share}% of your failures are "knew it, couldn't write it".`,
        why: "That is a retrieval problem, and more algorithm practice does nothing for it. Run the daily session — it's already queuing type-it-out and API drills instead of new problems.",
      };
    }
    if (input.topMode.id === "pattern") {
      return {
        headline: `${share}% of your failures are not recognising the approach.`,
        why: "You'd solve these if someone named the pattern. Classification drills are roughly fifty times cheaper per rep than solving, so the pattern round is where that gets fixed.",
      };
    }
    if (input.topMode.id === "complexity") {
      return {
        headline: `${share}% of your failures were correct but too slow.`,
        why: "Complexity is fifteen seconds a rep to drill and it's the difference between a hire and a no-hire on identical code.",
      };
    }
    if (input.topMode.id === "edge") {
      return {
        headline: `${share}% of your failures were edge cases.`,
        why: "The shape was right, the boundaries weren't. Before running anything today, say it out loud: empty, one element, duplicates, negatives.",
      };
    }
  }

  if (input.dueCount > 20) {
    return {
      headline: `${input.dueCount} concepts are due.`,
      why: "Strength decays whether or not you show up. A session now costs less than the same material will cost next week.",
    };
  }

  if (input.minutesToday >= input.target) {
    return {
      headline: "Today's target is done.",
      why: "Anything past this is a bonus. The spacing does the work between sessions — showing up tomorrow matters more than going longer now.",
    };
  }

  if (input.coldRate !== null && input.coldRate < 40) {
    return {
      headline: `Cold-solve rate is ${input.coldRate}%.`,
      why: "That's the only number that predicts an interview. Solving with hints is evidence you understood it, not evidence you can produce it — push for L4 attempts even when they fail.",
    };
  }

  return {
    headline: `${Math.max(0, input.target - input.minutesToday)} minutes left today.`,
    why: "Cheap drills first, then a pattern round, then one cold solve. The expensive rep is deliberately the smallest slice.",
  };
}

export default function Dashboard({
  progress,
  onStart,
  onConcept,
}: {
  progress: Progress;
  onStart: () => void;
  onConcept: (id: string) => void;
}) {
  const { settings } = useSettings();
  const language = settings.learning.language;
  const course = settings.learning.course;
  const preparationLevel = course === "swe" ? ACTIVE_SWE_PREPARATION_LEVEL : undefined;
  const preparation = {
    track: trackForCourse(course, preparationLevel),
    experience: settings.profile.experience,
    deadlineWeeks: weeksUntil(settings.profile.interviewDate),
    preparationLevel,
  };
  const conceptIds = conceptIdsFor(language);
  const now = Date.now();
  const session = buildSession(progress, now, todayKey(now), language, preparation);

  const problemAttempts = progress.attempts.filter(
    (a) => a.unitKind === "problem",
  );
  const coldAttempts = problemAttempts.filter((a) => a.level === "L4");
  const coldSolves = coldAttempts.filter(
    (a) => a.passed && a.hintsUsed === 0,
  ).length;
  const coldRate = coldAttempts.length
    ? Math.round((coldSolves / coldAttempts.length) * 100)
    : null;

  const predicted = problemAttempts.filter((a) => a.predicted);
  const calibrated = predicted.filter(
    (a) =>
      (a.predicted === "yes" && a.passed) ||
      (a.predicted === "no" && !a.passed) ||
      a.predicted === "maybe",
  ).length;
  const calibration = predicted.length
    ? Math.round((calibrated / predicted.length) * 100)
    : null;

  const dueCount = conceptIds.filter((id) =>
    isDue(progress.concepts[id], now),
  ).length;

  const today = progress.sessions.find((s) => s.date === todayKey(now));
  const minutesToday = Math.round((today?.seconds ?? 0) / 60);

  const modeCounts = FAILURE_MODES.map((mode) => ({
    ...mode,
    count: problemAttempts.filter((a) => a.failureMode === mode.id).length,
  })).sort((a, b) => b.count - a.count);
  const totalFailures = modeCounts.reduce((sum, m) => sum + m.count, 0);

  const weakConcepts = weakest(progress, conceptIds, now, 8);
  const started = problemAttempts.length > 0;
  const recentLectureScores = progress.lectureReviews.slice(-20).map((review) => review.score);
  const lectureScore = recentLectureScores.length
    ? Math.round(recentLectureScores.reduce((sum, score) => sum + score, 0) / recentLectureScores.length)
    : null;
  const activeTrack = COURSE_BY_ID.get(course) ?? COURSE_BY_ID.get("python")!;
  const advice = recommend({
    started,
    dueCount,
    minutesToday,
    target: settings.learning.dailyMinutes,
    coldRate,
    topMode: modeCounts[0]?.count ? modeCounts[0] : null,
    totalFailures,
  });

  return (
    <>
      <div className="prep-profile-strip">
        <div>
          <span className="badge">{activeTrack.label}</span>
          <strong>{settings.profile.stage === "internship" ? "Internship preparation" : settings.profile.stage === "new-grad" ? "New-grad preparation" : "Experienced preparation"}</strong>
        </div>
        <span>{preparation.deadlineWeeks === null ? `${settings.profile.weeklyHours} hrs/week` : `${preparation.deadlineWeeks} weeks · ${settings.profile.weeklyHours} hrs/week`}</span>
      </div>
      <div className="stat-grid">
        <div className="stat">
          <div className="value">{streakDays(progress)}</div>
          <div className="label">Day streak</div>
        </div>
        <div className="stat">
          <div className="value">{minutesToday}m</div>
          <div className="label">Today</div>
          <Sparkline progress={progress} />
        </div>
        <div className="stat">
          <div className="value">{coldRate === null ? "—" : `${coldRate}%`}</div>
          <div className="label">Cold-solve rate</div>
          <div className="note">the north star</div>
        </div>
        <div className="stat">
          <div className="value">
            {calibration === null ? "—" : `${calibration}%`}
          </div>
          <div className="label">Calibration</div>
          <div className="note">do you know what you know</div>
        </div>
        <div className="stat">
          <div className="value">{dueCount}</div>
          <div className="label">Concepts due</div>
        </div>
        <div className="stat">
          <div className="value">{lectureScore === null ? "—" : `${lectureScore}`}</div>
          <div className="label">Lecture learning score</div>
          <div className="note">last {recentLectureScores.length || 0} retrieval checks</div>
        </div>
      </div>

      <div className="next-action">
        <div className="headline">{advice.headline}</div>
        <p className="why" style={{ margin: 0 }}>
          {advice.why}
        </p>
      </div>

      <div className="card">
        <h2 className="section">Review forecast</h2>
        <p className="small muted" style={{ marginTop: -6, marginBottom: 16 }}>
          What the scheduler has already committed you to. Each bar is a day;
          the red one is work that's slipped past its interval.
        </p>
        <ReviewForecast progress={progress} />
      </div>

      <div className="card">
        <h2 className="section">Where every concept stands</h2>
        <p className="small muted" style={{ marginTop: -6, marginBottom: 16 }}>
          Strength decays with time. Anything in Fading or Gone is what the
          daily session is quietly pulling back in.
        </p>
        <MasteryBar progress={progress} />
      </div>

      <div className="card">
        <div className="row spread wrap" style={{ gap: 14 }}>
          <div>
            <h2 className="section" style={{ margin: "0 0 4px" }}>
              Today's session
            </h2>
            <div style={{ fontSize: 17, fontWeight: 600 }}>
              {session.steps.length} units · ~{session.estimate} min
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              {describe(session.steps)}
            </div>
          </div>
          <button className="primary" onClick={onStart}>
            {minutesToday > 0 ? "Keep going" : "Start session"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row spread" style={{ marginBottom: 14 }}>
          <h2 className="section" style={{ margin: 0 }}>
            Twelve weeks
          </h2>
          <span className="tiny dim">
            Consistency beats intensity — the spacing only works if tomorrow
            happens.
          </span>
        </div>
        <div style={{ maxWidth: 620 }}>
          <Heatmap progress={progress} />
        </div>
      </div>

      {totalFailures > 0 ? (
        <div className="card">
          <h2 className="section">Why you fail</h2>
          <p className="small muted" style={{ marginTop: -6 }}>
            The tallest bar is what to fix. Four of these six are not solved by
            doing more problems.
          </p>
          {modeCounts
            .filter((m) => m.count > 0)
            .map((mode) => (
              <div className="concept-row" key={mode.id}>
                <span className="small">{mode.label}</span>
                <div className="bar">
                  <i style={{ width: `${(mode.count / totalFailures) * 100}%` }} />
                </div>
                <span className="tiny dim" style={{ textAlign: "right" }}>
                  {mode.count}
                </span>
              </div>
            ))}
        </div>
      ) : null}

      {weakConcepts.length ? (
        <div className="card">
          <h2 className="section">Weakest concepts</h2>
          {weakConcepts.map(({ id }) => {
            const concept = CONCEPT_BY_ID.get(id);
            const value = strengthOf(progress.concepts[id], now);
            return (
              <div className="concept-row" key={id}>
                <button
                  className="ghost small"
                  onClick={() => onConcept(id)}
                  style={{
                    justifyContent: "flex-start",
                    padding: "2px 0",
                    textAlign: "left",
                  }}
                >
                  {concept?.title ?? id}
                  <span className="tiny dim">
                    · {STAGE_NAMES[concept?.stage ?? 0]}
                  </span>
                </button>
                <div className="bar">
                  <i
                    style={{
                      width: `${Math.round(value * 100)}%`,
                      background:
                        value < 0.35 ? "var(--fail)" : "var(--accent)",
                    }}
                  />
                </div>
                <span className="tiny dim" style={{ textAlign: "right" }}>
                  {Math.round(value * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {!started ? (
        <div className="card">
          <h2 className="section">Getting started</h2>
          <p className="small muted" style={{ marginTop: -6, marginBottom: 0 }}>
            Nothing here fills in until you've attempted something. Work through
            a lesson in the course, or open a problem, and this page starts
            telling you which of the six failure modes is actually costing you.
          </p>
        </div>
      ) : null}
    </>
  );
}

function describe(steps: ReturnType<typeof buildSession>["steps"]): string {
  const atoms = steps.filter((s) => s.kind === "atom").length;
  const drills = steps.filter((s) => s.kind === "drill").length;
  const problems = steps.filter((s) => s.kind === "problem").length;
  const parts: string[] = [];
  if (atoms) parts.push(`${atoms} lecture${atoms > 1 ? "s" : ""}`);
  if (drills) parts.push(`${drills} drills, interleaved`);
  if (problems) parts.push(`${problems} cold solve`);
  return parts.join(" · ");
}
