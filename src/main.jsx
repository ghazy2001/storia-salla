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

  // Remove the Salla preloader once React is ready
  const removePreloader = () => {
    const preloader = document.getElementById("storia-preloader");
    const style = document.getElementById("storia-preloader-style");

    // Fade out preloader
    if (preloader) {
      preloader.style.opacity = "0";
      setTimeout(() => preloader.remove(), 500);
    }

    // Remove the blocking styles to reveal the React app
    if (style) {
      setTimeout(() => style.remove(), 100); // Slight delay to ensure React painted
    }

    // Reset body styles
    document.body.style.overflow = "";
    document.body.style.backgroundColor = "";
  };

  // Run immediately mostly, or wait for window load if needed
  removePreloader();
} else {
  console.log("💰 Salla Native Page Detected - React App Halted.");
}
