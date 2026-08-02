import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SettingsProvider } from "./settings";
import { TypingProvider } from "./components/typing/store";
import { ToastProvider } from "./components/Toast";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./styles.css";
import "./components/typing/typing.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <SettingsProvider>
        <TypingProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </TypingProvider>
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
