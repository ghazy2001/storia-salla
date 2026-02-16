/* STORIA DESIGN LOADER v13.1 - STABILITY FIX */
(function () {
  const path = window.location.pathname.toLowerCase();
  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v13.1: Stabilizing...");

  // 1. Identify Page Type
  const isSallaPage =
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart");

  // 2. Inject Styles Immediately
  const style = document.createElement("style");
  style.id = "storia-preloader-style";
  style.innerHTML = `
    html, body { background-color: #0e352f !important; margin: 0; padding: 0; }
    #root { display: block; width: 100%; height: 100%; position: relative; z-index: 10; }
    
    #native-preloader {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #0e352f;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.5s ease-out;
    }
    .storia-logo-spinner {
        height: 4rem; width: auto;
        filter: brightness(0) invert(1);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.95); }
    }
    html.storia-ready #native-preloader {
        opacity: 0 !important;
        pointer-events: none !important;
    }
    ${
      !isSallaPage
        ? `
    .store-header, .site-header, .header, .salla-header,
    .store-footer, .site-footer, .footer,
    .mobile-menu, .salla-navbar, .app-header,
    .store-info__name, .merchant-info {
        display: none !important;
    }
    `
        : ""
    }
  `;
  document.head.appendChild(style);

  // 3. Ensure Root and Preloader Exist
  if (!isSallaPage) {
    // PRELOADER
    let preloader = document.getElementById("native-preloader");
    if (!preloader) {
      preloader = document.createElement("div");
      preloader.id = "native-preloader";
      preloader.innerHTML =
        '<img src="' +
        VERCEL_URL +
        '/assets/logo.png" class="storia-logo-spinner" />';
      document.body.prepend(preloader);
    }

    // ROOT (CRITICAL FOR REACT)
    if (!document.getElementById("root")) {
      const root = document.createElement("div");
      root.id = "root";
      document.body.appendChild(root);
    }
  }

  // 4. Name Removal logic
  const hideName = () => {
    const targets = ["Mahmoud Ghazy", "محمود غازي"];
    document
      .querySelectorAll("h1, span, p, .store-info__name")
      .forEach((el) => {
        if (targets.some((t) => el.textContent.includes(t))) {
          el.style.display = "none";
        }
      });
  };
  hideName();
  setInterval(hideName, 2000);

  if (isSallaPage) return;

  // 5. Load App Assets
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = VERCEL_URL + "/assets/app.css?v=" + TIMESTAMP;
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.type = "module";
  script.crossOrigin = "anonymous";
  script.src = VERCEL_URL + "/assets/app.js?v=" + TIMESTAMP;
  document.body.appendChild(script);

  // 6. Atomic Cleanup
  const observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains("storia-ready")) {
      setTimeout(() => {
        const lp = document.getElementById("native-preloader");
        if (lp) lp.remove();
      }, 600);
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // 7. Safety Timeout (Fallback)
  setTimeout(() => {
    document.documentElement.classList.add("storia-ready");
  }, 5000);
})();
