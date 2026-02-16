/* STORIA DESIGN LOADER v13.2 - HYPER STABILITY */
(function () {
  const path = window.location.pathname.toLowerCase();
  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v13.2: Hyper Init...");

  const isSallaPage =
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart");

  // 1. Force Styles Immediately
  const style = document.createElement("style");
  style.id = "storia-critical-css";
  style.innerHTML = `
    html, body { background-color: #0e352f !important; color: white !important; margin: 0; padding: 0; }
    #root { display: block !important; width: 100%; min-height: 100vh; position: relative; z-index: 10; }
    #native-preloader {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #0e352f;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.5s ease-out;
    }
    .storia-logo-spinner {
        height: 60px; width: auto;
        filter: brightness(0) invert(1);
        animation: storia-pulse 2s infinite;
    }
    @keyframes storia-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.95); }
    }
    html.storia-ready #native-preloader { opacity: 0 !important; pointer-events: none !important; }
    ${
      !isSallaPage
        ? `
    header, footer, .salla-header, .salla-footer, #main-nav, .store-header, .store-footer, .store-info__name {
        display: none !important;
    }
    `
        : ""
    }
  `;
  document.head.appendChild(style);

  // 2. Wait for Body and Inject Root
  let assetsLoaded = false;
  const injectBases = () => {
    if (!document.body) return;

    // Create Root
    if (!document.getElementById("root")) {
      const root = document.createElement("div");
      root.id = "root";
      document.body.appendChild(root);
    }

    // Create Preloader
    if (!isSallaPage && !document.getElementById("native-preloader")) {
      const preloader = document.createElement("div");
      preloader.id = "native-preloader";
      preloader.innerHTML =
        '<img src="' +
        VERCEL_URL +
        '/assets/logo.png" class="storia-logo-spinner" />';
      document.body.prepend(preloader);
    }

    // Load App Assets (Once)
    if (!assetsLoaded && !isSallaPage) {
      assetsLoaded = true;
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = VERCEL_URL + "/assets/app.css?v=" + TIMESTAMP;
      document.head.appendChild(css);

      const js = document.createElement("script");
      js.type = "module";
      js.src = VERCEL_URL + "/assets/app.js?v=" + TIMESTAMP;
      js.crossOrigin = "anonymous";
      document.body.appendChild(js);
    }
  };

  // Run immediately and keep checking until body is ready
  injectBases();
  const bodyChecker = setInterval(() => {
    if (document.body) {
      injectBases();
      clearInterval(bodyChecker);
    }
  }, 50);

  // 3. Observer for final cleanup
  const observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains("storia-ready")) {
      setTimeout(() => {
        const lp = document.getElementById("native-preloader");
        if (lp) lp.remove();
      }, 1000);
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // 4. Safety Fail-safe
  setTimeout(
    () => document.documentElement.classList.add("storia-ready"),
    8000,
  );
})();
