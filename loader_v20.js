/* STORIA DESIGN LOADER v20 - ULTIMATE PRO STABLE */
(function () {
  var p = window.location.pathname.toLowerCase();
  var V = "https://storia-salla.vercel.app";
  var T = Date.now();

  console.log("🚀 Storia Design Loader v20: Starting...");

  var isS =
    p.indexOf("/payment") !== -1 ||
    p.indexOf("/checkout") !== -1 ||
    p.indexOf("/cart") !== -1;

  // 1. Critical Styles
  var s = document.createElement("style");
  s.id = "storia-css";
  s.innerHTML =
    "body { background-color: #0e352f !important; margin: 0; padding: 0; }" +
    "html.storia-ready body { background-color: transparent !important; }" +
    "#root { display: block; width: 100%; min-height: 100vh; position: relative; z-index: 10; }" +
    "#native-preloader { position: fixed; inset: 0; z-index: 999999; background-color: #0e352f; display: flex; align-items: center; justify-content: center; transition: opacity 0.3s ease-out; }" +
    ".storia-spinner { height: 60px; width: auto; filter: brightness(0) invert(1); animation: pulse 1.5s infinite; }" +
    "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }" +
    "html.storia-ready #native-preloader { opacity: 0 !important; pointer-events: none !important; }";

  if (!isS) {
    s.innerHTML +=
      ".store-header, .site-header, .header, .salla-header, .store-footer, .site-footer, .footer, .mobile-menu, .salla-navbar, .app-header, .store-info__name, .merchant-info { display: none !important; }";
  }
  document.head.appendChild(s);

  // 2. Init
  var start = function () {
    if (!document.body) return;

    if (isS) {
      var r = document.getElementById("root");
      if (r) r.remove();
      return;
    }

    // Preloader and Root
    if (!document.getElementById("native-preloader")) {
      var l = document.createElement("div");
      l.id = "native-preloader";
      l.innerHTML =
        '<img src="' + V + '/assets/logo.png" class="storia-spinner" />';
      document.body.prepend(l);
    }
    if (!document.getElementById("root")) {
      var rt = document.createElement("div");
      rt.id = "root";
      document.body.appendChild(rt);
    }

    // Assets
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = V + "/assets/app.css?v=" + T;
    document.head.appendChild(css);

    var js = document.createElement("script");
    js.type = "module";
    js.crossOrigin = "anonymous";
    js.src = V + "/assets/app.js?v=" + T;
    document.body.appendChild(js);

    // Instant Ready Watcher
    var check = setInterval(function () {
      if (document.documentElement.classList.contains("storia-ready")) {
        clearInterval(check);
        var lp = document.getElementById("native-preloader");
        if (lp) {
          setTimeout(function () {
            lp.remove();
          }, 100);
        }
      }
    }, 50);

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

    // Safety
    setTimeout(function () {
      document.documentElement.classList.add("storia-ready");
    }, 3000);
  };

  if (document.body) start();
  else {
    var t = setInterval(function () {
      if (document.body) {
        clearInterval(t);
        start();
      }
    }, 20);
  }
})();
