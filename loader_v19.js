/* STORIA DESIGN LOADER v19 - STABLE INSTANT PRO */
(function () {
  var path = window.location.pathname.toLowerCase();
  var VERCEL_URL = "https://storia-salla.vercel.app";
  var TIMESTAMP = Date.now();

  console.log("🚀 Storia Design Loader v19: Initializing...");

  var isSallaPage =
    path.indexOf("/payment") !== -1 ||
    path.indexOf("/checkout") !== -1 ||
    path.indexOf("/cart") !== -1;

  // 1. Mandatory UI Styles (Consistent Green)
  var style = document.createElement("style");
  style.id = "storia-critical-style";
  style.innerHTML =
    "html, body { background-color: #0e352f !important; margin: 0; padding: 0; }" +
    "#root { display: block; width: 100%; min-height: 100vh; position: relative; z-index: 10; }" +
    "#native-preloader { position: fixed; inset: 0; z-index: 999999; background-color: #0e352f; display: flex; align-items: center; justify-content: center; transition: opacity 0.4s ease-out; }" +
    ".storia-spinner { height: 60px; width: auto; filter: brightness(0) invert(1); animation: pulse 1.5s ease-in-out infinite; }" +
    "@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.96); } }" +
    "html.storia-ready #native-preloader { opacity: 0 !important; pointer-events: none !important; }";

  if (!isSallaPage) {
    style.innerHTML +=
      ".store-header, .site-header, .header, .salla-header, .store-footer, .site-footer, .footer, .mobile-menu, .salla-navbar, .app-header, .store-info__name, .merchant-info { display: none !important; }";
  }
  document.head.appendChild(style);

  // 2. Initialization Function
  var start = function () {
    if (!document.body) return;

    // Name Removal
    var hide = function () {
      var t = ["Mahmoud Ghazy", "محمود غازي"];
      var els = document.querySelectorAll("h1, h2, span, p, .store-info__name");
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        for (var j = 0; j < t.length; j++) {
          if (el.textContent.indexOf(t[j]) !== -1) {
            el.style.setProperty("display", "none", "important");
          }
        }
      }
    };
    hide();
    setInterval(hide, 2000);

    if (isSallaPage) {
      var r = document.getElementById("root");
      if (r) r.remove();
      return;
    }

    // Preloader Injection
    var lp = document.getElementById("native-preloader");
    if (!lp) {
      lp = document.createElement("div");
      lp.id = "native-preloader";
      lp.innerHTML =
        '<img src="' +
        VERCEL_URL +
        '/assets/logo.png" class="storia-spinner" />';
      document.body.prepend(lp);
    }

    // Root Container
    if (!document.getElementById("root")) {
      var rt = document.createElement("div");
      rt.id = "root";
      document.body.appendChild(rt);
    }

    // Load Assets
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = VERCEL_URL + "/assets/app.css?v=" + TIMESTAMP;
    document.head.appendChild(l);

    var s = document.createElement("script");
    s.type = "module";
    s.crossOrigin = "anonymous";
    s.src = VERCEL_URL + "/assets/app.js?v=" + TIMESTAMP;
    document.body.appendChild(s);

    // Watch for Ready Signal (Instant)
    var c = setInterval(function () {
      if (document.documentElement.classList.contains("storia-ready")) {
        clearInterval(c);
        var p = document.getElementById("native-preloader");
        if (p) {
          // Instant removal for that requested fast feel
          setTimeout(function () {
            p.remove();
          }, 100);
        }
      }
    }, 50);

    // Safety
    setTimeout(function () {
      document.documentElement.classList.add("storia-ready");
    }, 3500);
  };

  // Run or wait for body
  if (document.body) start();
  else {
    var b = setInterval(function () {
      if (document.body) {
        clearInterval(b);
        start();
      }
    }, 20);
  }
})();
