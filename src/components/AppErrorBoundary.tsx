import { Component, type ErrorInfo, type ReactNode } from "react";
import { Mark } from "./Brand";

interface State {
  error: Error | null;
}

export default class AppErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Hyzr Code UI failed", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="fatal-screen">
        <section className="fatal-card" role="alert">
          <div className="fatal-mark"><Mark size={23} /></div>
          <span className="badge">Recovery mode</span>
          <h1>This screen hit an unexpected error</h1>
          <p>
            Your course progress is still stored locally. Reload first. If the
            same screen keeps failing, reset only the interface settings—your
            attempts, mastery, and streak remain untouched.
          </p>
          <div className="row wrap" style={{ gap: 8 }}>
            <button className="primary" onClick={() => location.reload()}>
              Reload Hyzr Code
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("forge.settings.v1");
                location.reload();
              }}
            >
              Reset interface settings
            </button>
          </div>
          <details>
            <summary>Technical detail</summary>
            <code>{this.state.error.message}</code>
          </details>
        </section>
      </main>
    );
  }
}
