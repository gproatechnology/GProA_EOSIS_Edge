import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const renderApp = () => {
  const container = document.getElementById("root");
  console.log("GProA EDGE - Root container found:", !!container);
  
  if (!container) {
    console.error("GProA EDGE - Critical Error: Root element not found in DOM.");
    return;
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderApp);
} else {
  renderApp();
}
