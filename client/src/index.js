import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css"; // Import our custom styles
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);