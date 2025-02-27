import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // This should match how App is exported

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);