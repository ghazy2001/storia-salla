/* STORIA DESIGN LOADER v10.3 - ULTIMATE REMOVAL */
(function () {
  // Normalize path
  const path = window.location.pathname.toLowerCase();
  const fullHref = window.location.href.toLowerCase();

  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v10.3: Initializing...");
  console.log("📍 Path:", path);
  console.log("🔗 Href:", fullHref);

  // 1. Immediate Style Injection (Green Background + White Spinner)
  const style = document.createElement("style");
  style.id = "storia-preloader-style";
  style.innerHTML = `
    html, body { 
      background-color: #0e352f !important; /* Brand Green */
      margin: 0; padding: 0; 
      height: 100%; width: 100%;
      overflow: hidden !important; 
    }
    #root { 
      display: block; width: 100%; height: 100%; 
    }
    /* Hide Salla Elements - Enhanced Specificity */
    .store-header, .site-header, .header, 
    .store-footer, .site-footer, .footer,
    .mobile-menu, .salla-navbar, .app-header,
    .store-info__detail h1,
    .store-info h1,
    header.store-info h1,
    .store-info__detail > h1,
    h1.store-name,
    .store-name {
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
        background-color: #0e352f; /* Brand Green */
        display: flex; align-items: center; justify-content: center;
    }
    .storia-logo-spinner {
        height: 4rem; width: auto;
        /* Start with White Logo (brightness-0 invert-1) */
        filter: brightness(0) invert(1);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.95); }
    }
  `;
  document.head.appendChild(style);

  // 2. Nuclear Element Removal (Run Always)
  // Logic: Scan for headers with the name and DESTROY them.
  const hideStoreName = () => {
    // Target specifically the container if possible? No, stick to text.
    const tags = ["h1", "h2", "div", "span"]; // expanded tags just in case

    tags.forEach((tagName) => {
      const elements = document.getElementsByTagName(tagName);
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        // Check ancestors for '.store-info' to be safe we don't hide body content incorrectly
        // But the name "Mahmoud Ghazy" is specific enough
        const text = (el.textContent || el.innerText || "")
          .toLowerCase()
          .trim();

        // Case insensitive matching for name
        const targetName1 = "mahmoud ghazy";
        const targetName2 = "محمود غازي";

        if (
          text === targetName1 ||
          text === targetName2 ||
          text.includes(targetName1) ||
          text.includes(targetName2)
        ) {
          // Verify context: is it in the header/store-info?
          // Or just hide it regardless because this name shouldn't appear as a title?
          if (
            el.matches(".store-info *") ||
            el.matches(".store-info__detail *") ||
            tagName === "h1"
          ) {
            el.style.display = "none";
            el.style.setProperty("display", "none", "important");
            el.style.visibility = "hidden";
            el.innerHTML = "";
            console.log("☢️ v10.3 NUCLEAR: HID ELEMENT", el);
          }
        }
      }
    });

    // CSS Fallback enforcing
    const specificHelpers = document.querySelectorAll(".store-info__detail h1");
    specificHelpers.forEach((el) => {
      el.style.display = "none";
      el.style.setProperty("display", "none", "important");
    });
  };

  // Run Immediately
  hideStoreName();

  // Run on Interval (Brute Force) for 20 seconds
  const intervalId = setInterval(hideStoreName, 50);
  setTimeout(() => clearInterval(intervalId), 20000);

  // Run on Mutation
  const observer = new MutationObserver((mutations) => {
    hideStoreName();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 3. React App Loading Logic
  // Check if we are on a Salla specific page where we should NOT load React
  // We accept specific paths or if we detect we are in the checkout flow
  const isSallaPage =
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart") ||
    fullHref.includes("checkout") || // query param robust
    document.querySelector(".store-info"); // Content heuristic

  if (isSallaPage) {
    console.log("💰 Salla Native Page Detected (v10.3) - Stopping React Mount");
    const existingRoot = document.getElementById("root");
    if (existingRoot) existingRoot.remove();
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

  console.log("🚀 Storia Design: Loading React App (Green Mode v10.3)...");

  // 5. Load App
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
