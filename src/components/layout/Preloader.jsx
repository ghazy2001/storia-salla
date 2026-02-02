import React, { useEffect, useState } from "react";

const Preloader = ({ isReady }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (isReady) {
      // Allow the fade-out transition to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 1000);
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
          src="/assets/logo.png"
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
