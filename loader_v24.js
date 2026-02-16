/* STORIA DESIGN LOADER v24 - ANTI-WHITE-SCREEN */
(function () {
  var p = window.location.pathname.toLowerCase();
  var v = "https://storia-salla.vercel.app";
  var i = Date.now();

  // 1. لو على صفحة المنتج أو الستور، استخدم React App
  if (p.includes("/product/") || p.includes("/store")) {
    // Redirect to React App
    window.location.href = v + "/#" + p;
    return;
  }

  // 2. إضافة Preload (بس للصفحات اللي محتاجة)
  if (!p.includes("/cart") && !p.includes("/checkout")) {
    var style = document.createElement("style");
    style.innerHTML = `
      html, body { background-color: #b6252f !important; }
      #storia-preload { 
        position: fixed; 
        inset: 0; 
        z-index: 999999; 
        background: #b6252f; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        transition: opacity 0.5s ease;
      }
      #storia-preload.hide {
        opacity: 0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    var preCSS = document.createElement("link");
    preCSS.rel = "modulepreload";
    preCSS.href = v + "/assets/app.css?v=" + i;
    document.head.appendChild(preCSS);
  }

  // 3. إزالة الـ Preloader لما الصفحة تحمل
  var init = function () {
    var preloader = document.getElementById("storia-preload");
    if (preloader) {
      // إخفاء الـ Preloader
      preloader.classList.add("hide");

      // إزالته تماماً بعد 0.5 ثانية
      setTimeout(function () {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 500);
    }

    // إزالة الـ background الأحمر
    document.body.style.backgroundColor = "";
    document.documentElement.style.backgroundColor = "";
  };

  // 4. تشغيل init لما كل حاجة تحمل
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init);
  }

  // 5. Fallback: لو الصفحة أخدت وقت طويل، اشيل الـ Preloader جبراً
  setTimeout(function () {
    init();
  }, 3000); // بعد 3 ثواني على الأكثر
})();
