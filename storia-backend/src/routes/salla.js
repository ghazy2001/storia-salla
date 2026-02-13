const express = require("express");
const router = express.Router();
const SallaAuthService = require("../services/SallaAuthService");

// GET /api/salla/callback - Handle OAuth redirect
router.get("/callback", async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #d9534f;">❌ خطأ في الصلاحيات</h1>
        <p>سلة رفضت الطلب بسبب: <b>${error_description || error}</b></p>
        <p>يرجى التأكد من تفعيل صلاحيات "المنتجات" (قراءة وتعديل) في بوابة الشركاء.</p>
        <button onclick="window.history.back()" style="background: #333; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">العودة للمحاولة</button>
      </div>
    `);
  }

  if (!code) {
    return res.status(400).send("No authorization code provided");
  }

  try {
    await SallaAuthService.exchangeCode(code);
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #0e352f;">✅ تم الاتصال بنجاح!</h1>
        <p>تم استلام مفاتيح سلة وتخزينها بأمان.</p>
        <p>يمكنك الآن العودة إلى لوحة التحكم والبدء في مزامنة المنتجات.</p>
        <button onclick="window.close()" style="background: #d4af37; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">إغلاق النافذة</button>
      </div>
    `);
  } catch (error) {
    console.error("Salla Callback Error:", error);
    res.status(500).send("Failed to exchange Salla authorization code");
  }
});

// GET /api/salla/auth-url - Helper to get authorization URL
router.get("/auth-url", (req, res) => {
  const clientId = process.env.SALLA_CLIENT_ID;
  const redirectUri =
    process.env.SALLA_REDIRECT_URI ||
    "https://storia-salla.fly.dev/api/salla/callback";
  const crypto = require("crypto");
  const state = crypto.randomBytes(16).toString("hex");
  const url = `https://accounts.salla.sa/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=offline_access%20products.read&state=${state}`;
  res.json({ url });
});

// POST /api/salla/sync/products - Trigger product sync
router.post("/sync/products", async (req, res) => {
  try {
    const SallaMerchantService = require("../services/SallaMerchantService");
    const result = await SallaMerchantService.syncAllProducts();
    res.json(result);
  } catch (error) {
    console.error("Salla Sync Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/salla/checkout - Create a redirect URL for Salla checkout
router.post("/checkout", async (req, res) => {
  const { items } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  try {
    // Salla supports adding multiple items via URL:
    // https://domain.com/cart/add?id[]=123&quantity[]=1&id[]=456&quantity[]=2

    // We need the Salla Store URL from environment
    const storeUrl = process.env.SALLA_STORE_URL || "https://storiasa.com";

    const params = new URLSearchParams();
    items.forEach((item) => {
      // Use sallaProductId if available, fallback to item.id
      const id = item.sallaProductId || item.id;
      params.append("id[]", id);
      params.append("quantity[]", item.quantity || 1);
    });

    // The redirect should go to the cart/add page which then takes them to checkout
    // Many Salla themes redirect to cart automatically after add.
    // To go directly to checkout, Salla sometimes supports a 'next' param or we redirect to /checkout after a delay
    // But usually, /cart/add with params is the most compatible way to sync.
    const checkoutUrl = `${storeUrl}/cart/add?${params.toString()}`;

    res.json({
      success: true,
      checkout_url: checkoutUrl,
    });
  } catch (error) {
    console.error("Checkout Redirect Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate checkout URL" });
  }
});

module.exports = router;
