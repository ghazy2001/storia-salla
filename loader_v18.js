/* STORIA DESIGN LOADER v18 - INSTANT ULTIMATE SPEED */
(function () {
  const path = window.location.pathname.toLowerCase();
  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v18: Instant Ready Mode");

  const isSallaPage =
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart");

  // 1. Core Styles (Green baseline)
  const style = document.createElement("style");
  style.id = "storia-style";
  style.innerHTML = `
    html, body { background-color: #0e352f !important; margin: 0; padding: 0; height: 100%; }
    #root { display: block; width: 100%; min-height: 100vh; position: relative; z-index: 10; }
    #native-preloader {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #0e352f;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.3s ease-in-out;
    }
    .storia-logo-spinner {
        height: 60px; width: auto;
        filter: brightness(0) invert(1);
        animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.96); }
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
    .store-info__name, .merchant-info, .salla-theme-preview-bar {
        display: none !important;
    }
    `
        : ""
    }
  `;
  document.head.appendChild(style);

  // 2. Immediate Setup
  const setup = () => {
    if (!document.body) return;

    if (isSallaPage) {
      const root = document.getElementById("root");
      if (root) root.remove();
      return;
    }

    // Preloader (Sync)
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

    // Root (Sync)
    if (!document.getElementById("root")) {
      const r = document.createElement("div");
      r.id = "root";
      document.body.appendChild(r);
    }

    // App Loading (Parallel)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = VERCEL_URL + "/assets/app.css?v=" + TIMESTAMP;
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.type = "module";
    script.crossOrigin = "anonymous";
    script.src = VERCEL_URL + "/assets/app.js?v=" + TIMESTAMP;
    document.body.appendChild(script);

    // SMARTER Name Removal (Mutation Observer)
    const hide = () => {
      const terms = ["Mahmoud Ghazy", "محمود غازي"];
      document
        .querySelectorAll("h1, h2, span, p, .store-info__name")
        .forEach((el) => {
          if (terms.some((t) => el.textContent.includes(t))) {
            el.style.setProperty("display", "none", "important");
          }
        });
    };
    hide();
    const observer = new MutationObserver(hide);
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(hide, 2000);

    // Watch for Ready Signal (Already optimized in React)
    const checkReady = setInterval(() => {
      if (document.documentElement.classList.contains("storia-ready")) {
        clearInterval(checkReady);
        const lp = document.getElementById("native-preloader");
        if (lp) {
          // Almost instant removal for professional feel
          setTimeout(() => lp.remove(), 100);
        }
      }
    }, 50);

    // Fail-safe (Speedy)
    setTimeout(
      () => document.documentElement.classList.add("storia-ready"),
      5000,
    );
  };

  if (document.body) setup();
  else {
    const t = setInterval(() => {
      if (document.body) {
        clearInterval(t);
        setup();
      }
    }, 20);
  }
})();
