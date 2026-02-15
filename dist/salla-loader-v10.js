/* STORIA DESIGN LOADER v11 - SCROLL FIX */
(function () {
  const path = window.location.pathname.toLowerCase();

  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v10: Initializing (Aggressive Mode)...");
  console.log("📍 Current Path:", path);

  // 1. Immediate Style Injection (Green/Beige Background + Hide Salla Headers)
  const style = document.createElement("style");
  style.id = "storia-preloader-style";
  style.innerHTML = `
    html, body { 
      background-color: #fdfcf8 !important; /* Brand Light Beige */
      /* Ensure scrolling is ALWAYS enabled */
      overflow-y: auto !important;
      overflow-x: hidden;
      height: auto !important;
      min-height: 100%;
    }
    #root { 
      display: block; width: 100%; height: 100%; 
    }
    /* Hide Salla Elements Globally */
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
    /* Native Preloader Styles */
    #native-preloader {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #fdfcf8; /* Brand Light Beige */
        display: flex; align-items: center; justify-content: center;
    }
    .storia-logo-spinner {
        height: 4rem; width: auto;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.95); }
    }
  `;
  document.head.appendChild(style);

  // 2. Brute Force Name Removal (Mutation Sync)
  const hideNameBruteForce = () => {
    const targets = ["Mahmoud Ghazy", "محمود غازي", "MahmoudGhazy"];
    const selectors = "h1, h2, h3, h4, h5, span, p, div, a, .store-info__name";

    document.querySelectorAll(selectors).forEach((el) => {
      const text = el.textContent || "";
      if (targets.some((t) => text.includes(t))) {
        // Hide the element and its closest container if it looks like a header part
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
  setInterval(hideNameBruteForce, 500); // Polling for fast removal
  const observer = new MutationObserver(hideNameBruteForce);
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  // 3. Path Handling (Modified: Remove #root but DO NOT return early)
  if (
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart")
  ) {
    const existingRoot = document.getElementById("root");
    if (existingRoot) existingRoot.remove();
    // Note: We used to return here, but now we continue to let the app load or name hiding work
    if (path.includes("/checkout") || path.includes("/payment")) {
      console.log("🛠️ In Checkout Path - Name removal active.");
      return; // Still return on checkout to avoid loading the whole React app on Salla's checkout
    }
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
