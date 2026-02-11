/**
 * Theme Utility Functions
 * Centralizes theme-dependent styling logic to reduce code repetition
 */

/**
 * Generic theme conditional helper
 * @param {string} theme - Current theme ("green" or "burgundy")
 * @param {string} greenValue - Value for green theme
 * @param {string} burgundyValue - Value for burgundy theme
 * @returns {string} Appropriate value based on theme
 */
export const getThemeValue = (theme, greenValue, burgundyValue) =>
  theme === "green" ? greenValue : burgundyValue;

/**
 * Get background color class based on theme
 */
export const getBackgroundClass = (theme) =>
  getThemeValue(theme, "bg-brand-offwhite", "bg-brand-burgundy");

/**
 * Get text color class based on theme
 */
export const getTextClass = (theme) =>
  getThemeValue(theme, "text-brand-charcoal", "text-white");

/**
 * Get secondary background (for cards, sections)
 */
export const getSecondaryBgClass = (theme) =>
  getThemeValue(theme, "bg-white", "bg-brand-burgundy");

/**
 * Get button theme classes
 */
export const getButtonTheme = (theme) =>
  getThemeValue(
    theme,
    "bg-brand-charcoal/5 text-brand-charcoal",
    "bg-brand-gold/20 text-brand-gold",
  );

/**
 * Get border color based on theme
 */
export const getBorderClass = (theme) =>
  getThemeValue(theme, "border-brand-charcoal/20", "border-white/20");

/**
 * Get hover background for buttons
 */
export const getHoverBgClass = (theme) =>
  getThemeValue(theme, "hover:bg-brand-charcoal", "hover:bg-white");

/**
 * Get hover text color for buttons
 */
export const getHoverTextClass = (theme) =>
  getThemeValue(theme, "hover:text-white", "hover:text-brand-burgundy");

/**
 * Get opacity-adjusted text class
 */
export const getTextOpacityClass = (theme, opacity = 60) =>
  getThemeValue(
    theme,
    `text-brand-charcoal/${opacity}`,
    `text-white/${opacity}`,
  );

/**
 * Get logo filter based on theme
 */
export const getLogoFilter = (theme, isTransparent = false) => {
  if (isTransparent) return "brightness-0 invert";
  return getThemeValue(theme, "", "brightness-0 invert");
};

/**
 * Get card background with optional border
 */
export const getCardClass = (theme) =>
  getThemeValue(theme, "bg-white", "bg-brand-burgundy border border-white/10");
