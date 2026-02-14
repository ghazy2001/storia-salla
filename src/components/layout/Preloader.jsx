import React, { useEffect, useState } from "react";
import { resolveAsset } from "../../utils/assetUtils";

const Preloader = ({ isReady }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (isReady) {
      // 1. Start the fade-out of the React preloader
      const timer = setTimeout(() => {
        setShouldRender(false);

        // 2. Cleanup Native Loader & Styles (after React is visible)
        // We do this here to ensure no "white flash" occurs.

        // Remove the style block that forces green background
        const nativeStyle = document.getElementById("storia-preloader-style");
        if (nativeStyle) nativeStyle.remove();

        // Remove the native preloader DOM element (if it exists outside root)
        const nativeLoader = document.getElementById("native-preloader");
        if (nativeLoader) nativeLoader.remove();

        // Reset body styles to allow scrolling and correct theme background
        document.body.style.overflow = "";
        document.body.style.backgroundColor = "";
      }, 1000); // Match the duration-1000 in App.jsx and css transition

      // Also clean up Salla shield if present
      const shield = document.getElementById("storia-salla-shield");
      if (shield) {
        shield.style.opacity = "0";
        setTimeout(() => shield.remove(), 500);
      }

      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-brand-charcoal flex items-center justify-center transition-opacity duration-700 ease-in-out ${isReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="relative">
        <img
          src={resolveAsset("assets/logo.png")}
          alt="Storia Logo"
          className="h-16 brightness-0 invert animate-pulse"
          style={{ animationDuration: "2s" }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default Preloader;
