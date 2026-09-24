import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectCheckpoint } from "../content/projects";
import { PROJECT_SHIPPING_REQUIREMENTS } from "../content/projects";

export default function PortfolioProjects({ checkpoint }: { checkpoint: ProjectCheckpoint }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const project = checkpoint.projects[activeIndex];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const dialog = closeRef.current?.closest<HTMLElement>(".portfolio-dialog");
        const focusable = dialog
          ? [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
          : [];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="portfolio-checkpoint">
        <div className="portfolio-checkpoint-copy">
          <span className="portfolio-checkpoint-eyebrow">Portfolio checkpoint {checkpoint.number}</span>
          <h3>{checkpoint.title}</h3>
          <p>{checkpoint.description}</p>
          <div className="portfolio-checkpoint-options" aria-label="Project choices">
            {checkpoint.projects.map((choice) => <span key={choice.id}>{choice.title}</span>)}
          </div>
        </div>
        <button
          ref={triggerRef}
          type="button"
          className="primary portfolio-checkpoint-button"
          onClick={() => {
            setActiveIndex(0);
            setOpen(true);
          }}
        >
          View projects
          <small>3 to choose from</small>
        </button>
      </div>

      {open ? createPortal((
        <div
          className="portfolio-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="portfolio-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <header className="portfolio-dialog-header">
              <div>
                <span>Portfolio checkpoint {checkpoint.number}</span>
                <h2 id={titleId}>{checkpoint.title}</h2>
                <p>Choose one. Finish every requirement before calling it complete.</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="ghost portfolio-dialog-close"
                onClick={() => setOpen(false)}
                aria-label="Close project details"
              >
                Close
              </button>
            </header>

            <div className="portfolio-dialog-layout">
              <nav className="portfolio-project-tabs" aria-label="Choose a project">
                {checkpoint.projects.map((choice, index) => (
                  <button
                    type="button"
                    key={choice.id}
                    className={index === activeIndex ? "active" : ""}
                    onClick={() => setActiveIndex(index)}
                    aria-pressed={index === activeIndex}
                  >
                    <span>Choice {index + 1}</span>
                    <b>{choice.title}</b>
                    <small>{choice.tagline}</small>
                  </button>
                ))}
                <div className="portfolio-choice-note">
                  One excellent finished project is worth more than three incomplete repositories.
                </div>
              </nav>

              <article className="portfolio-project-spec" key={project.id}>
                <div className="portfolio-project-hero">
                  <div className="portfolio-project-meta">
                    <span>{project.difficulty}</span>
                    <span>{project.estimatedHours}</span>
                  </div>
                  <h2>{project.title}</h2>
                  <p className="portfolio-project-tagline">{project.tagline}</p>
                  <p>{project.summary}</p>
                  <div className="portfolio-signal"><b>Why it belongs on a résumé</b>{project.resumeSignal}</div>
                </div>

                <section className="portfolio-spec-section">
                  <div className="portfolio-section-number">01</div>
                  <div>
                    <h3>Required stack</h3>
                    <div className="portfolio-stack">
                      {project.stack.map((item) => <span key={item}>{item}</span>)}
                    </div>
                  </div>
                </section>

                <section className="portfolio-spec-section">
                  <div className="portfolio-section-number">02</div>
                  <div>
                    <h3>Architecture contract</h3>
                    <ul>{project.architecture.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                </section>

                <section className="portfolio-spec-section">
                  <div className="portfolio-section-number">03</div>
                  <div>
                    <h3>Build milestones</h3>
                    <div className="portfolio-milestones">
                      {project.milestones.map((milestone, index) => (
                        <div className="portfolio-milestone" key={milestone.title}>
                          <span>Milestone {index + 1}</span>
                          <h4>{milestone.title}</h4>
                          <p>{milestone.outcome}</p>
                          <ul>{milestone.tasks.map((task) => <li key={task}>{task}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="portfolio-spec-section">
                  <div className="portfolio-section-number">04</div>
                  <div>
                    <h3>Acceptance tests</h3>
                    <p className="portfolio-section-intro">The project is not complete until all of these pass automatically.</p>
                    <ul className="portfolio-check-list">
                      {project.acceptanceTests.map((test) => <li key={test}>{test}</li>)}
                    </ul>
                  </div>
                </section>

                <section className="portfolio-spec-section">
                  <div className="portfolio-section-number">05</div>
                  <div>
                    <h3>Shipping requirements</h3>
                    <p className="portfolio-section-intro">These requirements apply to every project in the course.</p>
                    <ul className="portfolio-check-list">
                      {PROJECT_SHIPPING_REQUIREMENTS.map((requirement) => <li key={requirement}>{requirement}</li>)}
                    </ul>
                  </div>
                </section>

                <section className="portfolio-spec-section">
                  <div className="portfolio-section-number">06</div>
                  <div>
                    <h3>Only after the core is finished</h3>
                    <ul>{project.stretchGoals.map((goal) => <li key={goal}>{goal}</li>)}</ul>
                  </div>
                </section>

                <section className="portfolio-resume-proof">
                  <span>Example résumé bullet — rewrite it with your real measurements</span>
                  <p>{project.resumeBullet}</p>
                  <small>Never claim scale, performance, users, or impact you did not measure.</small>
                </section>
              </article>
            </div>
          </section>
        </div>
      ), document.body) : null}
    </>
  );
}
