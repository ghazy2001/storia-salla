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
  // Fail-safe: Ensure preloader is removed even if React app crashes or hangs
  // This prevents the "Green Screen of Death" where the site stays locked forever.
  setTimeout(() => {
    const nativeStyle = document.getElementById("storia-preloader-style");
    const nativeLoader = document.getElementById("native-preloader");
    const shield = document.getElementById("storia-salla-shield");

    if (nativeStyle) nativeStyle.remove();
    if (nativeLoader) nativeLoader.remove();
    if (shield) shield.remove();

    // Reset body styles just in case
    document.body.style.overflow = "";
    document.body.style.backgroundColor = "";
  }, 5000); // 5 seconds max wait time

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // The Preloader component in React will handle removing the native loader
  // once the app is fully mounted and ready to display.
} else {
  // Salla Native Page Detected - React App Halted.
}
