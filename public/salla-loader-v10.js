/* STORIA DESIGN LOADER v10 - GREEN NATIVE PRELOADER (FIXED) */
(function () {
  const path = window.location.pathname.toLowerCase();

  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v10: Initializing...");
  console.log("📍 Current Path:", path);

  // 1. Immediate Style Injection (Green Background + White Spinner)
  const style = document.createElement("style");
  style.id = "storia-preloader-style";
  style.innerHTML = `
    html, body { 
      background-color: #fdfcf8 !important; /* Brand Light Beige */
      margin: 0; padding: 0; 
      height: 100%; width: 100%;
      overflow: hidden !important; 
    }
    #root { 
      display: block; width: 100%; height: 100%; 
    }
    /* Hide Salla Elements */
    .store-header, .site-header, .header, 
    .store-footer, .site-footer, .footer,
    .mobile-menu, .salla-navbar, .app-header,
    .store-info__detail h1,
    .store-info h1,
    header.store-info h1,
    .store-info__detail > h1 {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
    }
    /* Native Preloader Styles */
    #native-preloader {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #fdfcf8; /* Brand Light Beige */
        display: flex; align-items: center; justify-content: center;
    }
    .storia-logo-spinner {
        height: 4rem; width: auto;
        /* Use original color for light background */
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.95); }
    }
  `;
  document.head.appendChild(style);

  if (
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart")
  ) {
    const existingRoot = document.getElementById("root");
    if (existingRoot) existingRoot.remove();
    return;
  }

  // 2. Inject Loader HTML - OUTSIDE of #root
  // This is the key fix: we append to body so React doesn't wipe it out when it mounts
  let preloaderDiv = document.getElementById("native-preloader");
  if (!preloaderDiv) {
    preloaderDiv = document.createElement("div");
    preloaderDiv.id = "native-preloader";
    preloaderDiv.innerHTML = `
        <img src="${VERCEL_URL}/assets/logo.png" alt="Loading..." class="storia-logo-spinner" />
      `;
    document.body.prepend(preloaderDiv);
  }

  // Ensure Root Exists for React
  let rootDiv = document.getElementById("root");
  if (!rootDiv) {
    rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);
  }

  console.log("🚀 Storia Design: Loading App (Green Mode v10)...");

  // 3. Load App
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${VERCEL_URL}/assets/app.css?v=${TIMESTAMP}`;
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.type = "module";
  script.crossOrigin = "anonymous";
  script.src = `${VERCEL_URL}/assets/app.js?v=${TIMESTAMP}`;

  script.onload = () => {
    console.log("✅ Script Loaded.");
  };

  document.body.appendChild(script);
})();
