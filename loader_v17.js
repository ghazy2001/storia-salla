/* STORIA DESIGN LOADER v17 - THE PROFESSIONAL STABLE SPEED */
(function () {
  const path = window.location.pathname.toLowerCase();
  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v17: Final Pro Speed...");

  const isSallaPage =
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart");

  // 1. Mandatory UI Styles
  const style = document.createElement("style");
  style.id = "storia-preloader-style";
  style.innerHTML =
    "html, body { background-color: #0e352f !important; margin: 0; padding: 0; }" +
    "#root { display: block; width: 100%; height: 100%; }" +
    "#native-preloader { position: fixed; inset: 0; z-index: 999999; background-color: #0e352f; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s ease-out; }" +
    ".storia-logo-spinner { height: 4rem; width: auto; filter: brightness(0) invert(1); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }" +
    "@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.95); } }" +
    "html.storia-ready #native-preloader { opacity: 0 !important; pointer-events: none !important; }";

  if (!isSallaPage) {
    style.innerHTML +=
      ".store-header, .site-header, .header, .salla-header, .store-footer, .site-footer, .footer, .mobile-menu, .salla-navbar, .app-header, .store-info__name, .merchant-info { display: none !important; }";
  }
  document.head.appendChild(style);

  // 2. Initialization
  const init = () => {
    if (!document.body) return;

    // Name Removal
    const hideName = () => {
      const targets = ["Mahmoud Ghazy", "محمود غازي"];
      document
        .querySelectorAll("h1, h2, h3, span, p, .store-info__name")
        .forEach((el) => {
          if (targets.some((t) => el.textContent.includes(t))) {
            el.style.setProperty("display", "none", "important");
          }
        });
    };
    hideName();
    setInterval(hideName, 2000);

    if (isSallaPage) {
      const root = document.getElementById("root");
      if (root) root.remove();
      return;
    }

    // Preloader Injection (Exact V14 structure)
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

    // Root Container (Exact V14 structure)
    let root = document.getElementById("root");
    if (!root) {
      root = document.createElement("div");
      root.id = "root";
      document.body.appendChild(root);
    }

    // Loading Assets
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = VERCEL_URL + "/assets/app.css?v=" + TIMESTAMP;
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.type = "module";
    script.crossOrigin = "anonymous";
    script.src = VERCEL_URL + "/assets/app.js?v=" + TIMESTAMP;
    document.body.appendChild(script);

    // Watch for Ready Signal (EXACT V14 structure with faster timings)
    const readyCheck = setInterval(() => {
      if (document.documentElement.classList.contains("storia-ready")) {
        setTimeout(() => {
          const lp = document.getElementById("native-preloader");
          if (lp) lp.remove();
        }, 200); // 200ms instead of 1000ms
        clearInterval(readyCheck);
      }
    }, 100);

    // Safety Timeout
    setTimeout(
      () => document.documentElement.classList.add("storia-ready"),
      2500,
    ); // 2.5s instead of 8s
  };

  if (document.body) init();
  else {
    const checker = setInterval(() => {
      if (document.body) {
        clearInterval(checker);
        init();
      }
    }, 50);
  }
})();
