/* STORIA DESIGN LOADER v16 - INSTANT PRO MODE */
(function () {
  const path = window.location.pathname.toLowerCase();
  const VERCEL_URL = "https://storia-salla.vercel.app";
  const TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v16: Instant Pro");

  const isSallaPage =
    path.includes("/payment") ||
    path.includes("/checkout") ||
    path.includes("/cart");

  // 1. Core Styles
  const style = document.createElement("style");
  style.id = "storia-style";
  style.innerHTML = `
    html, body { background-color: #0e352f !important; margin: 0; padding: 0; height: 100%; }
    #root { display: block; width: 100%; height: 100%; }
    #native-preloader {
        position: fixed; inset: 0; z-index: 999999;
        background-color: #0e352f;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.3s ease-in-out, visibility 0.3s;
    }
    .storia-logo-spinner {
        height: 60px; width: auto;
        filter: brightness(0) invert(1);
        animation: storia-pulse 1.5s ease-in-out infinite;
    }
    @keyframes storia-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.96); }
    }
    #native-preloader.storia-out {
        opacity: 0 !important;
        visibility: hidden !important;
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

  // 2. Fast Init
  const start = () => {
    if (!document.body) return;

    if (isSallaPage) {
      const root = document.getElementById("root");
      if (root) root.remove();
      return;
    }

    // Preloader Init (Sync)
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

    // Root Init (Sync)
    if (!document.getElementById("root")) {
      const r = document.createElement("div");
      r.id = "root";
      document.body.appendChild(r);
    }

    // Asset Loading
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = VERCEL_URL + "/assets/app.css?v=" + TIMESTAMP;
    document.head.appendChild(l);

    const s = document.createElement("script");
    s.type = "module";
    s.crossOrigin = "anonymous";
    s.src = VERCEL_URL + "/assets/app.js?v=" + TIMESTAMP;
    document.body.appendChild(s);

    // INSTANT REMOVAL on 'storia-ready'
    const check = setInterval(() => {
      if (document.documentElement.classList.contains("storia-ready")) {
        clearInterval(check);
        const lp = document.getElementById("native-preloader");
        if (lp) {
          lp.classList.add("storia-out");
          setTimeout(() => lp.remove(), 400); // Fully remove after fade
        }
      }
    }, 30);

    // Name Removal
    const hide = () => {
      const t = ["Mahmoud Ghazy", "محمود غازي"];
      document
        .querySelectorAll("h1, h2, span, p, .store-info__name")
        .forEach((el) => {
          if (t.some((x) => el.textContent.includes(x))) {
            el.style.setProperty("display", "none", "important");
          }
        });
    };
    hide();
    setInterval(hide, 1500);
  };

  if (document.body) start();
  else {
    const t = setInterval(() => {
      if (document.body) {
        clearInterval(t);
        start();
      }
    }, 20);
  }
})();
