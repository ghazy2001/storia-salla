/* STORIA DESIGN LOADER v22 - NO PRELOADER STABLE */
(function () {
  var p = window.location.pathname.toLowerCase();
  var V = "https://storia-salla.vercel.app";
  var T = Date.now();

  console.log("🚀 Storia Design Loader v22: Immediate Entry...");

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
    "#root { display: block; width: 100%; min-height: 100vh; position: relative; z-index: 10; }";

  if (!isS) {
    s.innerHTML +=
      ".store-header, .site-header, .header, .salla-header, .store-footer, .site-footer, .footer, .mobile-menu, .salla-navbar, .app-header, .store-info__name, .merchant-info { display: none !important; }";
  }
  document.head.appendChild(s);

  // 2. Init
  var start = function () {
    if (!document.body) return;

    if (isS) return;

    // Root element if not present
    var existingRoot = document.getElementById("root");
    if (!existingRoot) {
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

    // Instant signal to show app content
    document.documentElement.classList.add("storia-ready");
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
