/* STORIA DESIGN LOADER v12 - GREEN MODE (NO SCROLL FIX) */
(function () {
  const path = window.location.pathname.toLowerCase();

  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log(
    "🚀 Storia Design Loader v12: Initializing (Green Mode - Clean)...",
  );
  console.log("📍 Current Path:", path);

  // 1. Immediate Style Injection
  const isSallaPage =
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart");

  const style = document.createElement("style");
  style.id = "storia-preloader-style";

  let cssContent = `
    /* Basic Green Background Only */
    html, body { 
      background-color: #0e352f !important; /* Brand Green */
      margin: 0; padding: 0;
    }
    #root { 
      display: block; width: 100%; height: 100%; 
    }
  `;

  if (!isSallaPage) {
    cssContent += `
    /* Hide Salla Elements Globally (Only on React Pages) */
    .store-header, .site-header, .header, .salla-header,
    .store-footer, .site-footer, .footer,
    .mobile-menu, .salla-navbar, .app-header,
    .store-info__detail h1,
    .store-info h1,
    header.store-info h1,
    .store-info__detail > h1,
    .store-info__name, .merchant-info {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
    }
    `;
  }

  cssContent += `
    /* Native Preloader Styles */
    #native-preloader {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #0e352f; /* Brand Green */
        display: flex; align-items: center; justify-content: center;
    }
    .storia-logo-spinner {
        height: 4rem; width: auto;
        /* Start with White Logo */
        filter: brightness(0) invert(1);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.95); }
    }
  `;

  style.innerHTML = cssContent;
  document.head.appendChild(style);

  // 2. Brute Force Name Removal (Mutation Sync) - REDUCED AGGRESSION
  const hideNameBruteForce = () => {
    // Scroll fix removed as requested
    const targets = ["Mahmoud Ghazy", "محمود غازي", "MahmoudGhazy"];
    const selectors = "h1, h2, h3, h4, h5, span, p, div, a, .store-info__name";

    document.querySelectorAll(selectors).forEach((el) => {
      const text = el.textContent || "";
      if (targets.some((t) => text.includes(t))) {
        const container =
          el.closest(
            ".store-info, .header, .flex, .salla-header, .navbar-item",
          ) || el;
        container.style.setProperty("display", "none", "important");
        container.style.setProperty("visibility", "hidden", "important");
        container.style.setProperty("opacity", "0", "important");
      }
    });
  };

  // Run immediately and set up observer
  hideNameBruteForce();
  // Relaxed interval to avoid CPU spikes
  setInterval(hideNameBruteForce, 1000);

  // Only observe if we are NOT on a Salla page (to avoid messing with checkout DOM too much)
  if (!isSallaPage) {
    const observer = new MutationObserver(hideNameBruteForce);
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // 3. Path Handling
  if (isSallaPage) {
    const existingRoot = document.getElementById("root");
    if (existingRoot) existingRoot.remove();
    console.log(
      "🛠️ In Salla Native Path (Cart/Checkout) - React app disabled.",
    );
    return;
  }

  // 4. Inject Loader HTML - OUTSIDE of #root
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

  // 5. Load App
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${VERCEL_URL}/assets/app.css?v=${TIMESTAMP}`;
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.type = "module";
  script.crossOrigin = "anonymous";
  script.src = `${VERCEL_URL}/assets/app.js?v=${TIMESTAMP}`;
  document.body.appendChild(script);
})();
