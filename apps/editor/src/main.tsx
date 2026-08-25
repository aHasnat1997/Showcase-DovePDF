import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "./index.css";
import App from "./App.tsx";
import { ensureGoogleAdSense, initGoogleAnalytics } from "./lib/google";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

initGoogleAnalytics();
void ensureGoogleAdSense();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
