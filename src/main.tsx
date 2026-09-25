import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { SettingsProvider } from "./settings";
import { TypingProvider } from "./components/typing/store";
import { ToastProvider } from "./components/Toast";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { AccountProvider } from "./account";
import { initMonitoring } from "./monitoring";
import BetaAccessGate from "./access";
import "@fontsource-variable/inter/wght.css";
import "./styles.css";
import "./components/typing/typing.css";
import "./product.css";
import "./workspace.css";

const App = lazy(() => import("./App"));
initMonitoring();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <SettingsProvider>
        <BetaAccessGate>
        <AccountProvider>
          <TypingProvider>
            <ToastProvider>
              <Suspense fallback={<main className="boot-screen" aria-label="Loading Hyzr Code" />}>
                <App />
              </Suspense>
            </ToastProvider>
          </TypingProvider>
        </AccountProvider>
        </BetaAccessGate>
      </SettingsProvider>
    </AppErrorBoundary>
  </StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Hyzr Code could not enable offline support.", error);
    });
  });
}

import "./syntax.css";
