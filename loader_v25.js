/* STORIA DESIGN LOADER v25 - ANTI-WHITE-SCREEN + AUTO-CLEANUP */
(function () {
  var p = window.location.pathname.toLowerCase();
  var V = "https://storia-salla.vercel.app";
  var T = Date.now();
  var isS =
    p.indexOf("/payment") !== -1 ||
    p.indexOf("/checkout") !== -1 ||
    p.indexOf("/cart") !== -1;

  if (isS) return;

  // 1. منع الشاشة البيضاء عن طريق تثبيت لون الخلفية فوراً في الـ Head
  var style = document.createElement("style");
  style.innerHTML = `
    html, body { background-color: #0e352f !important; } 
    #root:empty { min-height: 100vh; background-color: #0e352f !important; }
    .store-header, .site-header, .header, .salla-header, .store-footer, .footer { display: none !important; }
    #storia-preload.fade-out { 
      opacity: 0 !important; 
      transition: opacity 0.5s ease !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);

  // 2. تقنية Preload: إجبار المتصفح على تحميل الملفات فوراً بأولوية قصوى
  var preCSS = document.createElement("link");
  preCSS.rel = "preload";
  preCSS.as = "style";
  preCSS.href = V + "/assets/app.css?v=" + T;
  document.head.appendChild(preCSS);

  var preJS = document.createElement("link");
  preJS.rel = "modulepreload";
  preJS.href = V + "/assets/app.js?v=" + T;
  document.head.appendChild(preJS);

  // 3. وظيفة لإزالة الـ Preloader
  var removePreloader = function () {
    var preloader = document.getElementById("storia-preload");
    if (preloader) {
      console.log("[Storia] Removing preloader...");
      preloader.classList.add("fade-out");
      setTimeout(function () {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
          console.log("[Storia] Preloader removed!");
        }
      }, 500);
    }
  };

  // 4. مراقبة الـ React App للتأكد من جاهزيته
  var checkReactReady = function () {
    var root = document.getElementById("root");
    var isReady = document.documentElement.classList.contains("storia-ready");
    var hasContent = root && root.children.length > 0;

    if (isReady || hasContent) {
      console.log("[Storia] React app is ready!");
      removePreloader();
      return true;
    }
    return false;
  };

  var init = function () {
    if (!document.getElementById("root")) {
      var rt = document.createElement("div");
      rt.id = "root";
      document.body.prepend(rt);
    }

    // إضافة الروابط الفعلية بعد الـ Preload
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = V + "/assets/app.css?v=" + T;

    var js = document.createElement("script");
    js.type = "module";
    js.src = V + "/assets/app.js?v=" + T;

    document.head.appendChild(css);
    document.body.appendChild(js);

    // 5. مراقبة جاهزية الـ React App
    var observer = new MutationObserver(function () {
      if (checkReactReady()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    observer.observe(document.getElementById("root"), {
      childList: true,
      subtree: true,
    });

    // 6. فحص فوري
    setTimeout(checkReactReady, 100);
  };

  // 7. Fallback Timer: إزالة الـ Preloader جبراً بعد 3 ثواني
  setTimeout(function () {
    console.log("[Storia] Fallback timer triggered");
    removePreloader();
  }, 3000);

  // التشغيل بأسرع وقت ممكن
  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
