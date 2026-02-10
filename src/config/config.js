/**
 * Configuration for environment detection
 */

// Check if running on Salla platform (Salla SDK available)
export const IS_SALLA_ENV =
  typeof window !== "undefined" && typeof window.salla !== "undefined";

// Use Salla backend (either on Salla platform or forced via env var)
export const USE_SALLA_BACKEND =
  IS_SALLA_ENV || import.meta.env.VITE_USE_SALLA === "true";

// API Configuration
export const config = {
  useSallaBackend: USE_SALLA_BACKEND,
  isSallaEnv: IS_SALLA_ENV,

  // Logging disabled in production to keep console clean
  enableLogging: false,
};

// Helper to log only when enabled
export const log = (...args) => {
  if (config.enableLogging) {
    console.log("[Storia Config]", ...args);
  }
};
