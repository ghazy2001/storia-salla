import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Removed console.log for production build

const path = window.location.pathname.toLowerCase();
const isSallaPage =
  path.includes("/payment") ||
  path.includes("/checkout") ||
  path.includes("/cart");

if (!isSallaPage) {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.log("💰 Salla Native Page Detected - React App Halted.");
}
